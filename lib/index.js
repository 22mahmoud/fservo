'use strict'

const { http } = require('./server');
const { 
  router,
  get,
  scope,
  remove,
  patch,
  put,
  post,
  all
} = require('./router');

module.exports = {
  http,
  router,
  get,
  scope,
  patch,
  put,
  remove,
  post,
  all
};
