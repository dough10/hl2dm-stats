## Members

<dl>
<dt><a href="#appData">appData</a></dt>
<dd><p>DATA!!!!!!</p>
</dd>
<dt><a href="#receiver">receiver</a></dt>
<dd><p>Log reciver</p>
</dd>
<dt><a href="#j">j</a></dt>
<dd><p>cleanup files on first @ 5:00am</p>
</dd>
<dt><a href="#server">server</a></dt>
<dd><p>Go Live!!</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#errorHandler">errorHandler()</a></dt>
<dd><p>throw a error</p>
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
</dl>

<a name="appData"></a>

## appData
DATA!!!!!!

**Kind**: global variable  
<a name="receiver"></a>

## receiver
Log reciver

**Kind**: global variable  
<a name="j"></a>

## j
cleanup files on first @ 5:00am

**Kind**: global variable  
<a name="server"></a>

## server
Go Live!!

**Kind**: global variable  
<a name="errorHandler"></a>

## errorHandler()
throw a error

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
