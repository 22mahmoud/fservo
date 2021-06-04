import { mergeDeepWith, concat, keys, reduce, curry } from 'ramda';

import { METHODS } from './constants';

const Router = (router = {}) => ({
  __extract__: () => router,
  use: (fn: any) => 
    Router(mergeDeepWith(concat, router, fn.__extract__()))
});

const Method = curry((name, pathname, fn) => ({
  __extract__: () => ({
    [pathname]: 
      reduce((acc, method) => ({ 
        ...acc,
        ...(name === 'all' || name === method ? { [method as string]: fn } : {}) }), 
      {})(METHODS)
    }),
  }),
);

export const scope = (pathname: string, router = {}) => ({
  __extract__: () => router,
  use: (fn: { __extract__: () => any; }) =>  {
    const route = fn.__extract__();
    return scope(
      pathname,
      mergeDeepWith(
        concat,
        router,
        reduce(
          (acc, key) =>
            ({ ...acc, [`${pathname}${String(key)}`]: route[key]}),
          {},
          keys(route)
        ),
      ),
    );
  }
});

export const router = Router();
export const get = Method('get');
export const post = Method('post');
export const put = Method('put');
export const patch = Method('patch');
export const remove = Method('delete');
export const all = Method('all');
