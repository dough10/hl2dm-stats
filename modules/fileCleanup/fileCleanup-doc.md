<a name="module_modules/fileCleanup"></a>

## modules/fileCleanup
make a zip and clean up previous months files

**Requires**: <code>module:path</code>, <code>module:fs</code>, <code>module:modules/loadConfig.js</code>, <code>module:child\_process</code>, <code>module:colors</code>, <code>module:modules/Timer</code>, <code>module:modules/printer.js</code>  

* [modules/fileCleanup](#module_modules/fileCleanup)
    * [~saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate)](#module_modules/fileCleanup..saveTop) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [~zipLogs(lastMonth)](#module_modules/fileCleanup..zipLogs) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [~zipDemos(lastMonth)](#module_modules/fileCleanup..zipDemos) ⇒ <code>Promise.&lt;Number&gt;</code>
    * [~deleteLogs()](#module_modules/fileCleanup..deleteLogs) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [~deleteDemos()](#module_modules/fileCleanup..deleteDemos) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [~cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate)](#module_modules/fileCleanup..cleanUp) ⇒ <code>Promise.&lt;Void&gt;</code>

<a name="module_modules/fileCleanup..saveTop"></a>

### modules/fileCleanup~saveTop(lastMonth, top, weapons, totalPlayers, bannedPlayers, lastUpdate) ⇒ <code>Promise.&lt;Number&gt;</code>
saves top data before log clear

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Number&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |
| top | <code>Array</code> | over 100 kills by kdr |
| weapons | <code>Array</code> | weapon stat data |
| totalPlayers | <code>Number</code> | count of players |
| bannedPlayers | <code>Array</code> | list of banned players |
| lastUpdate | <code>Number</code> | new Date() output |

**Example** *(Example usage of saveTop() function.)*  
```js
saveTop(1609123414390, [ 'players with over 100 kills sorted by kdr'], [ 'weapons' ], 212, [ 'banned players' ], 1609123414390).then(time => {
// time = 1609123414390
});
```
<a name="module_modules/fileCleanup..zipLogs"></a>

### modules/fileCleanup~zipLogs(lastMonth) ⇒ <code>Promise.&lt;Number&gt;</code>
zip log files before cleanUp deletes them

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Number&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

**Example** *(Example usage of zipLogs() function.)*  
```js
zipLogs(1609123414390).then(time => {
// time = 1609123414390
});
```
<a name="module_modules/fileCleanup..zipDemos"></a>

### modules/fileCleanup~zipDemos(lastMonth) ⇒ <code>Promise.&lt;Number&gt;</code>
will create a zip of all demo files in game server directory

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Number&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

**Example** *(Example usage of zipDemos() function.)*  
```js
zipDemos(1609123414390).then(time => {
// time = 1609123414390
});
```
<a name="module_modules/fileCleanup..deleteLogs"></a>

### modules/fileCleanup~deleteLogs() ⇒ <code>Promise.&lt;Void&gt;</code>
will remove all log files from logs folder **can not be undone**

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  
**Example** *(Example usage of deleteLogs() function.)*  
```js
deleteLogs().then(_ => {
// logs are gone!!
});
```
<a name="module_modules/fileCleanup..deleteDemos"></a>

### modules/fileCleanup~deleteDemos() ⇒ <code>Promise.&lt;Void&gt;</code>
will remove all demo files from game folder **can not be undone**

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  
**Example** *(Example usage of deleteDemos() function.)*  
```js
deleteDemos().then(_ => {
// demos are gone!!
});
```
<a name="module_modules/fileCleanup..cleanUp"></a>

### modules/fileCleanup~cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate) ⇒ <code>Promise.&lt;Void&gt;</code>
end of month file cleanup process

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| top | <code>Array</code> | over 100 kills by kdr |
| weapons | <code>Array</code> | weapon stat data |
| totalPlayers | <code>Number</code> | count of players |
| bannedPlayers | <code>Array</code> | list of banned players |
| lastUpdate | <code>Number</code> | new Date() output |

**Example** *(Example usage of cleanUp() function.)*  
```js
cleanUp([ 'players with over 100 kills sorted by kdr'], [ 'weapons' ], 212, [ 'banned players' ], 1609123414390).then(_ => {
 // cleanup complete
});
```
