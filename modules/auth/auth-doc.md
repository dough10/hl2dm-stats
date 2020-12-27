<a name="module_modules/auth"></a>

## modules/auth
authorization module.

**Requires**: <code>module:bcrypt</code>  

* [modules/auth](#module_modules/auth)
    * [~bcrypt](#module_modules/auth..bcrypt)
    * [~auth(db, name, pass)](#module_modules/auth..auth) ⇒ <code>Promise.&lt;Token&gt;</code>
    * [~Token](#module_modules/auth..Token)

<a name="module_modules/auth..bcrypt"></a>

### modules/auth~bcrypt
hashing password / auth keys

**Kind**: inner constant of [<code>modules/auth</code>](#module_modules/auth)  
<a name="module_modules/auth..auth"></a>

### modules/auth~auth(db, name, pass) ⇒ <code>Promise.&lt;Token&gt;</code>
authorize

**Kind**: inner method of [<code>modules/auth</code>](#module_modules/auth)  
**Returns**: <code>Promise.&lt;Token&gt;</code> - promise to a token  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb connection object |
| name | <code>String</code> | the name of the stream / user |
| pass | <code>String</code> | the streams auth key / password |

**Example** *(Example usage of auth function.)*  
```js
// returns true | false;
auth(mongoDB-connection, 'registeredUser', 'supersecurepassword').then(authorized => {
  if (!authorized) return 'fail';
  return 'allowed';
})
```
<a name="module_modules/auth..Token"></a>

### modules/auth~Token
**Kind**: inner typedef of [<code>modules/auth</code>](#module_modules/auth)  
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| match | <code>bool</code> | False if the token is invalid. |
| match | <code>JSON</code> | user info. |

