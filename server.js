// Template code for setting up a back-end server
// To run this code, in the back-end server terminal, type node server.js
// Before running this code, install the following middlewares with the npm install command:
// express
// body-parser
// cors
// errorhandler
// morgan

// Dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const errorHandler = require('errorhandler');

const menusRouter = require('./api/menus');

// Set up Express.js
const app = express();

// Parse HTTP request bodies in JSON format
app.use(bodyParser.json());

// Set up CORS
app.use(cors());

// Log information on HTTP request-response cycles
app.use(morgan('dev'));

// Set up main routers
app.use('/api/menus', menusRouter);

// Handle errors
app.use(errorHandler());

// Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
