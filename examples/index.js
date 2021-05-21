const { last, prop, inc } = require('ramda');
const {
  http,
  get,
  scope,
  router,
  post,
  put,
  remove,
  all
}  = require('../lib');

const db = {
  data: {
    posts: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `post title ${i}`,
      body: `post body ${i}`
    }))
  },

  get: (name) => new Promise(async (resolve) => {
    await sleep(100);
    resolve(db.data[name]);
  }),

  getOne: (name, id) => new Promise(async (resolve) => {
    await sleep(150);
    resolve(db.data[name].find(x => x.id === id));
  }),

  updateOne: (name, id, values) => new Promise(async (resolve) => {
    await sleep(150);
    const post = db.data[name].find(x => x.id === id);
    const newPost = Object.keys(post).reduce((acc, k) => ({
      ...acc,
      [k]: values[k] || post[k]
    }), {});

    db.data[name][post.id] = newPost;
    resolve(newPost);
  }),

  create: (name, values) =>  new Promise(async (resolve) => {
    await sleep(100);
    const id = inc(prop('id')(last(db.data[name])));
    const record = { ...values, id };
    db.data[name].push(record);

    resolve(record);
  }),

  deleteOne: (name, id) => new Promise(async (resolve) => {
    await sleep(150);
    const idx = db.data[name].findIndex(x => x.id === id);
    db.data[name] = [
      ...db.data[name].slice(0, idx),
      ...db.data[name].slice(idx+1)
    ]
    resolve(true);
  }),
}

const sleep = ms => 
  new Promise(resolve => setTimeout(resolve, ms));

const index = get('/', ({ res }) =>
  res.send('hello, world')
);

const ping = get('/ping', async ({ res }) => {
  await sleep(600);
  res.json({ message: "done" })
});

const hey = get('/hey/:name', ({ res, req }) =>
  res.json({ 
    message: `Hey, ${req.params.name}` 
  })
);

const wow = scope('/wow')
  .use(ping)
  .use(hey)

const getPosts = get('', ({ res }) =>
  db.get('posts').then(res.json)
);

const createPost = post('', async ({ res, req: { body: { title, body }} }) =>
  db
  .create('posts', { title, body, })
  .then(post => res.status(201).json(post))
);

const getPost = get('', ({ req, res }) =>
  db.getOne('posts', +req.params.id).then(res.json)
);

const updatePost = put('', ({ 
  req: { params: { id }, body: { title, body } }, res 
}) => 
  db
    .updateOne('posts', +id, { title, body })
    .then(res.json)
);

const deletePost = remove('', async ({ req: { params: { id } }, res }) =>
  db
    .deleteOne('posts', +id)
    .then(() => res.status(204).send())
);

const postRoutes = scope('/:id')
  .use(getPost)
  .use(updatePost)
  .use(deletePost) 

const posts = scope('/posts')
  .use(getPosts)
  .use(createPost)
  .use(postRoutes)

const routes = router
  .use(wow)
  .use(index)
  .use(posts)
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
