<a name="module_modules/Timer"></a>

## modules/Timer
Class for timing the duration of things

**Author**: Jimmy Doughten <https://github.com/dough10>  

* [modules/Timer](#module_modules/Timer)
    * [~Timer](#module_modules/Timer..Timer)
        * [new Timer(title)](#new_module_modules/Timer..Timer_new)
        * [.end()](#module_modules/Timer..Timer+end) ⇒ <code>Array</code>
        * [.endString()](#module_modules/Timer..Timer+endString) ⇒ <code>String</code>

<a name="module_modules/Timer..Timer"></a>

### modules/Timer~Timer
**Kind**: inner class of [<code>modules/Timer</code>](#module_modules/Timer)  

* [~Timer](#module_modules/Timer..Timer)
    * [new Timer(title)](#new_module_modules/Timer..Timer_new)
    * [.end()](#module_modules/Timer..Timer+end) ⇒ <code>Array</code>
    * [.endString()](#module_modules/Timer..Timer+endString) ⇒ <code>String</code>

<a name="new_module_modules/Timer..Timer_new"></a>

#### new Timer(title)
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | name of the timer *optional* |

**Example** *(Example usage of Timer Class.)*  
```js
let Timer = require('modules/Timer/Timer);
let t = new Timer('thing');
```
<a name="module_modules/Timer..Timer+end"></a>

#### timer.end() ⇒ <code>Array</code>
ends the timer

**Kind**: instance method of [<code>Timer</code>](#module_modules/Timer..Timer)  
**Returns**: <code>Array</code> - [0]hours, [1]mins, [2]seconds, [3]title/name  
**Example** *(Example usage of end() function.)*  
```js
let Timer = require('modules/Timer/Timer);
let t = new Timer('thing');
// do stuff you want to see how long it will take
console.log(t.end());
// returns [0, 10, 15.347, 'thing']
```
<a name="module_modules/Timer..Timer+endString"></a>

#### timer.endString() ⇒ <code>String</code>
calls the end() method and formats into readable form

**Kind**: instance method of [<code>Timer</code>](#module_modules/Timer..Timer)  
**Returns**: <code>String</code> - timer output  
**Example** *(Example usage of endString() Function.)*  
```js
let Timer = require('modules/Timer/Timer);
let t = new Timer('thing');
// do stuff you want to see how long it will take
console.log(t.endString());
// returns 'thing - 0 hours 10 minutes 15.347 seconds'
```
