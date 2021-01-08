<a name="RconStats"></a>

## RconStats
run RCON stats and log response in influxdb to be graphed in grafana

**Kind**: global class  

* [RconStats](#RconStats)
    * [new RconStats()](#new_RconStats_new)
    * [._connect()](#RconStats+_connect) ⇒ <code>Promise.&lt;Void&gt;</code>
    * [._getStats()](#RconStats+_getStats) ⇒ <code>Promise.&lt;String&gt;</code>
    * [._parseStats(response)](#RconStats+_parseStats) ⇒ <code>CallableFunction.&lt;Object&gt;</code>
    * [.ping()](#RconStats+ping) ⇒ <code>Void</code>

<a name="new_RconStats_new"></a>

### new RconStats()
run RCON stats and log response in influxdb to be graphed in grafana

**Example** *(Example usage of RconStats Class.)*  
```js
new RconStats('127.0.0.1', 'suspersecurepassword', stats => {
// stats object that was logged to database
});
```
<a name="RconStats+_connect"></a>

### rconStats.\_connect() ⇒ <code>Promise.&lt;Void&gt;</code>
connects to the game server rcon

**Kind**: instance method of [<code>RconStats</code>](#RconStats)  
**Returns**: <code>Promise.&lt;Void&gt;</code> - nothing  
**Example** *(Example usage of _connect() function.)*  
```js
RconStats._connect().then(_ => {
// connected
});
```
<a name="RconStats+_getStats"></a>

### rconStats.\_getStats() ⇒ <code>Promise.&lt;String&gt;</code>
runs stats command

**Kind**: instance method of [<code>RconStats</code>](#RconStats)  
**Returns**: <code>Promise.&lt;String&gt;</code> - rcon stats output  
**Example** *(Example usage of _getStats() function.)*  
```js
RconStats._getStats().then(res => {
// res = stats output string
});
```
<a name="RconStats+_parseStats"></a>

### rconStats.\_parseStats(response) ⇒ <code>CallableFunction.&lt;Object&gt;</code>
get usable data from the response then loges it to database before passing it to the callback function

**Kind**: instance method of [<code>RconStats</code>](#RconStats)  
**Returns**: <code>CallableFunction.&lt;Object&gt;</code> - fires when stats are processed  

| Param | Type |
| --- | --- |
| response | <code>String</code> | 

**Example** *(Example usage of _parseStats() function.)*  
```js
RconStats._parseStats(res);
```
<a name="RconStats+ping"></a>

### rconStats.ping() ⇒ <code>Void</code>
loop to get data at a preset interval

**Kind**: instance method of [<code>RconStats</code>](#RconStats)  
**Returns**: <code>Void</code> - nothing  
**Example** *(Example usage of ping() function.)*  
```js
RconStats.ping();
```
