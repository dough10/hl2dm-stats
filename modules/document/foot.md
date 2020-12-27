## Install

1. clone repo `git clone https://github.com/dough10/hl2dm-stats.git`
2. cd into directory `cd hl2dm-stats`
3. install modules `npm install`
4. configure geoip-lite `cd node_modules/geoip-lite && npm run-script updatedb license_key=your license key` get your key [here](https://support.maxmind.com/account-faq/license-keys/how-do-i-generate-a-license-key/)
5. configure config.json to fit your filesystem `nano config/config.json`
6. run app `node api.js`
7. if using authorization run `node modules/streamKey.js` to configure a user login

## UI

avaliable from <https://github.com/dough10/hl2dm-stats-ui>
