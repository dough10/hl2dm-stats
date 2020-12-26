<a name="module_modules/auth"></a>

## modules/auth
stream authorization module.

**Requires**: <code>module:bcrypt</code>  

* [modules/auth](#module_modules/auth)
    * [~bcrypt](#module_modules/auth..bcrypt)
    * [~auth(db, name, pass)](#module_modules/auth..auth) ⇒ <code>Promise.&lt;Object&gt;</code>

<a name="module_modules/auth..bcrypt"></a>

### modules/auth~bcrypt
hashing password / auth keys

**Kind**: inner constant of [<code>modules/auth</code>](#module_modules/auth)  
<a name="module_modules/auth..auth"></a>

### modules/auth~auth(db, name, pass) ⇒ <code>Promise.&lt;Object&gt;</code>
authorize stream

**Kind**: inner method of [<code>modules/auth</code>](#module_modules/auth)  
**Returns**: <code>Promise.&lt;Object&gt;</code> - returns user object for True, error if failed  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb connection object |
| name | <code>String</code> | the name of the stream / user |
| pass | <code>String</code> | the streams auth key / password |

