import React, { useEffect, useState, useRef } from "react";
import "./App.css";

const SUPPORTED_TICKERS = ["GOOG", "TSLA", "AMZN", "META", "NVDA"];
const STORAGE_SUB_KEY = (email) => `sb_subscriptions_${email}`;

export default function App() {
  const [email, setEmail] = useState("");
  const [loggedInEmail, setLoggedInEmail] = useState(null);
  const [subscriptions, setSubscriptions] = useState([]);
  const [prices, setPrices] = useState({});
  const [lastUpdated, setLastUpdated] = useState({});
  const intervalRef = useRef();
  const bcRef = useRef();

 
  useEffect(() => {
    const saved = localStorage.getItem("sb_last_email");
    if (saved) setEmail(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      bcRef.current = new BroadcastChannel("sb_channel");
      bcRef.current.onmessage = (ev) => {
        const msg = ev.data || {};
        if (msg.type === "subscriptions_updated" && msg.email === loggedInEmail) {
          const subs = loadSubscriptions(loggedInEmail);
          setSubscriptions(subs || []);
        }
        if (msg.type === "price_broadcast") {
          setPrices((p) => ({ ...p, [msg.ticker]: msg.price }));
          setLastUpdated((lu) => ({ ...lu, [msg.ticker]: msg.time }));
        }
      };
    }
    return () => {
      if (bcRef.current) bcRef.current.close();
    };
  }, [loggedInEmail]);

  function saveSubscriptions(email, subs) {
    localStorage.setItem(STORAGE_SUB_KEY(email), JSON.stringify(subs));
    if (bcRef.current) {
      bcRef.current.postMessage({ type: "subscriptions_updated", email, subs });
    }
  }

  function loadSubscriptions(email) {
    const raw = localStorage.getItem(STORAGE_SUB_KEY(email));
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  function handleLogin(e) {
    e.preventDefault();
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      alert("Please enter a valid email.");
      return;
    }
    localStorage.setItem("sb_last_email", email);
    setLoggedInEmail(email);
    const subs = loadSubscriptions(email);
    setSubscriptions(subs || []);

    // Initialize random base prices
    const initialPrices = {};
    SUPPORTED_TICKERS.forEach((t) => {
      const base = { GOOG: 135, TSLA: 260, AMZN: 100, META: 240, NVDA: 380 }[t] || 100;
      initialPrices[t] = base + Math.round(Math.random() * 10 - 5);
    });
    setPrices((p) => ({ ...initialPrices, ...p }));
  }

  function toggleSubscription(ticker) {
    if (!loggedInEmail) return;
    setSubscriptions((prev) => {
      const next = prev.includes(ticker)
        ? prev.filter((t) => t !== ticker)
        : [...prev, ticker];
      saveSubscriptions(loggedInEmail, next);
      return next;
    });
  }

  // Price simulation
  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!loggedInEmail) return;

    intervalRef.current = setInterval(() => {
      setPrices((curPrices) => {
        const next = { ...curPrices };
        const now = new Date().toLocaleTimeString();
        subscriptions.forEach((t) => {
          const old = typeof next[t] === "number" ? next[t] : 100 + Math.random() * 10;
          const changePct = (Math.random() - 0.5) * 0.02; // +/-1%
          const newPrice = +(old * (1 + changePct)).toFixed(2);
          next[t] = newPrice;
          setLastUpdated((lu) => ({ ...lu, [t]: now }));
          if (bcRef.current) {
            bcRef.current.postMessage({
              type: "price_broadcast",
              ticker: t,
              price: newPrice,
              time: now,
              from: loggedInEmail,
            });
          }
        });
        return next;
      });
    }, 1000);

    return () => {
      clearInterval(intervalRef.current);
    };
  }, [loggedInEmail, subscriptions.join(",")]);

  function handleLogout() {
    setLoggedInEmail(null);
    setSubscriptions([]);
    setPrices({});
    setLastUpdated({});
  }

  function renderLogin() {
    return (
      <div className="max-w-md mx-auto mt-12 bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-4">Stock Broker Client Dashboard — Login</h1>
        <form onSubmit={handleLogin} className="space-y-4">
          <label className="block">
            <div className="text-sm text-gray-600">Email</div>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="mt-1 w-full px-3 py-2 border rounded-lg"
            />
          </label>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 rounded-lg bg-sky-600 text-white">
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setEmail("");
                localStorage.removeItem("sb_last_email");
              }}
              className="px-4 py-2 rounded-lg border"
            >
              Clear
            </button>
          </div>
          <div className="text-xs text-gray-500">
            Demo: login with any email. Subscriptions are stored per-email in localStorage.
          </div>
        </form>
      </div>
    );
  }

  function renderDashboard() {
    return (
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold">Hello, {loggedInEmail}</h2>
            <div className="text-sm text-gray-500">
              Active subscriptions: {subscriptions.length}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleLogout} className="px-3 py-2 rounded-lg border">
              Logout
            </button>
            <button
              onClick={() => {
                const subs = loadSubscriptions(loggedInEmail);
                alert(JSON.stringify(subs));
              }}
              className="px-3 py-2 rounded-lg border"
            >
              Show Stored Subs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="col-span-1 bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Supported Stocks</h3>
            <div className="flex flex-col gap-2">
              {SUPPORTED_TICKERS.map((t) => (
                <label key={t} className="flex items-center justify-between border p-2 rounded">
                  <div>
                    <div className="font-medium">{t}</div>
                    <div className="text-xs text-gray-500">
                      {prices[t] ? `Price: $${prices[t]}` : "Not tracked yet"}
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={subscriptions.includes(t)}
                    onChange={() => toggleSubscription(t)}
                    className="w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>

          <div className="col-span-1 md:col-span-2 bg-white p-4 rounded-xl shadow">
            <h3 className="font-semibold mb-2">Your Live Prices</h3>
            {subscriptions.length === 0 ? (
              <div className="text-gray-500">
                You have no subscriptions. Tick the boxes on the left to add stocks.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {subscriptions.map((t) => (
                  <div key={t} className="border p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">{t}</div>
                        <div className="text-xs text-gray-500">
                          Last: {lastUpdated[t] || "—"}
                        </div>
                      </div>
                      <div className="text-lg font-bold">${prices[t] ?? "—"}</div>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Change simulated each second (random-walk)
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto py-10 px-4">
        <header className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-extrabold">Stock Broker Client Dashboard</h1>
          <div className="text-sm text-gray-500">
            Demo — Simulated prices • No backend required
          </div>
        </header>
        {!loggedInEmail ? renderLogin() : renderDashboard()}
      </div>
    </div>
  );
}
