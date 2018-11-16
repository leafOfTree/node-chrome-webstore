import fs from 'fs';
import axios from 'axios';
import tunnel from 'tunnel';
import concat from 'concat-stream';
import FormData from 'form-data';

const fd = new FormData;
const tunnelingAgent = tunnel.httpsOverHttp({
  proxy: {
    host: '127.0.0.1',
    port: 443
  }
});

const request = axios.create({
  baseURL: 'https://www.googleapis.com/',
  httpsAgent: tunnelingAgent,
  proxy: false,
});

const tokenRequest = axios.create({
  url: 'https://accounts.google.com/o/oauth2/token',
  method: 'POST',
  httpsAgent: tunnelingAgent,
  proxy: false,
});

const api = (function () {
  const api = {
    chromewebstore: {
      auth: (auth) => {
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
              code,
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
                  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
                },
              }).then((res) => {
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
            if (!context._auth) {
              reject(new Error('Please call auth first!'));
            }
            const {
              client_id,
              client_secret,
              refresh_token,
              code,
            } = context._auth;

            if (refresh_token) {
              request({
                url: '/oauth2/v4/token',
                method: 'POST',
                data: {
                  client_id,
                  client_secret,
                  refresh_token,
                  grant_type: 'refresh_token',
                },
              }).then((res) => {
                resolve(res.data.access_token);
              }).catch(err => reject(err));
            } else {
              tokenRequest({
                data: {
                  client_id,
                  client_secret,
                  code,
                  grant_type: 'authorization_code',
                  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
                },
              }).then((res) => {
                const { refresh_token, access_token } = res.data;
                context._auth.refresh_token = refresh_token;
                console.log('[Node-google-api] refresh_token:');
                console.log(refresh_token);
                console.log('[Node-google-api] Copy and use it in subsequent calls');
                resolve(access_token);
              }).catch(err => reject(err));
            }
          });
        },

      }
    }
  };

  api.chromewebstore.items.update = function (id, packagePath) {
    return new Promise((resolve, reject) => {
      this.getAccessToken().then((accessToken) => {
        const headers = fd.getHeaders();
        headers.Authorization = `Bearer ${accessToken}`;
        fd.append('file', fs.createReadStream(packagePath));
        fd.pipe(concat({ encoding: 'buffer' }, data => {
          request({
            method: 'PUT',
            url: `/upload/chromewebstore/v1.1/items/${id}`,
            headers,
            data,
          }).then((res) => {
            resolve(res.data);
          }).catch((err) => {
            reject(err);
          });
        }));
      }).catch(err => reject(err));
    });
  };

  api.chromewebstore.items.publish = function (id) {
    return new Promise((resolve, reject) => {
      this.getAccessToken()
        .then((accessToken) => {
          const headers = {};
          headers.Authorization = `Bearer ${accessToken}`;
          request({
            method: 'POST',
            url: `/chromewebstore/v1.1/items/${id}/publish`,
            headers,
          }).then((res) => {
            resolve(res.data);
          }).catch((err) => {
            reject(err);
          });
        })
        .catch(err => reject(err));
    });
  };

  return api;
})();

export default api.chromewebstore;
