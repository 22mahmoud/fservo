- basic example

```javascript
const { http, get, router, }  = require('fserv');

const index = get('/', ({ res }) =>
  res.send('hello, world!'),
);

const routes = router.use(index);

http
  .routes(routes)
  .bind(5000)
  .create()
  .listen(({ port }) =>  {
    console.log(`server is running on port ${port}`)
  });
```

- using scope for nested routes
```javascript
const { http, get, router, scope, post, put, remove }  = require('fserv');

const getPosts = get('', ({ res }) => ...);
const createPost = post('', ({ res, req: { body }}) => ...);
const getPost = get('', ({ req: { params }, res }) => ...);
const updatePost = put('', ({ req: { params, body }, res }) =>  ... );
const deletePost = remove('', async ({ req: { params: { id } }, res }) => ... );

const postRoutes = scope('/:id')
  .use(getPost)
  .use(updatePost)
  .use(deletePost) 

const posts = scope('/posts')
  .use(getPosts)
  .use(createPost)
  .use(postRoutes)

const routes = router
  .use(posts)
```
