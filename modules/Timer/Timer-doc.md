<a name="module_modules/Timer"></a>

## modules/Timer
**Requires**: <code>module:colors</code>  

* [modules/Timer](#module_modules/Timer)
    * [~Timer](#module_modules/Timer..Timer)
        * [new Timer(title)](#new_module_modules/Timer..Timer_new)
        * [.end()](#module_modules/Timer..Timer+end) ⇒ <code>Array</code>
        * [.endString()](#module_modules/Timer..Timer+endString) ⇒ <code>String</code>
    * [~colors](#module_modules/Timer..colors)

<a name="module_modules/Timer..Timer"></a>

### modules/Timer~Timer
Class for timing the duration of things

**Kind**: inner class of [<code>modules/Timer</code>](#module_modules/Timer)  

* [~Timer](#module_modules/Timer..Timer)
    * [new Timer(title)](#new_module_modules/Timer..Timer_new)
    * [.end()](#module_modules/Timer..Timer+end) ⇒ <code>Array</code>
    * [.endString()](#module_modules/Timer..Timer+endString) ⇒ <code>String</code>

<a name="new_module_modules/Timer..Timer_new"></a>

#### new Timer(title)

| Param | Type | Description |
| --- | --- | --- |
| title | <code>String</code> | name of the timer *optional* |

<a name="module_modules/Timer..Timer+end"></a>

#### timer.end() ⇒ <code>Array</code>
ends the timer

**Kind**: instance method of [<code>Timer</code>](#module_modules/Timer..Timer)  
**Returns**: <code>Array</code> - [0]hours, [1]mins, [2]seconds, [3]title/name  
<a name="module_modules/Timer..Timer+endString"></a>

#### timer.endString() ⇒ <code>String</code>
calls the end() method and formats into readable form

**Kind**: instance method of [<code>Timer</code>](#module_modules/Timer..Timer)  
**Returns**: <code>String</code> - timer output  
<a name="module_modules/Timer..colors"></a>

### modules/Timer~colors
colorize text

**Kind**: inner constant of [<code>modules/Timer</code>](#module_modules/Timer)  
