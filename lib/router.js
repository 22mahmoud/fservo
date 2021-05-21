'use strict'

const { 
  mergeDeepWith,
  concat,
  keys,
  reduce,
  curry
} = require('ramda');

const { METHODS } = require('./constants');

const Router = (router = {}) => ({
  __extract__: () => router,
  use: (fn) => 
    Router(mergeDeepWith(concat, router, fn.__extract__()))
});

const Method = curry((name, pathname, fn) => ({
  __extract__: () => ({
    [pathname]: 
      reduce((acc, method) => ({ 
        ...acc,
        ...(name === 'all' || name === method ? { [method]: fn } : {}) }), 
      {})(METHODS)
    }),
  }),
);

const scope = (pathname, router = {}) => ({
  __extract__: () => router,
  use: fn =>  {
    const route = fn.__extract__();
    return scope(
      pathname,
      mergeDeepWith(
        concat,
        router,
        reduce(
          (acc, key) =>
            ({ ...acc, [pathname+key]: route[key]}),
          {},
          keys(route)
        ),
      ),
    );
  }
});

// const register = (fn) => ({
//   __extract__: () => 
// });

module.exports = { 
  router: Router(),
  scope,
  get: Method('get'),
  post: Method('post'),
  put: Method('put'),
  patch: Method('patch'),
  remove: Method('delete'),
  all: Method('all')
};
