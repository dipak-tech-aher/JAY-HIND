require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
// const logger = require('morgan');
const fs = require('fs')
const cors = require('cors')
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const customCss = fs.readFileSync((process.cwd() + "/swagger.css"), 'utf8');

const { ROUTES } = require("./routes");

const { setupLogging } = require("./logging");
const { setupRateLimit } = require("./ratelimit");
const { setupCreditCheck } = require("./creditcheck");
const { setupProxies } = require("./proxy");
const { setupAuth } = require("./auth");

const app = express()

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))

const port = process.env.API_GATEWAY_SERVICE_PORT;

setupLogging(app);
setupRateLimit(app, ROUTES);
setupAuth(app, ROUTES);
setupCreditCheck(app, ROUTES);
setupProxies(app, ROUTES);
app.disable('x-powered-by')
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.listen(port, (err) => {
  if (err) {
    logger.error('Error occured while starting server: ', err)
    return
  }
  console.log(`Server started in port no:` + port)
})