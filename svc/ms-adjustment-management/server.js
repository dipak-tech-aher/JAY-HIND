import 'babel-polyfill';
import express from 'express';
import bodyParser from 'body-parser';
import { config } from '@config/env.config';
import { logger } from '@utils';

const app = express();
const port = config.bcae.port;
const routes = require('./app');
const cors = require('cors');
const { destroyNamespace } = require('continuation-local-storage')
app.use(cors());
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', routes);

app.listen(port, (err) => {
	if (err) {
		logger.error('Error occured while starting server: ', err);
		return;
	}
	logger.info('Using Configuration ' + config.dbProperties.host + '/' + config.dbProperties.database);
	logger.debug('Server started in port no: ' + port);
})

const cleanUpServer = async () => {
	destroyNamespace('tenants');
	await db.sequelize.close();;
	console.log('tenants namespace destroyed');
}

[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
	process.on(eventType, cleanUpServer.bind(null, eventType));
})