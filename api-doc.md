<a name="module_api"></a>

## api
**Requires**: <code>module:fs</code>, <code>module:readline</code>, <code>module:compression</code>, <code>module:express</code>, <code>module:node-schedule</code>, <code>module:path</code>, <code>module:url</code>, <code>module:srcds-log-receiver</code>, <code>module:expresss-ws</code>, <code>module:express-validator</code>, <code>module:colors</code>  

* [api](#module_api)
    * [~db](#module_api..db)
    * [~socket](#module_api..socket)
    * [~appData](#module_api..appData)
    * [~receiver](#module_api..receiver)
    * [~server](#module_api..server)
    * [~scanner](#module_api..scanner)
    * [~Datamodel](#module_api..Datamodel)
    * [~logUser](#module_api..logUser)
    * [~print](#module_api..print)
    * [~Timer](#module_api..Timer)
    * [~monthName](#module_api..monthName)
    * [~errorHandler(e)](#module_api..errorHandler)
    * [~who(ip, message)](#module_api..who)
    * [~getOldStatsList(month)](#module_api..getOldStatsList) ⇒ <code>Promise.&lt;MonthData&gt;</code>
    * [~parseLogs()](#module_api..parseLogs) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~fourohfour()](#module_api..fourohfour) ⇒ <code>HTML</code>
    * [~/()](#module_api../) ⇒ <code>JSON</code>
    * [~/status()](#module_api../status) ⇒ <code>JSON</code>
    * [~/auth()](#module_api../auth) ⇒ <code>JSON</code>
    * [~/stats()](#module_api../stats) ⇒ <code>JSON</code>
    * [~/old-months()](#module_api../old-months) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/old-stats/:month()](#module_api../old-stats/_month) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/playerList()](#module_api../playerList) ⇒ <code>JSON</code>
    * [~/newPlayers/:date()](#module_api../newPlayers/_date) ⇒ <code>JSON</code>
    * [~/returnPlayer/:date()](#module_api../returnPlayer/_date) ⇒ <code>Array</code>
    * [~/playerStats/:id()](#module_api../playerStats/_id) ⇒ <code>JSON</code> \| <code>HTML</code>
    * [~/download/:file(file)](#module_api../download/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/download/logs-zip/:file(file)](#module_api../download/logs-zip/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/download/demos-zip/:file(file)](#module_api../download/demos-zip/_file) ⇒ <code>File</code> \| <code>HTML</code>
    * [~/demos()](#module_api../demos) ⇒ <code>JSON</code>
    * [~/cvarlist()](#module_api../cvarlist) ⇒ <code>Text</code>
    * [~userConnected](#module_api..userConnected)
    * [~userDisconnected](#module_api..userDisconnected)
    * [~mapEnd](#module_api..mapEnd)
    * [~mapStart](#module_api..mapStart)
    * [~MonthData](#module_api..MonthData)
    * [~statsLoop](#module_api..statsLoop)

<a name="module_api..db"></a>

### api~db
mongoDB connection object

**Kind**: inner property of [<code>api</code>](#module_api)  
<a name="module_api..socket"></a>

### api~socket
WebSocket connection object

**Kind**: inner property of [<code>api</code>](#module_api)  
<a name="module_api..appData"></a>

### api~appData
application data model contains variables users, bannedUsers, totalPlayers, weapons, demos & playerTimer & methods to modify that data

**Kind**: inner property of [<code>api</code>](#module_api)  
**See**: modules/data-model/data-model.md#module_data-model..Data  
<a name="module_api..receiver"></a>

### api~receiver
Recieve logs on UDP port# 9871

**Kind**: inner property of [<code>api</code>](#module_api)  
<a name="module_api..server"></a>

### api~server
express server instance listening on the port from config.json

**Kind**: inner property of [<code>api</code>](#module_api)  
<a name="module_api..scanner"></a>

### api~scanner
**Kind**: inner constant of [<code>api</code>](#module_api)  
**See**: modules/lineScanner/lineScanner-doc.md  
<a name="module_api..Datamodel"></a>

### api~Datamodel
**Kind**: inner constant of [<code>api</code>](#module_api)  
**See**: modules/data-model/data-model-doc.md  
<a name="module_api..logUser"></a>

### api~logUser
logs a user connection to a mongodb session

**Kind**: inner constant of [<code>api</code>](#module_api)  
<a name="module_api..print"></a>

### api~print
log line a to console with timestamp

**Kind**: inner constant of [<code>api</code>](#module_api)  
<a name="module_api..Timer"></a>

### api~Timer
time things

**Kind**: inner constant of [<code>api</code>](#module_api)  
<a name="module_api..monthName"></a>

### api~monthName
switch statement for month name

**Kind**: inner constant of [<code>api</code>](#module_api)  
<a name="module_api..errorHandler"></a>

### api~errorHandler(e)
throw a error message stopping app when something breaks

**Kind**: inner method of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| e | <code>Object</code> | error object |

<a name="module_api..who"></a>

### api~who(ip, message)
prints out the players name when a known ip views a page or makes a request

**Kind**: inner method of [<code>api</code>](#module_api)  
**See**: modules/data-model/data-model-doc.md#module_data-model..Data+who  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip addres of the user viewing a page or making a request |
| message | <code>String</code> | the rest of the message |

<a name="module_api..getOldStatsList"></a>

### api~getOldStatsList(month) ⇒ <code>Promise.&lt;MonthData&gt;</code>
grabs stats object from json file for a given month

**Kind**: inner method of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>Number</code> | number of the month 0 - 11 *optional |

<a name="module_api..parseLogs"></a>

### api~parseLogs() ⇒ <code>Promise.&lt;String&gt;</code>
parse folder of logs 1 line @ a time. dumping each line into the scanner

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Promise.&lt;String&gt;</code> - duration to complete task  
**See**: modules/lineScanner.js  
<a name="module_api..fourohfour"></a>

### api~fourohfour() ⇒ <code>HTML</code>
404 page

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>HTML</code> - 404  
<a name="module_api../"></a>

### api~/() ⇒ <code>JSON</code>
route for WebSocket

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - websocket pipeline  
<a name="module_api../status"></a>

### api~/status() ⇒ <code>JSON</code>
route for gettings the status of the game server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - game server rcon status response  
<a name="module_api../auth"></a>

### api~/auth() ⇒ <code>JSON</code>
authorize stream for hoedowntv

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - ok: authorized, fail: failed to authorize  

| Param | Type | Description |
| --- | --- | --- |
| req.query.name | <code>String</code> | the name of the stream |
| req.query.k | <code>String</code> | the streams auth key |

<a name="module_api../stats"></a>

### api~/stats() ⇒ <code>JSON</code>
route for gettings player stats

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - stats top players list, server wide weapons list, # of total players, list of banned players, time of generation  
<a name="module_api../old-months"></a>

### api~/old-months() ⇒ <code>JSON</code> \| <code>HTML</code>
route for getting a list of avaliable data for prevoius months

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - list of months with stats history | 500  
<a name="module_api../old-stats/_month"></a>

### api~/old-stats/:month() ⇒ <code>JSON</code> \| <code>HTML</code>
route for getting a old months stats data

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - statistics from a previous month | 500  

| Param | Type | Description |
| --- | --- | --- |
| req.query.month | <code>Number</code> | index number of the months data |

<a name="module_api../playerList"></a>

### api~/playerList() ⇒ <code>JSON</code>
route for getting list of all players who has played in server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of all players to join server  
<a name="module_api../newPlayers/_date"></a>

### api~/newPlayers/:date() ⇒ <code>JSON</code>
return array of new users

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of players from the given date  

| Param | Type | Description |
| --- | --- | --- |
| req.params.date | <code>Number</code> | date of the month you want to view users for 0 = today |

<a name="module_api../returnPlayer/_date"></a>

### api~/returnPlayer/:date() ⇒ <code>Array</code>
return array of return users

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Array</code> - list of players from the given date  

| Param | Type | Description |
| --- | --- | --- |
| req.params.date | <code>Number</code> | date of this month you want to view user for 0 = today |

<a name="module_api../playerStats/_id"></a>

### api~/playerStats/:id() ⇒ <code>JSON</code> \| <code>HTML</code>
route for gettings a individual players stats

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> \| <code>HTML</code> - players stat data | 404  

| Param | Type | Description |
| --- | --- | --- |
| req.params.id | <code>Number</code> | steamid3 of the player |

<a name="module_api../download/_file"></a>

### api~/download/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a demo file

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .dem file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | file name requested for download |

<a name="module_api../download/logs-zip/_file"></a>

### api~/download/logs-zip/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a previous months logs zip files

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .zip file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | filename requested for download |

<a name="module_api../download/demos-zip/_file"></a>

### api~/download/demos-zip/:file(file) ⇒ <code>File</code> \| <code>HTML</code>
route for downloading a previous months demo zip files

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>File</code> \| <code>HTML</code> - .zip file | 404  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | filename requested for download |

<a name="module_api../demos"></a>

### api~/demos() ⇒ <code>JSON</code>
route to get list of demo recording on the server

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>JSON</code> - list of demo files  
<a name="module_api../cvarlist"></a>

### api~/cvarlist() ⇒ <code>Text</code>
route to get list of hl2dm server cvar's

**Kind**: inner method of [<code>api</code>](#module_api)  
**Returns**: <code>Text</code> - list of cvar commands  
<a name="module_api..userConnected"></a>

### api~userConnected
callback for when a player joins server

**Kind**: inner typedef of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| u | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

<a name="module_api..userDisconnected"></a>

### api~userDisconnected
callback for when a player leaves server

**Kind**: inner typedef of [<code>api</code>](#module_api)  

| Param | Type | Description |
| --- | --- | --- |
| u | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

<a name="module_api..mapEnd"></a>

### api~mapEnd
callback for when a round / map has ended

**Kind**: inner typedef of [<code>api</code>](#module_api)  
<a name="module_api..mapStart"></a>

### api~mapStart
callback for when a round / map has started

**Kind**: inner typedef of [<code>api</code>](#module_api)  
<a name="module_api..MonthData"></a>

### api~MonthData
**Kind**: inner typedef of [<code>api</code>](#module_api)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| files | <code>Array</code> | list of months. |
| Data | <code>Array</code> | players stats for the passed in month. |

<a name="module_api..statsLoop"></a>

### api~statsLoop
loops to get Gamedig data for game server

**Kind**: inner typedef of [<code>api</code>](#module_api)  
**See**

- modules/gameSeverStatus.js
- modules/data-model/data-model-doc.md#module_data-model..Data+updateStatus

