const webstore = require('./dist').default;
require('dotenv').config();

const {
  client_id,
  client_secret,
  refresh_token,
  code,
  itemId,
  zipPath,
} = process.env;

webstore.auth({
  client_id,
  client_secret,
  code,
  refresh_token,
  itemId,
  zipPath,
});

webstore.items.update(itemId, zipPath).then((res) => {
  console.log('[Update]: ');
  console.log(res);
  console.log();

  webstore.items.publish(itemId).then((res) => {
    console.log('[Publish]: ');
    console.log(res);
    console.log();
  });
});

webstore.items.getAccessToken().then((token) => {
  console.log('[Access Token]: ');
  console.log(token);
  console.log();
});
webstore.items.getRefreshToken().then((token) => {
  console.log('[Refresh Token]: ');
  console.log(token);
  console.log();
});
