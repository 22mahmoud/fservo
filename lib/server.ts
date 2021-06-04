import http from 'http';
import qs from 'qs';
import { URL } from 'url';
import { find, keys, pipe, toLower, memoizeWith, props, join, identity } from 'ramda';
import { matchPathToRegex, parseReqBody } from './utils';
import { Req } from './req';
import { Res } from './res';

const createMemoKey = pipe(
  // @ts-ignore
  props(['searchParams', 'urlPathname', 'method']), 
  join('_')
)

// @ts-ignore
const getHandler = memoizeWith(identity, (router) => memoizeWith(createMemoKey , ({
  searchParams,
  urlPathname, 
  method, 
}: any) => {
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

// @ts-ignore
const Http = (ctx: { server: any, port: any, router: any } = {}) => {
  const { server, port, router } = ctx;
  
  return ({
    server, 
    port,
    create: (): any => {
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

    routes: (fn: any) => Http({ ...ctx, router: fn.__extract__() }) ,

    bind: (p: any) => Http({ ...ctx, port: p }),

    listen: (cb: Function) =>
      server.listen(port, () => cb({ port, server })),
  });
}

// @ts-ignore
export default Http();
