<a name="module_modules/cacheDemos"></a>

## modules/cacheDemos
query demo files from drive to cache for

**Requires**: <code>module:path</code>, <code>module:fs</code>, <code>module:colors</code>, <code>module:modules/printer</code>, <code>module:modules/Timer</code>  

* [modules/cacheDemos](#module_modules/cacheDemos)
    * [~createdDate(file)](#module_modules/cacheDemos..createdDate) ⇒ <code>String</code>
    * [~getFilesizeInBytes(filename)](#module_modules/cacheDemos..getFilesizeInBytes) ⇒ <code>Number</code>
    * [~bytesToSize(bytes)](#module_modules/cacheDemos..bytesToSize) ⇒ <code>String</code>
    * [~getDemos()](#module_modules/cacheDemos..getDemos) ⇒ <code>Promise.&lt;Arrray&gt;</code>
    * [~cacheDemos()](#module_modules/cacheDemos..cacheDemos) ⇒ <code>Promise.&lt;Array&gt;</code>

<a name="module_modules/cacheDemos..createdDate"></a>

### modules/cacheDemos~createdDate(file) ⇒ <code>String</code>
returns created date of a file

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>String</code> - date file was modified  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | path to the file |

**Example** *(Example usage of createdDate() function.)*  
```js
var created = createdDate('somedemo.dem');
// console.log(created); = '2020-12-29T07:45:12.737Z'
```
<a name="module_modules/cacheDemos..getFilesizeInBytes"></a>

### modules/cacheDemos~getFilesizeInBytes(filename) ⇒ <code>Number</code>
returns file size in bytes

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Number</code> - file size in bytes  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | file path |

**Example** *(Example usage of getFilesileInBytes() function.)*  
```js
var bytes = getFilesileInBytes('somedemo.dem');
// console.log(bytes); = 14567809
```
<a name="module_modules/cacheDemos..bytesToSize"></a>

### modules/cacheDemos~bytesToSize(bytes) ⇒ <code>String</code>
converts bytes to a readable string

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>String</code> - readable file size  

| Param | Type | Description |
| --- | --- | --- |
| bytes | <code>Number</code> | file size yay |

**Example** *(Example usage of bytesToSize() function.)*  
```js
var size = bytesToSize('somedemo.dem');
// console.log(size); = '13MB'
```
<a name="module_modules/cacheDemos..getDemos"></a>

### modules/cacheDemos~getDemos() ⇒ <code>Promise.&lt;Arrray&gt;</code>
returns array of demo files from game server dir

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Promise.&lt;Arrray&gt;</code> - list of demo files  
**Example** *(Example usage of getDemos() function.)*  
```js
getDemos().then(demos => {
// demos = [ list of demo files ];
});
```
<a name="module_modules/cacheDemos..cacheDemos"></a>

### modules/cacheDemos~cacheDemos() ⇒ <code>Promise.&lt;Array&gt;</code>
caches list of avaliable demo files

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - list of files with readable date and file size  
**Example** *(Example usage of cacheDemos() function.)*  
```js
cacheDemos().then(demoList => {
// demoList = [ list of demos with readable details ];
});
```
