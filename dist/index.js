'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _axios = require('axios');

var _axios2 = _interopRequireDefault(_axios);

var _tunnel = require('tunnel');

var _tunnel2 = _interopRequireDefault(_tunnel);

var _concatStream = require('concat-stream');

var _concatStream2 = _interopRequireDefault(_concatStream);

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const fd = new _formData2.default();
const tunnelingAgent = _tunnel2.default.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: 443
  }
});

const request = _axios2.default.create({
  baseURL: 'https://www.googleapis.com/',
  httpsAgent: tunnelingAgent,
  proxy: false
});

const tokenRequest = _axios2.default.create({
  url: 'https://accounts.google.com/o/oauth2/token',
  method: 'POST',
  httpsAgent: tunnelingAgent,
  proxy: false
});

const api = function () {
  const api = {
    chromewebstore: {
      auth: auth => {
        const context = api.chromewebstore;
        context._auth = auth;
      },
      items: {
        getRefreshToken: () => {
          return new Promise((resolve, reject) => {
            const context = api.chromewebstore;
            const {
              client_id,
              client_secret,
              refresh_token,
              code
            } = context._auth;

            if (refresh_token) {
              resolve(refresh_token);
            } else {
              tokenRequest({
                data: {
                  client_id,
                  client_secret,
                  code,
                  grant_type: 'authorization_code',
                  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
                }
              }).then(res => {
                const { refresh_token } = res.data;
                context._auth.refresh_token = refresh_token;
                console.log('[Node-google-api] refresh_token:');
                console.log(refresh_token);
                console.log('[Node-google-api] Copy and use it in subsequent calls');
                resolve(refresh_token);
              }).catch(err => reject(err));
            }
          });
        },
        getAccessToken: () => {
          return new Promise((resolve, reject) => {
            const context = api.chromewebstore;
            const {
              client_id,
              client_secret,
              refresh_token,
              code
            } = context._auth;

            if (refresh_token) {
              request({
                url: '/oauth2/v4/token',
                method: 'POST',
                data: {
                  client_id,
                  client_secret,
                  refresh_token,
                  grant_type: 'refresh_token'
                }
              }).then(res => {
                resolve(res.data.access_token);
              }).catch(err => reject(err));
            } else {
              tokenRequest({
                data: {
                  client_id,
                  client_secret,
                  code,
                  grant_type: 'authorization_code',
                  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob'
                }
              }).then(res => {
                const { refresh_token, access_token } = res.data;
                context._auth.refresh_token = refresh_token;
                console.log('[Node-google-api] refresh_token:');
                console.log(refresh_token);
                console.log('[Node-google-api] Copy and use it in subsequent calls');
                resolve(access_token);
              }).catch(err => reject(err));
            }
          });
        }

      }
    }
  };

  api.chromewebstore.items.update = function (id, packagePath) {
    return new Promise((resolve, reject) => {
      this.getAccessToken().then(accessToken => {
        const headers = fd.getHeaders();
        headers.Authorization = `Bearer ${accessToken}`;
        fd.append('file', _fs2.default.createReadStream(packagePath));
        fd.pipe((0, _concatStream2.default)({ encoding: 'buffer' }, data => {
          request({
            method: 'PUT',
            url: `/upload/chromewebstore/v1.1/items/${id}`,
            headers,
            data
          }).then(res => {
            resolve(res.data);
          }).catch(err => {
            reject(err);
          });
        }));
      }).catch(err => reject(err));
    });
  };

  api.chromewebstore.items.publish = function (id) {
    return new Promise((resolve, reject) => {
      this.getAccessToken().then(accessToken => {
        const headers = {};
        headers.Authorization = `Bearer ${accessToken}`;
        request({
          method: 'POST',
          url: `/chromewebstore/v1.1/items/${id}/publish`,
          headers
        }).then(res => {
          resolve(res.data);
        }).catch(err => {
          reject(err);
        });
      }).catch(err => reject(err));
    });
  };

  return api;
}();

exports.default = api.chromewebstore;
