<a name="module_api"></a>

## api
API backend for HL2DM game server stats. Reads log files generated by the server as well as rcon log port stream to generate player stats.

**Requires**: <code>module:fs</code>, <code>module:readline</code>, <code>module:compression</code>, <code>module:express</code>, <code>module:node-schedule</code>, <code>module:path</code>, <code>module:url</code>, <code>module:srcds-log-receiver</code>, <code>module:expresss-ws</code>, <code>module:express-validator</code>, <code>module:colors</code>, <code>module:pug</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  

* [api](#module_api)
    * [~logError(error)](#module_api..logError) ⇒ <code>Void</code>
    * [~errorHandler(e)](#module_api..errorHandler) ⇒ <code>Void</code>
    * [~who(ip, message)](#module_api..who) ⇒ <code>Void</code>
    * [~getOldStatsList(month)](#module_api..getOldStatsList) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [~parseLogs()](#module_api..parseLogs) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~readableTime(ms)](#module_api..readableTime) ⇒ <code>String</code>
    * [~fourohfour(req, res)](#module_api..fourohfour) ⇒ <code>HTML</code>
    * [~fiveHundred(req, res)](#module_api..fiveHundred) ⇒ <code>HTML</code>
    * [~/()](#module_api../) ⇒ <code>Void</code>
    * [~/()](#module_api../) ⇒ <code>JSON</code>
    * [~/status()](#module_api../status) ⇒ <code>JSON</code>
    * [~/auth()](#module_api../auth) ⇒ <code>JSON</code>
    * [~/stats()](#module_api../stats) ⇒ <code>JSON</code>
    * [~/old-months()](#module_api../old-months) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/old-stats/:month/:year()](#module_api../old-stats/_month/_year) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/playerList()](#module_api../playerList) ⇒ <code>JSON</code>
    * [~/newPlayers/:date()](#module_api../newPlayers/_date) ⇒ <code>JSON</code>
    * [~/returnPlayer/:date()](#module_api../returnPlayer/_date) ⇒ <code>Array</code>
    * [~/playerStats/:id()](#module_api../playerStats/_id) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/download/:file(file)](#module_api../download/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/download/logs-zip/:file(file)](#module_api../download/logs-zip/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/download/demos-zip/:file(file)](#module_api../download/demos-zip/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/demos()](#module_api../demos) ⇒ <code>JSON</code>
    * [~/cvarlist()](#module_api../cvarlist) ⇒ <code>Text</code>
    * [~/testCleanup()](#module_api../testCleanup) ⇒ <code>Text</code>
    * [~/dashboard()](#module_api../dashboard) ⇒ <code>JSON</code>
    * [~/admin()](#module_api../admin) ⇒ <code>HTML</code>
    * [~userConnected](#module_api..userConnected)
    * [~userDisconnected](#module_api..userDisconnected)
    * [~playerBan](#module_api..playerBan)
    * [~mapEnd](#module_api..mapEnd)
    * [~mapStart](#module_api..mapStart)
    * [~rconStats](#module_api..rconStats)
    * [~statsLoop](#module_api..statsLoop) ⇒ <code>Void</code>

<a name="module_api..logError"></a>

### api~logError(error) ⇒ <code>Void</code>
logs srror string to console w/ colors

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| error | <code>String</code> | error message |

**Example** *(Example usage of logError() function.)*  
```js
logError('Shit is broke');
```
<a name="module_api..errorHandler"></a>

### api~errorHandler(e) ⇒ <code>Void</code>
prints error message to console

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | error object |

**Example** *(Example usage of errorHandler() function.)*  
```js
doStuff().then(doMoreStuff).catch(errorHandler);
```
<a name="module_api..who"></a>

### api~who(ip, message) ⇒ <code>Void</code>
prints out the players name when a known ip views a page or makes a request

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Void</code> - nothing  
**See**: modules <a href=modules/data-model/data-model-doc.md#module_data-model..Data+who>data-model-doc.md</a>  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip addres of the user viewing a page or making a request |
| message | <code>String</code> | the rest of the message |

**Example** *(Example usage of who() function.)*  
```js
who(req, 'is online');
```
<a name="module_api..getOldStatsList"></a>

### api~getOldStatsList(month) ⇒ <code>Promise.&lt;Array&gt;</code>
grabs stats object from json file for a given month

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - list of months. / players stats for the passed in month  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>Number</code> | number of the month 0 - 11 **optional** |

**Example** *(Example usage of getOldStatsList() function.)*  
```js
getOldStatsList().then(months => {
// console.log(months); = [1609123414390.json]
});
getOldStatsList(11).then(month => {
// console.log(month); = [
//   [ over 100 kills sorted by KDR ],
//   [ weapon data ],
//   212, // player count
//   [ banned players ],
//   1609123414390 // time stats were generated
//]
});
```
<a name="module_api..parseLogs"></a>

### api~parseLogs() ⇒ <code>Promise.&lt;String&gt;</code>
parse folder of logs 1 line @ a time. dumping each line into the scanner

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Promise.&lt;String&gt;</code> - duration for task to complete  
**See**: <a href=modules/lineScanner/lineScanner.js>lineScanner.js</a>  
**Example** *(Example usage of parseLogs() function.)*  
```js
parseLogs().then(seconds => {
//  print(`Log parser complete in ` + `${seconds} seconds`); = '12/28/2020, 9:28:55 PM - Log parser complete in 1.768 seconds'
});
```
<a name="module_api..readableTime"></a>

### api~readableTime(ms) ⇒ <code>String</code>
convert milliseconds to readable time string

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>String</code> - readable time string  

| Param | Type | Description |
| --- | --- | --- |
| ms | <code>Number</code> | time in milliseconds |

**Example** *(Example usage of readableTime() function.)*  
```js
let string = readableTime(67541983);
```
<a name="module_api..fourohfour"></a>

### api~fourohfour(req, res) ⇒ <code>HTML</code>
404 page

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>HTML</code> - 404  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | express request object |
| res | <code>Object</code> | express response object |

**Example** *(Example usage of fourohfour() function.)*  
```js
fourohfour(req, res);
```
<a name="module_api..fiveHundred"></a>

### api~fiveHundred(req, res) ⇒ <code>HTML</code>
500 page

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>HTML</code> - 500  

| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | express request object |
| res | <code>Object</code> | express response object |

**Example** *(Example usage of fiveHundred() function.)*  
```js
fiveHundred(req, res);
```
<a name="module_api../"></a>

### api~/() ⇒ <code>Void</code>
redirect to admin

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Void</code> - redirect  
<a name="module_api../"></a>

### api~/() ⇒ <code>JSON</code>
route for WebSocket

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - websocket pipeline  
**Example** *(Example usage of / api endpoint.)*  
```js
let socket = new WebSocket('http://localhost:3000/);
```
<a name="module_api../status"></a>

### api~/status() ⇒ <code>JSON</code>
route for gettings the status of the game server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - game server rcon status response  
**Example** *(Example usage of /status api endpoint.)*  
```js
fetch('http://localhost:3000/status').then(response => {
  response.json().then(json => {
    console.log(json); // game server status
  });
});
```
<a name="module_api../auth"></a>

### api~/auth() ⇒ <code>JSON</code>
login system

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - ok: authorized, fail: failed to authorize  
**See**: <a href=modules/auth/auth-doc.md#module_modules/auth..auth>auth-doc.md</a>  

| Param | Type | Description |
| --- | --- | --- |
| req.query.name | <code>String</code> | the name of the stream |
| req.query.k | <code>String</code> | the streams auth key |

**Example** *(Example usage of /auth api endpoint.)*  
```js
fetch('http://localhost:3000/auth?name=stream1&k=supersecurepassword').then(response => {
  response.json().then(json => {
    console.log(json);  = {staus: 200 | 401, authorized: true | false}
  });
});
```
<a name="module_api../stats"></a>

### api~/stats() ⇒ <code>JSON</code>
route for gettings player stats

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - stats top players list, server wide weapons list, # of total players, list of banned players, time of generation  
**Example** *(Example usage of /stats api endpoint.)*  
```js
fetch('http://localhost:3000/stats').then(response => {
  response.json().then(json => {
    console.log(json); // player statistics
  });
});
```
<a name="module_api../old-months"></a>

### api~/old-months() ⇒ <code>JSON</code> \| <code>HTML</code>
route for getting a list of avaliable data for prevoius months

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - list of months with stats history | 500  
**Example** *(Example usage of /old-months api endpoint.)*  
```js
fetch('http://localhost:3000/old-months').then(response => {
  response.json().then(json => {
    console.log(json); // list of previous months that have player statistics
  });
}); 
```
<a name="module_api../old-stats/_month/_year"></a>

### api~/old-stats/:month/:year() ⇒ <code>JSON</code> \| <code>HTML</code>
route for getting a old months stats data

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - statistics from a previous month | 500  

| Param | Type | Description |
| --- | --- | --- |
| req.query.month | <code>Number</code> | index number of the months data |
| req.params.year | <code>Number</code> | year |

**Example** *(Example usage of /old-stats/:month api endpoint.)*  
```js
fetch('http://localhost:3000/old-stats/11/2020').then(response => {
  response.json().then(json => {
    console.log(json); // statistics for the month of December
  });
});
```
<a name="module_api../playerList"></a>

### api~/playerList() ⇒ <code>JSON</code>
route for getting list of all players who has played in server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of all players to join server  
**Example** *(Example usage of /playerList api endpoint.)*  
```js
fetch('http://localhost:3000/playerList').then(response => {
  response.json().then(json => {
    console.log(json); // list of plyaers that have joined the server
  });
});
```
<a name="module_api../newPlayers/_date"></a>

### api~/newPlayers/:date() ⇒ <code>JSON</code>
return array of new users

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of players from the given date  

| Param | Type | Description |
| --- | --- | --- |
| req.params.date | <code>Number</code> | date of the month you want to view users for 0 = today |

**Example** *(Example usage of /newPlayer/:date api endpoint.)*  
```js
fetch('http://localhost:3000/newPlayer/1').then(response => {
  response.json().then(json => {
    console.log(json); // list of players that played in the server for the first time on the first of the month
  });
});
```
<a name="module_api../returnPlayer/_date"></a>

### api~/returnPlayer/:date() ⇒ <code>Array</code>
return array of return users

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Array</code> - list of players from the given date  

| Param | Type | Description |
| --- | --- | --- |
| req.params.date | <code>Number</code> | date of this month you want to view user for 0 = today |

**Example** *(Example usage of /returnPlayer/:date api endpoint.)*  
```js
fetch('http://localhost:3000/returnPlayer/1').then(response => {
  response.json().then(json => {
    console.log(json); // list of returning players that played in the server on the first of the month
  });
});
```
<a name="module_api../playerStats/_id"></a>

### api~/playerStats/:id() ⇒ <code>JSON</code> \| <code>HTML</code>
route for gettings a individual players stats

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - players stat data | 404  

| Param | Type | Description |
| --- | --- | --- |
| req.params.id | <code>Number</code> | steamid3 of the player |

**Example** *(Example usage of /playerStats/:id api endpoint.)*  
```js
fetch('http://localhost:3000/playerStats/1025678454').then(response => {
  response.json().then(json => {
    console.log(json); // player statistics for player with the id 1025678454
  });
});
```
<a name="module_api../download/_file"></a>

### api~/download/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a demo file

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .dem file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | file name requested for download |

**Example** *(Example usage of /download/:file api endpoint.)*  
```js
<a href="localhost:3000/download/auto-20210101-0649-dm_bellas_room_d1.dem"></a>
```
<a name="module_api../download/logs-zip/_file"></a>

### api~/download/logs-zip/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a previous months logs zip files

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .zip file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | filename requested for download |

**Example** *(Example usage of /download/logs-zip/:file api endpoint.)*  
```js
<a href="localhost:3000/download/logs-zip/1609123414390.zip"></a>
```
<a name="module_api../download/demos-zip/_file"></a>

### api~/download/demos-zip/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a previous months demo zip files

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .zip file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | filename requested for download |

**Example** *(Example usage of /download/demos-zip/:file api endpoint.)*  
```js
<a href="localhost:3000/download/demos-zip/1609123414390.zip"></a>
```
<a name="module_api../demos"></a>

### api~/demos() ⇒ <code>JSON</code>
route to get list of demo recording on the server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of demo files  
**Example** *(Example usage of /demos api endpoint.)*  
```js
fetch('http://localhost:3000/demos').then(response => {
  response.json().then(json => {
    console.log(json); // list of demo files that can be downloaded
  });
});
```
<a name="module_api../cvarlist"></a>

### api~/cvarlist() ⇒ <code>Text</code>
route to get list of hl2dm server cvar's

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Text</code> - list of cvar commands  
**Example** *(Example usage of /cvarlist api endpoint.)*  
```js
fetch('http://localhost:3000/cvarlist').then(response => {
  response.text().then(text => {
    console.log(text); // list of srcds conosle commands
  });
});
```
<a name="module_api../testCleanup"></a>

### api~/testCleanup() ⇒ <code>Text</code>
tests the file cleanup function that runs every month on the first @ 5 am

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Text</code> - test start confirmation string  
**Example** *(Example usage of /testCleanup api endpoint.)*  
```js
fetch('http://localhost:3000/testCleanup').then(response => {
  response.text().then(text => {
    console.log(text); // 'cleanup test started'
  });
});
```
<a name="module_api../dashboard"></a>

### api~/dashboard() ⇒ <code>JSON</code>
stats dashboard websocket

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - RCON stats  
<a name="module_api../admin"></a>

### api~/admin() ⇒ <code>HTML</code>
admin portal

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>HTML</code> - admin page  
<a name="module_api..userConnected"></a>

### api~userConnected
callback for when a player joins server

**Kind**: inner typedef of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| u | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

**Example** *(Example usage of userConnected() function.)*  
```js
scanner(.., .., .., .., userConnected, .., ..);
```
<a name="module_api..userDisconnected"></a>

### api~userDisconnected
callback for when a player leaves server

**Kind**: inner typedef of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| u | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

**Example** *(Example usage of userDisconnected() function.)*  
```js
scanner(.., .., .., .., userDisconnected, .., ..);
```
<a name="module_api..playerBan"></a>

### api~playerBan
callback for when a player is banned

**Kind**: inner typedef of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| player | <code>Object</code> | user object of the banned player |

**Example** *(Example usage of playerBan() function.)*  
```js
scanner(.., .., .., .., playerBan, .., ..);
```
<a name="module_api..mapEnd"></a>

### api~mapEnd
callback for when a round / map has ended

**Kind**: inner typedef of [<code>api</code>](#module_api)  
**Example** *(Example usage of mapEnd() function.)*  
```js
scanner(.., .., .., .., mapEnd, .., ..);
```
<a name="module_api..mapStart"></a>

### api~mapStart
callback for when a round / map has started

**Kind**: inner typedef of [<code>api</code>](#module_api)  
**Example** *(Example usage of mapStart() function.)*  
```js
scanner(.., .., .., .., mapStart, .., ..);
```
<a name="module_api..rconStats"></a>

### api~rconStats
callback server statistics

**Kind**: inner typedef of [<code>api</code>](#module_api)  
**Example** *(Example usage of rconStats() function.)*  
```js
new RconStats('127.0.0.1', 'supersecurepassword', rconStats).ping();
```
<a name="module_api..statsLoop"></a>

### api~statsLoop ⇒ <code>Void</code>
loops to get Gamedig data for game server

**Kind**: inner typedef of [<code>api</code>](#module_api)  
**Returns**: <code>Void</code> - nothing  
**See**

- <a href=modules/gameSeverStatus.js>gameSeverStatus.js</a>
- <a href=modules/data-model/data-model-doc.md#dataupdatestatusstatus--void>data-model-doc.md</a>

**Example** *(Example usage of statsLoop() function.)*  
```js
statsLoop(); // it will run every 5 seconds after being called
```
