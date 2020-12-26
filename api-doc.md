## Members

<dl>
<dt><a href="#appData">appData</a></dt>
<dd><p>application data model</p>
<p> contains variables users, bannedUsers, totalPlayers, weapons, demos &amp; playerTimer</p>
</dd>
<dt><a href="#receiver">receiver</a></dt>
<dd><p>Recieve logs on UDP port# 9871</p>
</dd>
<dt><a href="#server">server</a></dt>
<dd><p>express server instance listening on config.port</p>
</dd>
</dl>

## Constants

<dl>
<dt><a href="#scanner">scanner</a></dt>
<dd><p>reads log one line at a time looking for game events</p>
</dd>
<dt><a href="#Datamodel">Datamodel</a></dt>
<dd><p>data - this data has Class ;)</p>
</dd>
<dt><a href="#logUser">logUser</a></dt>
<dd><p>logs a user connection to a mongodb session</p>
</dd>
<dt><a href="#print">print</a></dt>
<dd><p>log line a to console with timestamp</p>
</dd>
<dt><a href="#Timer">Timer</a></dt>
<dd><p>time things</p>
</dd>
<dt><a href="#monthName">monthName</a></dt>
<dd><p>switch statement get get month name</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#errorHandler">errorHandler()</a></dt>
<dd><p>throw a error message stopping app when something breaks</p>
</dd>
<dt><a href="#userConnected">userConnected(user)</a></dt>
<dd><p>callback for when a player joins server</p>
</dd>
<dt><a href="#userDisconnected">userDisconnected(user)</a></dt>
<dd><p>callback for when a player leaves server</p>
</dd>
<dt><a href="#mapEnd">mapEnd()</a></dt>
<dd><p>callback for when a round / map has ended</p>
</dd>
<dt><a href="#mapStart">mapStart()</a></dt>
<dd><p>callback for when a round / map has started</p>
</dd>
<dt><a href="#who">who(ip, message)</a></dt>
<dd><p>print out player name when a known ip views page</p>
</dd>
<dt><a href="#getOldStatsList">getOldStatsList(month)</a></dt>
<dd><p>grabs stats object from json file for a given month</p>
</dd>
<dt><a href="#statsLoop">statsLoop()</a></dt>
<dd></dd>
<dt><a href="#parseLogs">parseLogs()</a></dt>
<dd><p>parse folder of logs 1 line @ a time. dumping each line into the scanner</p>
</dd>
<dt><a href="#fourohfour">fourohfour()</a></dt>
<dd><p>404 page</p>
</dd>
<dt><a href="#api/">api/()</a> ⇒ <code>Array</code></dt>
<dd><p>route for WebSocket</p>
</dd>
<dt><a href="#api/status">api/status()</a> ⇒ <code>Object</code></dt>
<dd><p>route for gettings the status of the game server</p>
</dd>
<dt><a href="#api/stats">api/stats()</a> ⇒ <code>Array</code></dt>
<dd><p>route for gettings player stats</p>
</dd>
</dl>

<a name="appData"></a>

## appData
application data model contains variables users, bannedUsers, totalPlayers, weapons, demos & playerTimer

**Kind**: global variable  
<a name="receiver"></a>

## receiver
Recieve logs on UDP port# 9871

**Kind**: global variable  
<a name="server"></a>

## server
express server instance listening on config.port

**Kind**: global variable  
<a name="scanner"></a>

## scanner
reads log one line at a time looking for game events

**Kind**: global constant  
<a name="Datamodel"></a>

## Datamodel
data - this data has Class ;)

**Kind**: global constant  
<a name="logUser"></a>

## logUser
logs a user connection to a mongodb session

**Kind**: global constant  
<a name="print"></a>

## print
log line a to console with timestamp

**Kind**: global constant  
<a name="Timer"></a>

## Timer
time things

**Kind**: global constant  
<a name="monthName"></a>

## monthName
switch statement get get month name

**Kind**: global constant  
<a name="errorHandler"></a>

## errorHandler()
throw a error message stopping app when something breaks

**Kind**: global function  
<a name="userConnected"></a>

## userConnected(user)
callback for when a player joins server

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

<a name="userDisconnected"></a>

## userDisconnected(user)
callback for when a player leaves server

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | user object with name, id, time, date, month, year, and if user is new to server |

<a name="mapEnd"></a>

## mapEnd()
callback for when a round / map has ended

**Kind**: global function  
<a name="mapStart"></a>

## mapStart()
callback for when a round / map has started

**Kind**: global function  
<a name="who"></a>

## who(ip, message)
print out player name when a known ip views page

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip addres of the user |
| message | <code>String</code> | message string |

<a name="getOldStatsList"></a>

## getOldStatsList(month)
grabs stats object from json file for a given month

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| month | <code>Number</code> | number of the month 0 - 11 |

<a name="statsLoop"></a>

## statsLoop()
**Kind**: global function  
<a name="parseLogs"></a>

## parseLogs()
parse folder of logs 1 line @ a time. dumping each line into the scanner

**Kind**: global function  
<a name="fourohfour"></a>

## fourohfour()
404 page

**Kind**: global function  
<a name="api/"></a>

## api/() ⇒ <code>Array</code>
route for WebSocket

**Kind**: global function  
**Returns**: <code>Array</code> - websocket pipeline  
<a name="api/status"></a>

## api/status() ⇒ <code>Object</code>
route for gettings the status of the game server

**Kind**: global function  
**Returns**: <code>Object</code> - game server rcon status response  
<a name="api/stats"></a>

## api/stats() ⇒ <code>Array</code>
route for gettings player stats

**Kind**: global function  
**Returns**: <code>Array</code> - stats top players list, server wide weapons list, # of total players, list of banned players, time of generation  
