<a name="module_modules/gameServerStatus"></a>

## modules/gameServerStatus
**Requires**: <code>module:Gamedig</code>  
<a name="exp_module_modules/gameServerStatus--module.exports"></a>

### module.exports() ⇒ <code>Object</code> ⏏
get GameDig data from game server

**Kind**: Exported function  
**Returns**: <code>Object</code> - gamedig server statsus object  
**Example** *(Example usage of gameServerStatus module.)*  
```js
gameServerStatus().then(status => {
  // console.log(status) = gamedig status 
});
```
