# node chrome webstore

Update and publish chrome extension automatically.

## Prepare

If you have `refresh_token`, you can visit [Subsequent calls](#subsequent-calls) directly.

Else please follow [Using the Chrome Web Store Publish API][0] instructions and come back when you get `client id`, `client secret` and `code`.

## Installation

    npm i node-chrome-webstore

## Usage

### First call

Save refresh token and use it in subsequent calls

```javascript
const webstore = require('index');

const client_id = '';
const client_secret = '';
const code = '';

webstore.auth({
  client_id,
  client_secret,
  code,
});

webstore.items.getRefreshToken().then((token) => {
  console.log(token);
});

```
### Subsequent calls

```javascript
const webstore = require('./index');

const client_id = '';
const client_secret = '';
const refresh_token = '';
const itemId = '';
const zipPath = '';

webstore.auth({
  client_id,
  client_secret,
  refresh_token,
});

// update
webstore.items.update(itemId, zipPath).then(res => {
    console.log(res);
});

// publish
webstore.items.publish(itemId).then(res => {
    console.log(res);
});
```

### Test

    npm test

[0]: https://developer.chrome.com/webstore/using_webstore_api
