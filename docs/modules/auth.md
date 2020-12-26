<a name="module_modules/auth"></a>

## modules/auth
stream authorization module.

<a name="module_modules/auth..auth"></a>

### modules/auth~auth(db, name, pass) ⇒ <code>Boolean</code>
authorize stream upload

**Kind**: inner method of [<code>modules/auth</code>](#module_modules/auth)  
**Returns**: <code>Boolean</code> - returns true for authorized, false for failed  

| Param | Type | Description |
| --- | --- | --- |
| db | <code>Object</code> | mongodb object |
| name | <code>String</code> | the name of the stream |
| pass | <code>String</code> | the streams auth key |

