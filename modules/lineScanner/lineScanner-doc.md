<a name="module_modules/lineScanner"></a>

## modules/lineScanner
**Requires**: <code>module:steamid</code>, <code>module:modules/weaponsCheck</code>, <code>module:modules/printer</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  

* [modules/lineScanner](#module_modules/lineScanner)
    * [~validateIPaddress(ip)](#module_modules/lineScanner..validateIPaddress) ⇒ <code>Boolean</code>
    * [~isFileStart(line)](#module_modules/lineScanner..isFileStart) ⇒ <code>Boolean</code>
    * [~isFileEnd(line)](#module_modules/lineScanner..isFileEnd) ⇒ <code>Boolean</code>
    * [~getName(word)](#module_modules/lineScanner..getName) ⇒ <code>String</code>
    * [~getID2(word)](#module_modules/lineScanner..getID2) ⇒ <code>String</code>
    * [~getID3(word)](#module_modules/lineScanner..getID3) ⇒ <code>String</code>
    * [~isTime(str)](#module_modules/lineScanner..isTime) ⇒ <code>Boolean</code>
    * [~buildKillerNameString(line, end)](#module_modules/lineScanner..buildKillerNameString) ⇒ <code>String</code>
    * [~buildKilledNameString(line, start)](#module_modules/lineScanner..buildKilledNameString) ⇒ <code>String</code>
    * [~lineIsKill(line)](#module_modules/lineScanner..lineIsKill) ⇒ <code>Number</code>
    * [~lineIsConnect(line)](#module_modules/lineScanner..lineIsConnect) ⇒ <code>Boolean</code>
    * [~lineIsSuicide(line)](#module_modules/lineScanner..lineIsSuicide) ⇒ <code>Boolean</code>
    * [~lineIsChat(line)](#module_modules/lineScanner..lineIsChat) ⇒ <code>Boolean</code>
    * [~lineIsHeadshot(line)](#module_modules/lineScanner..lineIsHeadshot) ⇒ <code>Boolean</code>
    * [~lineIsStats(line)](#module_modules/lineScanner..lineIsStats) ⇒ <code>Boolean</code>
    * [~lineIsStats2(line)](#module_modules/lineScanner..lineIsStats2) ⇒ <code>Boolean</code>
    * [~lineIsConsole(line)](#module_modules/lineScanner..lineIsConsole) ⇒ <code>Boolean</code>
    * [~playerIsBanned(line)](#module_modules/lineScanner..playerIsBanned) ⇒ <code>Boolean</code>
    * [~playerHasDisconnected(line)](#module_modules/lineScanner..playerHasDisconnected) ⇒ <code>Boolean</code>
    * [~getLineTime(line)](#module_modules/lineScanner..getLineTime) ⇒ <code>String</code>
    * [~scanLine(line, onKill, onChat, onSuicide, onHeadshot, onStats, onStats2, onJoin, onDisconnect, onMapStart, onMapEnd, loggingEnabled)](#module_modules/lineScanner..scanLine)

<a name="module_modules/lineScanner..validateIPaddress"></a>

### modules/lineScanner~validateIPaddress(ip) ⇒ <code>Boolean</code>
check if ip  address is valid

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - true: validated, false: failed  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip address |

**Example** *(Example usage of validateIPAddress() function.)*  
```js
console.log(validateIPaddress('192.168.0.1')); = true
```
<a name="module_modules/lineScanner..isFileStart"></a>

### modules/lineScanner~isFileStart(line) ⇒ <code>Boolean</code>
scans the line for file start

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

**Example** *(Example usage of isFileStart() function.)*  
```js
isFileStart([
  'list',
  'of',
  'words',
  'to',
  'check'
]);
```
<a name="module_modules/lineScanner..isFileEnd"></a>

### modules/lineScanner~isFileEnd(line) ⇒ <code>Boolean</code>
scans the line for file end

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

**Example** *(Example usage of isFileEnd() function.)*  
```js
isFileEnd([
  'list',
  'of',
  'words',
  'to',
  'check'
]);
```
<a name="module_modules/lineScanner..getName"></a>

### modules/lineScanner~getName(word) ⇒ <code>String</code>
returns the player name string

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - players name  

| Param | Type | Description |
| --- | --- | --- |
| word | <code>String</code> | player name string |

**Example** *(Example usage of getName() function.)*  
```js
let name = getName([
  'list',
  'of',
  'words',
  'to',
  'check'
]);
```
<a name="module_modules/lineScanner..getID2"></a>

### modules/lineScanner~getID2(word) ⇒ <code>String</code>
returns the player steamID in format 2

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - players steamid in steamid2 format  

| Param | Type | Description |
| --- | --- | --- |
| word | <code>String</code> | player name string |

**Example** *(Example usage of getID2() function.)*  
```js
let steamid = getID2([
  'list',
  'of',
  'words',
  'to',
  'check'
]);
```
<a name="module_modules/lineScanner..getID3"></a>

### modules/lineScanner~getID3(word) ⇒ <code>String</code>
returns the player steamID in format 3

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - returns players SteamID in steamid3 format without [U:1:XXXXXXXXX] jsut the numbers  

| Param | Type | Description |
| --- | --- | --- |
| word | <code>String</code> | player name string |

**Example** *(Example usage of getID3() function.)*  
```js
let steamid = getID3([
  'list',
  'of',
  'words',
  'to',
  'check'
]);
```
<a name="module_modules/lineScanner..isTime"></a>

### modules/lineScanner~isTime(str) ⇒ <code>Boolean</code>
if a string of text a time string

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - true: string is a time string, false: is not time stringconsole.log(isTime('12:59:59')); = true  

| Param | Type | Description |
| --- | --- | --- |
| str | <code>String</code> | player name string |

<a name="module_modules/lineScanner..buildKillerNameString"></a>

### modules/lineScanner~buildKillerNameString(line, end) ⇒ <code>String</code>
builds a name string if name was broken by .split()

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - returns killers name  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line from a log file broken at spaces |
| end | <code>Number</code> | index point of the end of the name string |

**Example** *(Example usage of buildKillerNameString() function.)*  
```js
let killer = buildKillerNameString([
  'list',
  'of',
  'words',
  'to',
  'check',
  '.'
], 6);
```
<a name="module_modules/lineScanner..buildKilledNameString"></a>

### modules/lineScanner~buildKilledNameString(line, start) ⇒ <code>String</code>
builds a name string if name was broken by .split()

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - returns killed player name string  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line from a log file broken @ spaces |
| start | <code>Number</code> | index point of the start of the name string |

**Example** *(Example usage of buildKilledNameString() function.)*  
```js
let killed = buildKilledNameString([
  'list',
  'of',
  'words',
  'to',
  'check',
  '.'
], 4);
```
<a name="module_modules/lineScanner..lineIsKill"></a>

### modules/lineScanner~lineIsKill(line) ⇒ <code>Number</code>
scans the line for player kill

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Number</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsConnect"></a>

### modules/lineScanner~lineIsConnect(line) ⇒ <code>Boolean</code>
scans the line for player connection

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsSuicide"></a>

### modules/lineScanner~lineIsSuicide(line) ⇒ <code>Boolean</code>
scans the line for suicide

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsChat"></a>

### modules/lineScanner~lineIsChat(line) ⇒ <code>Boolean</code>
scans the line for chat

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsHeadshot"></a>

### modules/lineScanner~lineIsHeadshot(line) ⇒ <code>Boolean</code>
scans the line for headshot

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsStats"></a>

### modules/lineScanner~lineIsStats(line) ⇒ <code>Boolean</code>
scans the line for weaponstats

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsStats2"></a>

### modules/lineScanner~lineIsStats2(line) ⇒ <code>Boolean</code>
scans the line for weaponstats2

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..lineIsConsole"></a>

### modules/lineScanner~lineIsConsole(line) ⇒ <code>Boolean</code>
scans the line for console message

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..playerIsBanned"></a>

### modules/lineScanner~playerIsBanned(line) ⇒ <code>Boolean</code>
scans the line for ban

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..playerHasDisconnected"></a>

### modules/lineScanner~playerHasDisconnected(line) ⇒ <code>Boolean</code>
scans the line for player disconnect

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>Boolean</code> - result of Array.indexOf();  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..getLineTime"></a>

### modules/lineScanner~getLineTime(line) ⇒ <code>String</code>
scans the line for time

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  
**Returns**: <code>String</code> - timestring;  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed |

<a name="module_modules/lineScanner..scanLine"></a>

### modules/lineScanner~scanLine(line, onKill, onChat, onSuicide, onHeadshot, onStats, onStats2, onJoin, onDisconnect, onMapStart, onMapEnd, loggingEnabled)
scans the line for usable data for the data-model   **update params**

**Kind**: inner method of [<code>modules/lineScanner</code>](#module_modules/lineScanner)  

| Param | Type | Description |
| --- | --- | --- |
| line | <code>Array</code> | one line of the log file being parsed split at spaces |
| onKill | <code>function</code> | callback for when a player gets a kill |
| onChat | <code>function</code> | callback for when a player chats |
| onSuicide | <code>function</code> | callback for when a player kills themselves |
| onHeadshot | <code>function</code> | callback for when a player gets a headshot |
| onStats | <code>function</code> | callback for when a player stats is posted |
| onStats2 | <code>function</code> | callback for when a player stats2 is posted |
| onJoin | <code>function</code> | callback when player joins server @link api-doc.md#module_api..userConnected |
| onDisconnect | <code>function</code> | callback when player leaves server @link api-doc.md#module_api..userDisconnected |
| onMapStart | <code>function</code> | callback when the map begins @link api-doc.md#apimapstart |
| onMapEnd | <code>function</code> | callback when the map ends @link api-doc.md#apimapend |
| loggingEnabled | <code>Boolean</code> | log to console. (used to avoid spam when scanning logs when getting data from realtime from rcon logs) |

