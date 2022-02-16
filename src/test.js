const nodeFetch = require('node-fetch')
const fetchCookies = require('fetch-cookie');

const fetch = fetchCookies(nodeFetch);

fetch(
    'https://auth.riotgames.com/api/v1/authorization',
    {
        method: 'POST',
        headers: {
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive',
            'Content-Type': 'application/json; charset=UTF-8',
            'User-Agent': 'PostmanRuntime/7.28.4',
        },
        body: `{"client_id":"play-valorant-web-prod","nonce":"1","redirect_uri":"https://playvalorant.com/opt_in","response_type":"token id_token"}`
    }
).then(res => console.log(res.status))