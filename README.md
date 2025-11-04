# stockdash  
A React web application for selecting a company & account, viewing balance and recent transactions.

## Table of Contents  
- [Description](#description)  
- [Features](#features)  
- [Technologies Used](#technologies-used)  
- [Folder Structure](#folder-structure)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation) 
- [Running Locally](#running-locally)
- [Building for Production](#building-for-production)  
- [Usage](#usage)  
- [Screenshots](#screenshots)  
- [Troubleshooting & Notes](#troubleshooting-&-notes)  
- [License](#license)

## Description  
This project presents a dashboard built in React where a user selects a company from a dropdown, then selects an account. The app then displays a simulated “Available Balance” (in Indian Rupee format) and a table listing recent transactions (date/time, credit, balance, UTR/UPI). The project is built for learning, showcasing UI logic and API-data handling.

## Features  
- Company dropdown populated from a public API.  
- Account dropdown dynamically enabled and populated based on company selection.  
- Randomly generated available balance shown in INR format.  
- Transaction table with sample entries including date/time, credit amount, account balance, UTR and UPI.  
- Responsive layout with sidebar navigation and main content area.

## Technologies Used  
- React  
- JavaScript (ES6+)  
- CSS (including responsive design)  
- Public REST API: [jsonplaceholder.typicode.com/users](https://jsonplaceholder.typicode.com/users)  
- No backend required (pure front-end demo)

## Folder Structure  
/ (project root)
├── package.json
├── .gitignore
├── README.md
├── /public
│ └── index.html
└── /src
├── App.js
├── index.js
├── components/
└── styles/

## Prerequisites  
- Node.js (version 14 or higher) and npm (or Yarn) installed.  
- Internet connection (to fetch demo data from the public API).

## Installation  
```bash
git clone https://github.com/roopa6302/stock.git  
cd stock  
npm install  
# or  
yarn install
 **Running Locally**
npm start  
# or  
yarn start
 **Building for Production**
npm run build  
# or  
yarn build  






