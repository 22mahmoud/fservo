import { last, prop, inc } from 'ramda';
import { http, get, scope, router, post, put, remove, all } from '../lib';

const db = {
  data: {
    posts: Array.from({ length: 5 }).map((_, i) => ({
      id: i,
      title: `post title ${i}`,
      body: `post body ${i}`
    }))
  },

  get: (name: string) => new Promise(async (resolve) => {
    await sleep(100);
    // @ts-ignore
    resolve(db.data[name]);
  }),

  getOne: (name: string | number, id: any): Promise<unknown> => new Promise(async (resolve) => {
    await sleep(150);
    // @ts-ignore
    resolve(db.data[name].find(x => x.id === id));
  }),

  updateOne: (name: string | number, id: any, values: { [x: string]: any; }) => new Promise(async (resolve) => {
    await sleep(150);
    // @ts-ignore
    const post = db.data[name].find(x => x.id === id);
    const newPost = Object.keys(post).reduce((acc, k) => ({
      ...acc,
      [k]: values[k] || post[k]
    }), {});

    // @ts-ignore
    db.data[name][post.id] = newPost;
    resolve(newPost);
  }),

  create: (name: string | number, values: any) =>  new Promise(async (resolve) => {
    await sleep(100);
    // @ts-ignore
    const id = inc(prop('id')(last(db.data[name])));
    const record = { ...values, id };
    // @ts-ignore
    db.data[name].push(record);

    resolve(record);
  }),

  deleteOne: (name: string | number, id: any) => new Promise(async (resolve) => {
    await sleep(150);
    // @ts-ignore
    const idx = db.data[name].findIndex(x => x.id === id);
    // @ts-ignore
    db.data[name] = [
      // @ts-ignore
      ...db.data[name].slice(0, idx),
      // @ts-ignore
      ...db.data[name].slice(idx+1)
    ]
    resolve(true);
  }),
}

const sleep = (ms: number) => 
  new Promise(resolve => setTimeout(resolve, ms));

// @ts-ignore
const index = get('/', ({ res }): any =>
  res.send('hello, world')
);

// @ts-ignore
const ping = get('/ping', async ({ res }) => {
  await sleep(600);
  res.json({ message: "done" })
});

// @ts-ignore
const hey = get('/hey/:name', ({ res, req }) =>
  res.json({ 
    message: `Hey, ${req.params.name}` 
  })
);

const wow = scope('/wow')
  .use(ping)
  .use(hey)

// @ts-ignore
const getPosts = get('', ({ res }) =>
  db.get('posts').then(res.json)
);

// @ts-ignore
const createPost = post('', async ({ res, req: { body: { title, body }} }) =>
  db
  .create('posts', { title, body, })
  .then(post => res.status(201).json(post))
);

// @ts-ignore
const getPost = get('', ({ req, res }) =>
  db.getOne('posts', +req.params.id).then(res.json)
);

const updatePost = put('', ({ 
  // @ts-ignore
  req: { params: { id }, body: { title, body } }, res 
}) => 
  db
    .updateOne('posts', +id, { title, body })
    .then(res.json)
);

// @ts-ignore
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
  // @ts-ignore
  .use(all('(.*)', ({ res }) =>
    res.status(404).send('not found')
  ));

http
  .routes(routes)
  .bind(5000)
  .create()
    // @ts-ignore
  .listen(({ port }) =>  {
    console.log(`server is running on port ${port}`)
  });
