'use strict'

const qs = require('qs');
const { match } = require('path-to-regexp');
const { curry, memoizeWith } = require('ramda');

const matchPathToRegex = curry(
  memoizeWith((a, b) => a + b, (pathname, regex) =>
    match(regex)(pathname)
  ),
);

const parseReqBody = (req) => new Promise((resolve ,reject) => {
  if (['GET', 'DELETE'].includes(req.method)) 
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

module.exports = { matchPathToRegex, parseReqBody };


