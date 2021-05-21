- basic example

```javascript
const { http, get, scope, router, }  = require('fserv');

const index = get('/', ({ res }) =>
  res.send('hello, world!'),
);

const routes = router
  .use(index)
  .use(all('(.*)', ({ res }) =>
    res.status(404).send('not found')
  ));

http
  .routes(routes)
  .bind(5000)
  .create()
  .listen(({ port }) =>  {
    console.log(`server is running on port ${port}`)
  });
```

