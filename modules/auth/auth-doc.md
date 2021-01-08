<a name="module_modules/auth"></a>

## modules/auth
authorization module.

**Requires**: <code>module:bcrypt</code>  
<a name="module_modules/auth..auth"></a>

### modules/auth~auth(db, name, pass) ⇒ <code>Promise.&lt;Boolean&gt;</code>
authorize

**Kind**: inner method of [<code>modules/auth</code>](#module_modules/auth)  
**Returns**: <code>Promise.&lt;Boolean&gt;</code> - promise to a boolean.  true: authorized, false: not authorized  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb connection object |
| name | <code>String</code> | the name of the stream / user |
| pass | <code>String</code> | the streams auth key / password |

**Example** *(Example usage of auth function.)*  
```js
var auth = require('modules/auth/auth');
auth(mongoDB-connection, 'registeredUser', 'supersecurepassword').then(authorized => {
  if (!authorized) return 'fail';
  return 'allowed';
})
```
