import { IncomingMessage } from 'http';
import { match } from 'path-to-regexp';
import { curry, memoizeWith } from 'ramda';

export const matchPathToRegex = curry(
  memoizeWith((a, b) => a + b, (pathname: string, regex: string) =>
    match(regex)(pathname)
  ),
);

export const parseReqBody = (req: IncomingMessage) => new Promise((resolve ,reject) => {
  if (['GET', 'DELETE'].includes(req.method ?? '')) 
    return resolve(null);

  let raw = '';
  req
    .on('data', chunk => { raw += chunk; })
    .on('end', () => {
      try {
        const parsed = JSON.parse(raw);
        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    })
});

