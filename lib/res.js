'use strict'

const { pipe, reduce, keys } = require("ramda");

const Res = (res) => Object.assign(res, {
  set: (headers) => pipe(
    keys,
    reduce((acc, curr) => ({
      ...acc,
      ...res.setHeader(curr, headers[curr])
    }), {})
  )(headers),

  status: (statusCode = 200) =>
    Object.assign(res, { statusCode }),

  send: (content) => {
    if (!content) {
      res.setHeader('content-length', 0);
      return res.end();
    }

    const size = Buffer.byteLength(content).toString();

    return res
      .setHeader('content-length', size)
      .end(content);
  },

  json: (json) => {
    try {
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify(json), 'utf-8')
      res.end();
    } catch (error) {
      res.end();
    }
  }
});


module.exports = { Res };
