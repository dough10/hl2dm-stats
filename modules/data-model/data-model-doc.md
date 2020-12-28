<a name="module_data-model"></a>

## data-model
data Class

**Requires**: <code>module:geoip-lite</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  
**Example** *(Example usage of Data class.)*  
```js
var Datamodel = require('modules/data-model/data-model');
var appData = new Datamodel();
// call some functions
```

* [data-model](#module_data-model)
    * [~Data](#module_data-model..Data)
        * [.getStatus()](#module_data-model..Data+getStatus) ⇒ <code>Object</code>
        * [.updateStatus(status)](#module_data-model..Data+updateStatus) ⇒ <code>void</code>
        * [.reset()](#module_data-model..Data+reset) ⇒ <code>Promise.&lt;String&gt;</code>
        * [.playerConnect(time, id, name, ip)](#module_data-model..Data+playerConnect) ⇒ <code>Boolean</code>
        * [.playerDisconnect(id)](#module_data-model..Data+playerDisconnect) ⇒ <code>Promise.&lt;String&gt;</code>
        * [.generateTop()](#module_data-model..Data+generateTop) ⇒ <code>Array</code>
        * [.generateWeapons()](#module_data-model..Data+generateWeapons) ⇒ <code>Array</code>
        * [.generateBannedPlayerList()](#module_data-model..Data+generateBannedPlayerList) ⇒ <code>Array</code>
        * [.generatePlayerStats()](#module_data-model..Data+generatePlayerStats) ⇒ <code>Object</code>
        * [.who(ip)](#module_data-model..Data+who) ⇒ <code>String</code>
        * [.addKill(time, killer, killed, weapon)](#module_data-model..Data+addKill) ⇒ <code>void</code>
        * [.addSuicide(time, id, name, weapon)](#module_data-model..Data+addSuicide) ⇒ <code>void</code>
        * [.addHeadshot(time, id, name, weapon)](#module_data-model..Data+addHeadshot) ⇒ <code>void</code>
        * [.addBanned(id)](#module_data-model..Data+addBanned) ⇒ <code>JSON</code>
        * [.addChat(time, id, name, said)](#module_data-model..Data+addChat) ⇒ <code>void</code>
        * [.addWeaponStats(time, id, name, weapon)](#module_data-model..Data+addWeaponStats) ⇒ <code>void</code>
        * [.addWeaponStats2(time, id, name, weapon)](#module_data-model..Data+addWeaponStats2) ⇒ <code>void</code>
        * [.cacheDemos()](#module_data-model..Data+cacheDemos) ⇒ <code>void</code>
        * [.runCleanup()](#module_data-model..Data+runCleanup) ⇒ <code>void</code>
    * [~geoip](#module_data-model..geoip)
    * [~Timer](#module_data-model..Timer)
    * [~playerObj(name, id, time, ip)](#module_data-model..playerObj) ⇒ <code>Object</code>
    * [~weaponObj()](#module_data-model..weaponObj) ⇒ <code>Object</code>
    * [~calculatePrecent(small, big)](#module_data-model..calculatePrecent) ⇒ <code>Number</code>
    * [~calculateWeaponStats(weapon)](#module_data-model..calculateWeaponStats) ⇒ <code>Array</code>
    * [~sortWeapons(user)](#module_data-model..sortWeapons) ⇒ <code>Array</code>
    * [~mergePhysicsKills(user)](#module_data-model..mergePhysicsKills) ⇒ <code>void</code>

<a name="module_data-model..Data"></a>

### data-model~Data
Class to hold and manipulate the app data

**Kind**: inner class of [<code>data-model</code>](#module_data-model)  

* [~Data](#module_data-model..Data)
    * [.getStatus()](#module_data-model..Data+getStatus) ⇒ <code>Object</code>
    * [.updateStatus(status)](#module_data-model..Data+updateStatus) ⇒ <code>void</code>
    * [.reset()](#module_data-model..Data+reset) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.playerConnect(time, id, name, ip)](#module_data-model..Data+playerConnect) ⇒ <code>Boolean</code>
    * [.playerDisconnect(id)](#module_data-model..Data+playerDisconnect) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.generateTop()](#module_data-model..Data+generateTop) ⇒ <code>Array</code>
    * [.generateWeapons()](#module_data-model..Data+generateWeapons) ⇒ <code>Array</code>
    * [.generateBannedPlayerList()](#module_data-model..Data+generateBannedPlayerList) ⇒ <code>Array</code>
    * [.generatePlayerStats()](#module_data-model..Data+generatePlayerStats) ⇒ <code>Object</code>
    * [.who(ip)](#module_data-model..Data+who) ⇒ <code>String</code>
    * [.addKill(time, killer, killed, weapon)](#module_data-model..Data+addKill) ⇒ <code>void</code>
    * [.addSuicide(time, id, name, weapon)](#module_data-model..Data+addSuicide) ⇒ <code>void</code>
    * [.addHeadshot(time, id, name, weapon)](#module_data-model..Data+addHeadshot) ⇒ <code>void</code>
    * [.addBanned(id)](#module_data-model..Data+addBanned) ⇒ <code>JSON</code>
    * [.addChat(time, id, name, said)](#module_data-model..Data+addChat) ⇒ <code>void</code>
    * [.addWeaponStats(time, id, name, weapon)](#module_data-model..Data+addWeaponStats) ⇒ <code>void</code>
    * [.addWeaponStats2(time, id, name, weapon)](#module_data-model..Data+addWeaponStats2) ⇒ <code>void</code>
    * [.cacheDemos()](#module_data-model..Data+cacheDemos) ⇒ <code>void</code>
    * [.runCleanup()](#module_data-model..Data+runCleanup) ⇒ <code>void</code>

<a name="module_data-model..Data+getStatus"></a>

#### data.getStatus() ⇒ <code>Object</code>
gets the status stored for the gameserver

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Object</code> - game server status  
**Example** *(Example usage of getStatus() function.)*  
```js
var status = appData.getStatus();
```
<a name="module_data-model..Data+updateStatus"></a>

#### data.updateStatus(status) ⇒ <code>void</code>
update stored gameserver status

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| status | <code>Object</code> | set the  game server status from Gamedig |

**Example** *(Example usage of updateStatus() function.)*  
```js
appData.updateStatus({
 // game server status object
});
```
<a name="module_data-model..Data+reset"></a>

#### data.reset() ⇒ <code>Promise.&lt;String&gt;</code>
reset data model

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Promise.&lt;String&gt;</code> - alert message notifying the change to data  
**Example** *(Example usage of reset() function.)*  
```js
appData.reset().then(resetString => {
// console.log(resetString) = `Data model reset`
});
```
<a name="module_data-model..Data+playerConnect"></a>

#### data.playerConnect(time, id, name, ip) ⇒ <code>Boolean</code>
a player has connected to the game server

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Boolean</code> - true: new for a player, false: if they have been here before  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the connection happened |
| id | <code>String</code> | steamid3 of the connecting player |
| name | <code>String</code> | player name of the connection player |
| ip | <code>String</code> | ip address of the connection player |

**Example** *(Example usage of playerConnect() function.)*  
```js
var newUser = appData.playerConnect(time, id, name, ip);
if (!newUser) {
  // do a thing
}
// do something else
```
<a name="module_data-model..Data+playerDisconnect"></a>

#### data.playerDisconnect(id) ⇒ <code>Promise.&lt;String&gt;</code>
a player has connected to the game server

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Promise.&lt;String&gt;</code> - timer object string  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | steamid3 of the connecting player |

**Example** *(Example usage of playerDisconnect() function.)*  
```js
appData.playerDisconnect(id).then(timeOnline => {
// console.log(timeOnline) = '0 hours 10 minutes 15.347 seconds'
});
```
<a name="module_data-model..Data+generateTop"></a>

#### data.generateTop() ⇒ <code>Array</code>
creates a array of players with greater than or equal to 100 kills

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of players and their statistics  
**Example** *(Example usage of generateTop() function.)*  
```js
var top = appData.generateTop();
// console.log(top) = [
//   { .. player },
//   { .. another player }
// ]
```
<a name="module_data-model..Data+generateWeapons"></a>

#### data.generateWeapons() ⇒ <code>Array</code>
creates a array of weapon data

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of weapons sorted by kill count  
**Example** *(Example usage of generateWeapons() function.)*  
```js
var weaponsData = appData.generateWeapons();
```
<a name="module_data-model..Data+generateBannedPlayerList"></a>

#### data.generateBannedPlayerList() ⇒ <code>Array</code>
creates a array of players who have been banned

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of players  
**Example** *(Example usage of generateBannedPlayerList() function.)*  
```js
var bannedPlayers = appData.generateBannedPlayerList(); 
```
<a name="module_data-model..Data+generatePlayerStats"></a>

#### data.generatePlayerStats() ⇒ <code>Object</code>
creates a object of a individual players stats

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Object</code> - players statistis  
**Example** *(Example usage of generatePlayerStats() function.)*  
```js
var playerStats = appData.generatePlayerStats();
```
<a name="module_data-model..Data+who"></a>

#### data.who(ip) ⇒ <code>String</code>
returns the player name associated with the passed in ip address

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>String</code> - name of a player, or the passed in ip address  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip address from Express req.ip |

**Example** *(Example usage of who() function.)*  
```js
var who = appData.who();
```
<a name="module_data-model..Data+addKill"></a>

#### data.addKill(time, killer, killed, weapon) ⇒ <code>void</code>
calculates player stats when a kill takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the kill happened |
| killer | <code>Object</code> | player details |
| killed | <code>Object</code> | player details |
| weapon | <code>String</code> | name of the weapon used |

**Example** *(Example usage of addKill() function.)*  
```js
appData.addKill(1609123414390, {...}, {...}, '357');
```
<a name="module_data-model..Data+addSuicide"></a>

#### data.addSuicide(time, id, name, weapon) ⇒ <code>void</code>
calculates players stats when a suicide takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the suicide happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | players name |
| weapon | <code>String</code> | name of the weapon used |

**Example** *(Example usage of addSuicide() function.)*  
```js
appData.addSuicide(1609123414390, '374586912', 'bob', '357');
```
<a name="module_data-model..Data+addHeadshot"></a>

#### data.addHeadshot(time, id, name, weapon) ⇒ <code>void</code>
calculates stats when a headshot takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>String</code> | name of the weapon used |

**Example** *(Example usage of addHeadshot() function.)*  
```js
appData.addHeadshot(1609123414390, '374586912', 'bob'):
```
<a name="module_data-model..Data+addBanned"></a>

#### data.addBanned(id) ⇒ <code>JSON</code>
add player to the banned list

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>JSON</code> - player object  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | steamid3 of the player |

**Example** *(Example usage of addBanned() function.)*  
```js
var player = appData.addBanned('374586912');
```
<a name="module_data-model..Data+addChat"></a>

#### data.addChat(time, id, name, said) ⇒ <code>void</code>
add change to user object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| said | <code>String</code> | chat line with timestamp |

**Example** *(Example usage of addChat() function.)*  
```js
appData.addChat(1609123414390, '374586912', 'bob', 'nice shot!');
```
<a name="module_data-model..Data+addWeaponStats"></a>

#### data.addWeaponStats(time, id, name, weapon) ⇒ <code>void</code>
add weapon stats to player object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>Object</code> | object of weapn data |

**Example** *(Example usage of addWeaponStats() function.)*  
```js
appData.addWeaponStats(1609123414390, '374586912', 'bob', {name: '357' ... });
```
<a name="module_data-model..Data+addWeaponStats2"></a>

#### data.addWeaponStats2(time, id, name, weapon) ⇒ <code>void</code>
add weapon stats to player object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>object</code> | object of weapn data |

**Example** *(Example usage of addWeaponStats2() function.)*  
```js
appData.addWeaponStats2(1609123414390, '374586912', 'bob', {name: '357' ... });
```
<a name="module_data-model..Data+cacheDemos"></a>

#### data.cacheDemos() ⇒ <code>void</code>
caches list of avaliable demo files

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  
**Example** *(Example usage of cacheDemos() function.)*  
```js
appData.cacheDemos();
```
<a name="module_data-model..Data+runCleanup"></a>

#### data.runCleanup() ⇒ <code>void</code>
runs end of month file cleanup process

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>void</code> - Nothing  
**See**: <a href=modules/fileCleanup/fileCleanup-doc.md>fileCleanup-doc.md</a>  
**Example** *(Example usage of runCleanup() function.)*  
```js
appData.runCleanup();
```
<a name="module_data-model..geoip"></a>

### data-model~geoip
geoip database

**Kind**: inner constant of [<code>data-model</code>](#module_data-model)  
<a name="module_data-model..Timer"></a>

### data-model~Timer
Timer module @see <a href=modules/Timer/Timer-doc.md>Timer-doc.md</a>

**Kind**: inner constant of [<code>data-model</code>](#module_data-model)  
<a name="module_data-model..playerObj"></a>

### data-model~playerObj(name, id, time, ip) ⇒ <code>Object</code>
returns a player object

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Object</code> - object with the passed in data and some 0 values  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name mof the player |
| id | <code>String</code> | player steamID |
| time | <code>Number</code> | new Date().getTime() output |
| ip | <code>String</code> | users ip address |

**Example** *(Example usage of playerObj() function.)*  
```js
var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
// console.log(bob) = {
//   name: 'bob',
//   id: '374586912',
//   ip: '25.65.8.357',
//   geo: [object Object],
//   kills: 0,
//   deaths: 0,
//   kdr: 0,
//   banned: false,
//   suicide: {
//     count:0
//   },
//   updated: 1609123414390,
//   chat: []
// }
```
<a name="module_data-model..weaponObj"></a>

### data-model~weaponObj() ⇒ <code>Object</code>
returns defualt weapon object

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Object</code> - weapon object  
**Example** *(Example usage of weaponObj() function.)*  
```js
var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
bob['357'] = weaponObj();
// console.log(bob['357']) = {
//     kills: 0,
//     shots: 0,
//     hits: 0,
//     headshots: 0,
//     head: 0,
//     chest: 0,
//     stomach: 0,
//     leftarm: 0,
//     rightarm: 0,
//     leftleg: 0,
//     rightleg:0,
//     damage:0,
//     hss:0,
//     lss:9999
//   }
```
<a name="module_data-model..calculatePrecent"></a>

### data-model~calculatePrecent(small, big) ⇒ <code>Number</code>
returns % value

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Number</code> - precentage  

| Param | Type | Description |
| --- | --- | --- |
| small | <code>Number</code> | small # |
| big | <code>Number</code> | big # |

**Example** *(Example usage of calculatePrecent() function.)*  
```js
var precent = calculatePrecent(60, 100);
// console.log(precent) = 60
```
<a name="module_data-model..calculateWeaponStats"></a>

### data-model~calculateWeaponStats(weapon) ⇒ <code>Array</code>
calculates weapon stats values ie shots per kill, average damage per hit, headshot %, and more

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Array</code> - weapon stats  

| Param | Type | Description |
| --- | --- | --- |
| weapon.name | <code>String</code> | name of the weapon |
| weapon | <code>Object</code> | stats associated with the named weapon |

**Example** *(Example usage of calculateWeaponStats() function.)*  
```js
var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
bob['357'] = weaponObj();
bob.weapons['357'] = calculateWeaponStats('357', bob['357']);
delete bob['357'];
```
<a name="module_data-model..sortWeapons"></a>

### data-model~sortWeapons(user) ⇒ <code>Array</code>
remove weapon specific data from user object and place it in it's own array

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Array</code> - array of weapons sorted by kill count  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | user object |

**Example** *(Example usage of sortWeapons() function.)*  
```js
var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
bob['357'] = weaponObj();
// got some kills 
bob.weapons = sortWeapons();
```
<a name="module_data-model..mergePhysicsKills"></a>

### data-model~mergePhysicsKills(user) ⇒ <code>void</code>
merge all physics kills, physbox & world kills to physics kills

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>void</code> - Nothing  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | a user object |

**Example** *(Example usage of sortWeapons() function.)*  
```js
var bob = playerObj('bob', '374586912', 1609123414390, '25.65.8.357');
bob['357'] = weaponObj();
mergePhysicsKills(bob);
bob.weapons = sortWeapons();
```
