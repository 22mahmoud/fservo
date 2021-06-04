import { ServerResponse } from "http";
import { pipe, reduce, keys } from "ramda";

export const Res = (res: ServerResponse) => Object.assign(res, {
  set: (headers: Record<string, string | number | readonly string[]>) => pipe(
    keys,
    reduce((acc, curr) => ({
      ...acc,
      ...res.setHeader(curr, headers[curr])
    }), {})
  )(headers),

  status: (statusCode = 200) => Object.assign({}, res, {
    statusCode,
  }),

  send: (content: any) => {
    if (!content) {
      res.setHeader('content-length', 0);
      return res.end();
    }

    const size = Buffer.byteLength(content).toString();

    return res
      .setHeader('content-length', size)
      .end(content);
  },

  json: (json: Record<any, any>) => {
    try {
      res.setHeader('Content-Type', 'application/json')
      res.write(JSON.stringify(json), 'utf-8')
      res.end();
    } catch (error) {
      res.end();
    }
  }
})
