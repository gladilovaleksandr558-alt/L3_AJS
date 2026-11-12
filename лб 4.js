const https = require('https');

const BASE = 'https://jsonplaceholder.typicode.com';

const sortByTitleLengthDesc = (posts) =>
  [...posts].sort((a, b) => b.title.length - a.title.length);

const sortByName = (comments) =>
  [...comments].sort((a, b) => a.name.localeCompare(b.name));

const pickUserFields = (users) =>
  users.map(({ id, name, username, email, phone }) => ({
    id, name, username, email, phone,
  }));

const filterNotCompleted = (todos) => todos.filter((t) => !t.completed);

function getJsonCallback(path, callback) {
  https
    .get(`${BASE}${path}`, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try {
          callback(null, JSON.parse(raw));
        } catch (e) {
          callback(e);
        }
      });
    })
    .on('error', (err) => callback(err));
}

function getPostsSortedCallback(callback) {
  getJsonCallback('/posts', (err, posts) => {
    if (err) return callback(err);
    callback(null, sortByTitleLengthDesc(posts));
  });
}

function getCommentsSortedCallback(callback) {
  getJsonCallback('/comments', (err, comments) => {
    if (err) return callback(err);
    callback(null, sortByName(comments));
  });
}

function getJsonPromise(path) {
  return fetch(`${BASE}${path}`).then((res) => {
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  });
}

function getUsersPromise() {
  return getJsonPromise('/users').then(pickUserFields);
}

function getTodosNotCompletedPromise() {
  return getJsonPromise('/todos').then(filterNotCompleted);
}

async function getJsonAsync(path) {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function getPostsSortedAsync() {
  return sortByTitleLengthDesc(await getJsonAsync('/posts'));
}

async function getCommentsSortedAsync() {
  return sortByName(await getJsonAsync('/comments'));
}

async function getUsersAsync() {
  return pickUserFields(await getJsonAsync('/users'));
}

async function getTodosNotCompletedAsync() {
  return filterNotCompleted(await getJsonAsync('/todos'));
}

function main() {
  getPostsSortedCallback((err, posts) => {
    if (err) return console.error('[callback] posts:', err.message);
    console.log('[callback] posts, первые 3:', posts.slice(0, 3));
  });

  getCommentsSortedCallback((err, comments) => {
    if (err) return console.error('[callback] comments:', err.message);
    console.log('[callback] comments, первые 3:', comments.slice(0, 3));
  });

  getUsersPromise()
    .then((users) => console.log('[promise] users:', users))
    .catch((e) => console.error('[promise] users:', e.message));

  getTodosNotCompletedPromise()
    .then((todos) =>
      console.log('[promise] todos (completed=false):', todos.length, todos.slice(0, 3))
    )
    .catch((e) => console.error('[promise] todos:', e.message));

  (async () => {
    try {
      const [posts, comments, users, todos] = await Promise.all([
        getPostsSortedAsync(),
        getCommentsSortedAsync(),
        getUsersAsync(),
        getTodosNotCompletedAsync(),
      ]);
      console.log('[async] posts, первые 3:', posts.slice(0, 3));
      console.log('[async] comments, первые 3:', comments.slice(0, 3));
      console.log('[async] users, первые 2:', users.slice(0, 2));
      console.log('[async] todos (completed=false):', todos.length);
    } catch (e) {
      console.error('[async] error:', e.message);
    }
  })();
}

main();
