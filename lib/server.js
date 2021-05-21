'use strict'

const http = require('http');
const qs = require('qs');
const { 
  find,
  keys,
  pipe,
  toLower,
  memoizeWith,
  props,
  join,
  identity, 
} = require('ramda');
const { matchPathToRegex, parseReqBody } = require('./utils');
const { Req } = require('./req');
const { Res } = require('./res');

const createMemoKey = pipe(
  props(['searchParams', 'urlPathname', 'method']), 
  join('_')
)

const getHandler = memoizeWith(identity, (router) => memoizeWith(createMemoKey , ({
  searchParams,
  urlPathname, 
  method, 
}) => {
  const getParams = matchPathToRegex(urlPathname);

  const pathname = pipe(keys, find(getParams))(router);

  // no pathname == no handler
  if (!pathname) {
    return {
      routeHandler: () => {},
      params: null,
      query: null,
    }
  }

  const { params } = getParams(pathname);

  const query = searchParams.length ? qs.parse(searchParams) : {};

  const routeHandler = typeof router?.[pathname] === 'function' 
      && router?.[pathname]
      || router?.[pathname]?.[toLower(method)] 
      || (() => {});

  return { routeHandler, params, query };
}));

const Http = (ctx = {}) => {
  const { server, port, router } = ctx;
  
  return ({
    server, 
    port,
    create: () => {
      const _server = http.createServer(async (req, res) => {
        const body = await parseReqBody(req);

        const url = new URL(`http:${req.headers.host}${req.url}`);

        const { routeHandler, params, query } = getHandler(router)({
          searchParams: url.searchParams.toString(),
          urlPathname: url.pathname,
          method: req.method, 
        });

        await routeHandler({
          req: Req({ ...req, params, query, url, body }), 
          res: Res(res) 
        });
      });


      return Http({ ...ctx, server: _server });
    },

    routes: (fn) => Http({ ...ctx, router: fn.__extract__() }) ,

    bind: p => Http({ ...ctx, port: p }),

    listen: (cb = () => {}) =>
      server.listen(port, () => cb({ port, server })),
  });
}

module.exports = {
  http: Http()
}
