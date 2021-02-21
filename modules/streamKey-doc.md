<a name="module_modules/streamKey"></a>

## modules/streamKey
command line account creation tool

**Requires**: <code>module:bcrypt</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  
**Example** *(Example usage of streamKey file.)*  
```js
node modules/streamKey.js
```

* [modules/streamKey](#module_modules/streamKey)
    * [~checkEntry(name)](#module_modules/streamKey..checkEntry) ⇒ <code>Promise</code>
    * [~createUser(name, key)](#module_modules/streamKey..createUser) ⇒ <code>Void</code>

<a name="module_modules/streamKey..checkEntry"></a>

### modules/streamKey~checkEntry(name) ⇒ <code>Promise</code>
checks if a entry exists

**Kind**: inner method of [<code>modules/streamKey</code>](#module_modules/streamKey)  

| Param | Type |
| --- | --- |
| name | <code>String</code> | 

<a name="module_modules/streamKey..createUser"></a>

### modules/streamKey~createUser(name, key) ⇒ <code>Void</code>
adds a user & password to the database

**Kind**: inner method of [<code>modules/streamKey</code>](#module_modules/streamKey)  
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | username / stream name |
| key | <code>String</code> | authorization key / password |

