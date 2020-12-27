<a name="module_modules/cacheDemos"></a>

## modules/cacheDemos
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

<a name="module_modules/cacheDemos..getFilesizeInBytes"></a>

### modules/cacheDemos~getFilesizeInBytes(filename) ⇒ <code>Number</code>
returns file size in bytes

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Number</code> - file size in bytes  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | file path |

<a name="module_modules/cacheDemos..bytesToSize"></a>

### modules/cacheDemos~bytesToSize(bytes) ⇒ <code>String</code>
converts bytes to a readable string

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>String</code> - readable file suze  

| Param | Type | Description |
| --- | --- | --- |
| bytes | <code>Number</code> | file size yay |

<a name="module_modules/cacheDemos..getDemos"></a>

### modules/cacheDemos~getDemos() ⇒ <code>Promise.&lt;Arrray&gt;</code>
returns array of demo files from game server dir

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Promise.&lt;Arrray&gt;</code> - list of demo files  
<a name="module_modules/cacheDemos..cacheDemos"></a>

### modules/cacheDemos~cacheDemos() ⇒ <code>Promise.&lt;Array&gt;</code>
caches list of avaliable demo files

**Kind**: inner method of [<code>modules/cacheDemos</code>](#module_modules/cacheDemos)  
**Returns**: <code>Promise.&lt;Array&gt;</code> - list of files with readable date and file size  
