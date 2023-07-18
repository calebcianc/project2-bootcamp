# Dollar Direction

An expense tracker application that can track expenses and location. <br>
Deployment page: [Dollar Direction](https://project2-bootcamp.vercel.app/)

## Preview

![DD gif](./src/Reference/DollarDirection.gif)

## Features

- Add, edit and delete expenses
- Markers will be displayed on map for each added expenses according to the legend
- Change display currencies
- Filter and export expenses
- Dashboards to view expenses view by daily, monthly and yearly
  - bargraph to show expenses by time period
  - pie chart to show expenses by category
- customise category with emoji and color

## Tech Used

- Front end: [React](https://react.dev/)
- Routing: [React Router](https://reactrouter.com/en/main)
- UI: [React Bootstrap](https://react-bootstrap.github.io/)
- Storage/Database/Auth: [Firebase](https://firebase.google.com/)
- Map API: [Google Maps](https://developers.google.com/maps)
- Currency API: [Currency](https://secure.mas.gov.sg/api/APIDESCPAGE.ASPX?RESOURCE_ID=2f0d9ccd-4190-41fd-a53d-2a319934ca6c)

## Setup

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app). In the project directory, you can run the following steps for the application to work:

1. Clone repo to local

2. Configure `.env` file, make sure to get your own API keys stated below and insert it into your `.env` file

```
REACT_APP_API_KEY = <API key>
REACT_APP_AUTH_DOMAIN =  <API key>
REACT_APP_DATABASE_URL =  <API key>
REACT_APP_PROJECT_ID =  <API key>
REACT_APP_STORAGE_BUCKET =  <API key>
REACT_APP_MESSAGING_SENDER_ID = <API key>
REACT_APP_APP_ID =  <API key>
REACT_APP_EXCHANGE_API_KEY= <API key>
```

3. Install all dependencies required in this repo, and run locally

```
npm i
```

Enter 'npm start' into Terminal to render the app.
Open http://localhost:3000 to view it in your browser.

## Contributers

- [Caleb Castro](https://github.com/calebcianc)
- [Chloe Li](https://github.com/khloeli)
