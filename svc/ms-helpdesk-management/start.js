// Transpile all code following this line with babel and use '@babel/preset-env' (aka ES6) preset.
/* eslint-disable n/no-path-concat */

require('dotenv').config()

const moduleAlias = require('module-alias')
moduleAlias.addAliases({
  '@root': __dirname,
  '@config': __dirname + '/config',
  '@consumers': __dirname + '/consumers',
  '@controllers': __dirname + '/controllers',
  '@emitters': __dirname + '/emitters',
  '@jobs': __dirname + '/jobs',
  '@locales': __dirname + '/locales',
  '@middlewares': __dirname + '/middlewares',
  '@models': __dirname + '/models',
  '@resources': __dirname + '/resources',
  '@services': __dirname + '/services',
  '@utils': __dirname + '/utils',
  '@validators': __dirname + '/validators'
})

require('@babel/register')({
  presets: ['@babel/preset-env']
})
require('@babel/polyfill')
require('./server')