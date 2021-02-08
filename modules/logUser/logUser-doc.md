<a name="module_modules/logUser"></a>

## modules/logUser
**Author**: Jimmy Doughten <https://github.com/dough10>  

* [modules/logUser](#module_modules/logUser)
    * [~entryExists(db, data)](#module_modules/logUser..entryExists) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [~insertPlayer(db, data)](#module_modules/logUser..insertPlayer) ⇒ <code>Promise.&lt;Object&gt;</code>
    * [~logUser(db, data)](#module_modules/logUser..logUser) ⇒ <code>Promise.&lt;Void&gt;</code>

<a name="module_modules/logUser..entryExists"></a>

### modules/logUser~entryExists(db, data) ⇒ <code>Promise.&lt;Object&gt;</code>
checks mongodb instance to see if entry exists

**Kind**: inner method of [<code>modules/logUser</code>](#module_modules/logUser)  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb instance object |
| data | <code>Object</code> | data object to be saved to the database |

<a name="module_modules/logUser..insertPlayer"></a>

### modules/logUser~insertPlayer(db, data) ⇒ <code>Promise.&lt;Object&gt;</code>
inserts object into mongodb instance

**Kind**: inner method of [<code>modules/logUser</code>](#module_modules/logUser)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - the saved entry  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb instance object |
| data | <code>Object</code> | data object to be saved to the database |

<a name="module_modules/logUser..logUser"></a>

### modules/logUser~logUser(db, data) ⇒ <code>Promise.&lt;Void&gt;</code>
checks database to see if entry exists and if ti doesn't it will save the data

**Kind**: inner method of [<code>modules/logUser</code>](#module_modules/logUser)  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb instance object |
| data | <code>Object</code> | data object to be saved to the database |

