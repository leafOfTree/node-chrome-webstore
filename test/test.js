import test from 'ava';
import webstore from '../dist';

require('dotenv').config();

const {
  client_id,
  client_secret,
  refresh_token,
  code,
  itemId,
  zipPath,
} = process.env;

const correctAuth = {
  client_id,
  client_secret,
  refresh_token,
  code,
};

const wrongAuth = {
  client_id: 123,
  client_secret: 'abc',
  refresh_token: 'def',
  code: '456',
};

test('auth', t => {
  webstore.auth(correctAuth);
  t.is(webstore._auth, correctAuth);
});

test('get access token with wrong auth', async t => {
  webstore.auth(wrongAuth);
  const error = await t.throwsAsync(() => {
    return webstore.items.getAccessToken();
  })
  t.is(error.response.status, 400)
});

test('get access token with correct auth', async t => {
  webstore.auth(correctAuth);
  const token = await webstore.items.getAccessToken();
  t.is(typeof token, 'string');
});

test('get refresh token with supplied one', async t => {
  webstore.auth(wrongAuth);

  const token = await webstore.items.getRefreshToken();
  t.is(token, wrongAuth.refresh_token);
});

test('update with wrong auth', async t => {
  webstore.auth(wrongAuth);
  const error = await t.throwsAsync(() => {
    return webstore.items.update();
  })
  t.is(error.response.status, 400)
});

test('update with correct auth', async t => {
  webstore.auth(correctAuth);
  const response = await webstore.items.update(itemId, zipPath);
  t.is(['SUCCESS', 'FAILURE'].indexOf(response.uploadState) !== -1, true);
});

test('publish with wrong auth', async t => {
  webstore.auth(wrongAuth);
  const error = await t.throwsAsync(() => {
    return webstore.items.publish();
  })
  t.is(error.response.status, 400)
});

test('publish with correct auth', async t => {
  webstore.auth(correctAuth);
  const response = await webstore.items.publish(itemId);
  t.is(response.status[0], 'OK')
});
