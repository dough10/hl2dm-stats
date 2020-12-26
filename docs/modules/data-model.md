<a name="module_data-model"></a>

## data-model
data module.


* [data-model](#module_data-model)
    * [module.exports](#exp_module_data-model--module.exports) ⏏
        * [new module.exports()](#new_module_data-model--module.exports_new)
        * [~playerObj(name, id, time, ip)](#module_data-model--module.exports..playerObj)
        * [~weaponObj()](#module_data-model--module.exports..weaponObj)
        * [~calculatePrecent(small, big)](#module_data-model--module.exports..calculatePrecent)
        * [~calculateWeaponStats(weapon)](#module_data-model--module.exports..calculateWeaponStats)
        * [~sortWeapons(user)](#module_data-model--module.exports..sortWeapons)
        * [~mergePhysicsKills(user)](#module_data-model--module.exports..mergePhysicsKills)

<a name="exp_module_data-model--module.exports"></a>

### module.exports ⏏
DATA!!!!!!

**Kind**: Exported class  
<a name="new_module_data-model--module.exports_new"></a>

#### new module.exports()
Data

<a name="module_data-model--module.exports..playerObj"></a>

#### module.exports~playerObj(name, id, time, ip)
returns a player object

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | name mof the player |
| id | <code>String</code> | player steamID |
| time | <code>Number</code> | new Date().getTime() output |
| ip | <code>String</code> | users ip address |

<a name="module_data-model--module.exports..weaponObj"></a>

#### module.exports~weaponObj()
returns defualt weapon object valuse

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  
<a name="module_data-model--module.exports..calculatePrecent"></a>

#### module.exports~calculatePrecent(small, big)
returns % value

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| small | <code>Number</code> | small # |
| big | <code>Number</code> | big # |

<a name="module_data-model--module.exports..calculateWeaponStats"></a>

#### module.exports~calculateWeaponStats(weapon)
calculates weapon stats values ie shots per kill, average damage per hit, headshot %, and more

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| weapon.name | <code>String</code> | name of the weapon |
| weapon | <code>String</code> | stats associated with the named weapon |

<a name="module_data-model--module.exports..sortWeapons"></a>

#### module.exports~sortWeapons(user)
remove weapon specific data from user object and place it in it's own array

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | a user object |

<a name="module_data-model--module.exports..mergePhysicsKills"></a>

#### module.exports~mergePhysicsKills(user)
merger all physics, physbox & world kills to physics kills

**Kind**: inner method of [<code>module.exports</code>](#exp_module_data-model--module.exports)  

| Param | Type | Description |
| --- | --- | --- |
| user | <code>Object</code> | a user object |

