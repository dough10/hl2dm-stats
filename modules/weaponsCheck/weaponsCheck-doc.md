<a name="module_modules/weaponCheck"></a>

## modules/weaponCheck ⇒ <code>Boolean</code>
checks if weapon selection is a valid weapon name

**Returns**: <code>Boolean</code> - true: is a weapon name, false: is not a weapon name  

| Param | Type | Description |
| --- | --- | --- |
| weapon | <code>String</code> | name of a weapon |

**Example** *(Example usage of isWeapon() function.)*  
```js
var mag = isWeapon('357');
// console.log(mag) = true
// or 
if (!isWeapon('357') {
  return;
}
// it is a weapon name
```
