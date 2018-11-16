# node chrome webstore

Update and publish chrome extension automatically.

## Prepare

If you have `refresh_token`, you can visit [Subsequent calls](#subsequent-calls) directly.

Else please follow [Using the Chrome Web Store Publish API][0] instructions and come back when you get `client id`, `client secret` and `code`.

> Code can only be used once, mainly use refresh token later.

## Installation

    npm i node-chrome-webstore

## Usage

### First call

Save refresh token and use it in subsequent calls

```javascript
const webstore = require('node-chrome-webstore');

const client_id = '';
const client_secret = '';
const code = '';

webstore.auth({
  client_id,
  client_secret,
  code,
});

webstore.items.getRefreshToken().then((token) => {
  console.log(token); // save it
});
```
### Subsequent calls

```javascript
const webstore = require('node-chrome-webstore');

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

### With dotenv example

[dotenv][1] can help to save auth info to `.env` in project root.

> Strongly recommend against committing your `.env` file to version control. It should be in `.gitignore`.

`.env`

```bash
client_id=9867219971
client_secret=5d21TdajfIcK
refresh_token=1/jBtQRAjjy
code=4/lgAZRFXy
itemId=eppeghhopeo
zipPath=path/to/zip
```

Read auth info from `.env`

```javascript
const webstore = require('node-chrome-webstore');

require('dotenv').config();

const {
  client_id,
  client_secret,
  refresh_token,
  itemId,
  zipPath,
} = process.env;

webstore.auth({
  client_id,
  client_secret,
  refresh_token,
});

webstore.items.update(itemId, zipPath).then((res) => {
  if (res.uploadState === 'SUCCESS') {
    webstore.items.publish(itemId).then((res) => {
      console.log(res);
    });
  } else {
    console.log(res);
  }
});
```

## Development

### Test

    npm test

[0]: https://developer.chrome.com/webstore/using_webstore_api
[1]: https://github.com/motdotla/dotenv
