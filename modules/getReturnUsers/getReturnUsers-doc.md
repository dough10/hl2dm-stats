<a name="module_getReturnUsers"></a>

## getReturnUsers ⇒ <code>Promise.&lt;Array&gt;</code>
returns a list of  new users from the date givin

**Returns**: <code>Promise.&lt;Array&gt;</code> - list of returning users on the give day  
**Author**: Jimmy Doughten <https://github.com/dough10>  

| Param | Type | Description |
| --- | --- | --- |
| mongodb | <code>Object</code> | database connection object |
| date | <code>Number</code> | the date of this month to get user list for |

**Example** *(Example usage of getReturnusers() Functions.)*  
```js
getReturnUsers(mongodb, 13).then(list => {
 // console.log(list);  = returning users on the 13th 
});
```
