<a name="module_modules/fileCleanup"></a>

## modules/fileCleanup
make a zip and clean up previous months files

**Requires**: <code>module:path</code>, <code>module:fs</code>, <code>module:modules/loadConfig.js</code>, <code>module:child\_process</code>, <code>module:colors</code>, <code>module:modules/Timer</code>, <code>module:modules/printer.js</code>  

* [modules/fileCleanup](#module_modules/fileCleanup)
    * [~saveTop(lastMonth)](#module_modules/fileCleanup..saveTop) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~zipLogs(lastMonth)](#module_modules/fileCleanup..zipLogs) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~zipDemos(lastMonth)](#module_modules/fileCleanup..zipDemos) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~deleteLogs()](#module_modules/fileCleanup..deleteLogs) ⇒ <code>Promise</code>
    * [~deleteDemos()](#module_modules/fileCleanup..deleteDemos) ⇒ <code>Promise</code>
    * [~cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate)](#module_modules/fileCleanup..cleanUp) ⇒ <code>Promise</code>

<a name="module_modules/fileCleanup..saveTop"></a>

### modules/fileCleanup~saveTop(lastMonth) ⇒ <code>Promise.&lt;String&gt;</code>
saves top data before log clear

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;String&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="module_modules/fileCleanup..zipLogs"></a>

### modules/fileCleanup~zipLogs(lastMonth) ⇒ <code>Promise.&lt;String&gt;</code>
zip log files before cleanUp deletes them

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;String&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="module_modules/fileCleanup..zipDemos"></a>

### modules/fileCleanup~zipDemos(lastMonth) ⇒ <code>Promise.&lt;String&gt;</code>
zip demo files before cleanUp deletes them

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
**Returns**: <code>Promise.&lt;String&gt;</code> - lastmonth time string  

| Param | Type | Description |
| --- | --- | --- |
| lastMonth | <code>Number</code> | new Date() output for the time cleanup() was run |

<a name="module_modules/fileCleanup..deleteLogs"></a>

### modules/fileCleanup~deleteLogs() ⇒ <code>Promise</code>
remove all log files from logs folder

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
<a name="module_modules/fileCleanup..deleteDemos"></a>

### modules/fileCleanup~deleteDemos() ⇒ <code>Promise</code>
remove all demo files from game folder

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  
<a name="module_modules/fileCleanup..cleanUp"></a>

### modules/fileCleanup~cleanUp(top, weapons, totalPlayers, bannedPlayers, lastUpdate) ⇒ <code>Promise</code>
end of month file cleanup process

**Kind**: inner method of [<code>modules/fileCleanup</code>](#module_modules/fileCleanup)  

| Param | Type | Description |
| --- | --- | --- |
| top | <code>Array</code> | over 100 kills by kdr |
| weapons | <code>Array</code> | weapon stat data |
| totalPlayers | <code>Number</code> | count of players |
| bannedPlayers | <code>Array</code> | list of banned players |
| lastUpdate | <code>Number</code> | time string |

