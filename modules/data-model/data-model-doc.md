<a name="module_data-model"></a>

## data-model
Class to hold and manipulate the app data

**Requires**: <code>module:geoip-lite</code>  
**Example** *(Example usage of Data class.)*  
```js
var Datamodel = require('modules/data-model/data-model);
var appData = new Datamodel();
// call some functions
```

* [data-model](#module_data-model)
    * [~Data](#module_data-model..Data)
        * [.getStatus()](#module_data-model..Data+getStatus) ⇒ <code>Object</code>
        * [.updateStatus(status)](#module_data-model..Data+updateStatus)
        * [.reset()](#module_data-model..Data+reset) ⇒ <code>Promise.&lt;String&gt;</code>
        * [.playerConnect(time, id, name, ip)](#module_data-model..Data+playerConnect) ⇒ <code>Boolean</code>
        * [.playerDisconnect(id)](#module_data-model..Data+playerDisconnect) ⇒ <code>Promise.&lt;String&gt;</code>
        * [.generateTop()](#module_data-model..Data+generateTop) ⇒ <code>Array</code>
        * [.generateWeapons()](#module_data-model..Data+generateWeapons) ⇒ <code>Array</code>
        * [.generateBannedPlayerList()](#module_data-model..Data+generateBannedPlayerList) ⇒ <code>Array</code>
        * [.generatePlayerStats()](#module_data-model..Data+generatePlayerStats) ⇒ <code>Object</code>
        * [.who(ip)](#module_data-model..Data+who) ⇒ <code>String</code>
        * [.addKill(time, killer, killed, weapon)](#module_data-model..Data+addKill)
        * [.addSuicide(time, id, name, weapon)](#module_data-model..Data+addSuicide)
        * [.addHeadshot(time, id, name, weapon)](#module_data-model..Data+addHeadshot)
        * [.addBanned(id)](#module_data-model..Data+addBanned) ⇒ <code>Object</code>
        * [.addChat(time, id, name, said)](#module_data-model..Data+addChat)
        * [.addWeaponStats(time, id, name, weapon)](#module_data-model..Data+addWeaponStats)
        * [.addWeaponStats2(time, id, name, weapon)](#module_data-model..Data+addWeaponStats2)
        * [.cacheDemos()](#module_data-model..Data+cacheDemos) ⇒ <code>Promise.&lt;Array&gt;</code>
        * [.runCleanup()](#module_data-model..Data+runCleanup)
    * [~geoip](#module_data-model..geoip)
    * [~playerObj(name, id, time, ip)](#module_data-model..playerObj) ⇒ <code>Object</code>
    * [~weaponObj()](#module_data-model..weaponObj) ⇒ <code>Object</code>
    * [~calculatePrecent(small, big)](#module_data-model..calculatePrecent) ⇒ <code>Number</code>
    * [~calculateWeaponStats(weapon)](#module_data-model..calculateWeaponStats) ⇒ <code>Array</code>
    * [~sortWeapons(user)](#module_data-model..sortWeapons) ⇒ <code>Array</code>
    * [~mergePhysicsKills(user)](#module_data-model..mergePhysicsKills)

<a name="module_data-model..Data"></a>

### data-model~Data
Class to hold and manipulate the app data

**Kind**: inner class of [<code>data-model</code>](#module_data-model)  

* [~Data](#module_data-model..Data)
    * [.getStatus()](#module_data-model..Data+getStatus) ⇒ <code>Object</code>
    * [.updateStatus(status)](#module_data-model..Data+updateStatus)
    * [.reset()](#module_data-model..Data+reset) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.playerConnect(time, id, name, ip)](#module_data-model..Data+playerConnect) ⇒ <code>Boolean</code>
    * [.playerDisconnect(id)](#module_data-model..Data+playerDisconnect) ⇒ <code>Promise.&lt;String&gt;</code>
    * [.generateTop()](#module_data-model..Data+generateTop) ⇒ <code>Array</code>
    * [.generateWeapons()](#module_data-model..Data+generateWeapons) ⇒ <code>Array</code>
    * [.generateBannedPlayerList()](#module_data-model..Data+generateBannedPlayerList) ⇒ <code>Array</code>
    * [.generatePlayerStats()](#module_data-model..Data+generatePlayerStats) ⇒ <code>Object</code>
    * [.who(ip)](#module_data-model..Data+who) ⇒ <code>String</code>
    * [.addKill(time, killer, killed, weapon)](#module_data-model..Data+addKill)
    * [.addSuicide(time, id, name, weapon)](#module_data-model..Data+addSuicide)
    * [.addHeadshot(time, id, name, weapon)](#module_data-model..Data+addHeadshot)
    * [.addBanned(id)](#module_data-model..Data+addBanned) ⇒ <code>Object</code>
    * [.addChat(time, id, name, said)](#module_data-model..Data+addChat)
    * [.addWeaponStats(time, id, name, weapon)](#module_data-model..Data+addWeaponStats)
    * [.addWeaponStats2(time, id, name, weapon)](#module_data-model..Data+addWeaponStats2)
    * [.cacheDemos()](#module_data-model..Data+cacheDemos) ⇒ <code>Promise.&lt;Array&gt;</code>
    * [.runCleanup()](#module_data-model..Data+runCleanup)

<a name="module_data-model..Data+getStatus"></a>

#### data.getStatus() ⇒ <code>Object</code>
gets the current status of gameserver

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Object</code> - game server status  
**Example** *(Example usage of getStatus() function.)*  
```js
var status = appData.getStatus();
```
<a name="module_data-model..Data+updateStatus"></a>

#### data.updateStatus(status)
update game server status

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

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
appData.reset().then(_ => {
  // data has been reset
});
```
<a name="module_data-model..Data+playerConnect"></a>

#### data.playerConnect(time, id, name, ip) ⇒ <code>Boolean</code>
a player has connected to the game server

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Boolean</code> - true: new player, false: been bere before  

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
   // timeOnline = players time online
});
```
<a name="module_data-model..Data+generateTop"></a>

#### data.generateTop() ⇒ <code>Array</code>
creates a array of players with greater than or equal to 100 kills

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of players and their statistics  
<a name="module_data-model..Data+generateWeapons"></a>

#### data.generateWeapons() ⇒ <code>Array</code>
creates a array of weapon data

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of weapons sorted by kill count  
<a name="module_data-model..Data+generateBannedPlayerList"></a>

#### data.generateBannedPlayerList() ⇒ <code>Array</code>
creates a array of players who have been banned

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Array</code> - list of players  
<a name="module_data-model..Data+generatePlayerStats"></a>

#### data.generatePlayerStats() ⇒ <code>Object</code>
creates a object of a individual players stats

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Object</code> - players statistis  
<a name="module_data-model..Data+who"></a>

#### data.who(ip) ⇒ <code>String</code>
returns the player name associated with the passed in ip address

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>String</code> - name of a player, or the passed in ip address  

| Param | Type | Description |
| --- | --- | --- |
| ip | <code>String</code> | ip address from Express req.ip |

<a name="module_data-model..Data+addKill"></a>

#### data.addKill(time, killer, killed, weapon)
calculates player stats when a kill takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the kill happened |
| killer | <code>Object</code> | player details |
| killed | <code>Object</code> | player details |
| weapon | <code>String</code> | name of the weapon used |

<a name="module_data-model..Data+addSuicide"></a>

#### data.addSuicide(time, id, name, weapon)
calculates players stats when a suicide takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the suicide happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | players name |
| weapon | <code>String</code> | name of the weapon used |

<a name="module_data-model..Data+addHeadshot"></a>

#### data.addHeadshot(time, id, name, weapon)
calculates stats when a headshot takes place

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>String</code> | name of the weapon used |

<a name="module_data-model..Data+addBanned"></a>

#### data.addBanned(id) ⇒ <code>Object</code>
add player to the banned list

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Object</code> - player object  

| Param | Type | Description |
| --- | --- | --- |
| id | <code>String</code> | steamid3 of the player |

<a name="module_data-model..Data+addChat"></a>

#### data.addChat(time, id, name, said)
add change to user object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| said | <code>String</code> | chat line with timestamp |

<a name="module_data-model..Data+addWeaponStats"></a>

#### data.addWeaponStats(time, id, name, weapon)
add weapon stats to player object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>Object</code> | object of weapn data |

<a name="module_data-model..Data+addWeaponStats2"></a>

#### data.addWeaponStats2(time, id, name, weapon)
add weapon stats to player object

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  

| Param | Type | Description |
| --- | --- | --- |
| time | <code>Number</code> | time the headshot happened |
| id | <code>String</code> | steamid3 of the player |
| name | <code>String</code> | player name |
| weapon | <code>object</code> | object of weapn data |

<a name="module_data-model..Data+cacheDemos"></a>

#### data.cacheDemos() ⇒ <code>Promise.&lt;Array&gt;</code>
caches list of avaliable demo files

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - list of demos file avaliable to download  
<a name="module_data-model..Data+runCleanup"></a>

#### data.runCleanup()
runs end of month file cleanup process

**Kind**: instance method of [<code>Data</code>](#module_data-model..Data)  
**See**: modules/fileCleanup/fileCleanup-doc.md  
<a name="module_data-model..geoip"></a>

### data-model~geoip
geoip import

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

<a name="module_data-model..weaponObj"></a>

### data-model~weaponObj() ⇒ <code>Object</code>
returns defualt weapon object

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Object</code> - weapon object  
<a name="module_data-model..calculatePrecent"></a>

### data-model~calculatePrecent(small, big) ⇒ <code>Number</code>
returns % value

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Number</code> - precentage  

| Param | Type | Description |
| --- | --- | --- |
| small | <code>Number</code> | small # |
| big | <code>Number</code> | big # |

<a name="module_data-model..calculateWeaponStats"></a>

### data-model~calculateWeaponStats(weapon) ⇒ <code>Array</code>
calculates weapon stats values ie shots per kill, average damage per hit, headshot %, and more

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Array</code> - weapon stats  

| Param | Type | Description |
| --- | --- | --- |
| weapon.name | <code>String</code> | name of the weapon |
| weapon | <code>Object</code> | stats associated with the named weapon |

<a name="module_data-model..sortWeapons"></a>

### data-model~sortWeapons(user) ⇒ <code>Array</code>
remove weapon specific data from user object and place it in it's own array

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  
**Returns**: <code>Array</code> - array of weapons sorted by kill count  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | user object |

<a name="module_data-model..mergePhysicsKills"></a>

### data-model~mergePhysicsKills(user)
merge all physics kills, physbox & world kills to physics kills

**Kind**: inner method of [<code>data-model</code>](#module_data-model)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | a user object |

