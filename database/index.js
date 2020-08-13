const knex = require('knex');
const config = require('./config');

require('dotenv').config();
global.PROD = process.env.NODE_ENV == 'prod';

module.exports = knex(config[PROD ? 'production' : 'development']);