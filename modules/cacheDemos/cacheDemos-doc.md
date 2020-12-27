## Functions

<dl>
<dt><a href="#createdDate">createdDate(file)</a> ⇒ <code>String</code></dt>
<dd><p>returns created date of a file</p>
</dd>
<dt><a href="#getFilesizeInBytes">getFilesizeInBytes(filename)</a> ⇒ <code>Number</code></dt>
<dd><p>returns file size in bytes</p>
</dd>
<dt><a href="#bytesToSize">bytesToSize(bytes)</a> ⇒ <code>String</code></dt>
<dd><p>converts bytes to a readable string</p>
</dd>
<dt><a href="#getDemos">getDemos()</a> ⇒ <code>Promise.&lt;Arrray&gt;</code></dt>
<dd><p>returns array of demo files from game server dir</p>
</dd>
<dt><a href="#cacheDemos">cacheDemos()</a> ⇒ <code>Promise.&lt;Array&gt;</code></dt>
<dd><p>caches list of avaliable demo files</p>
</dd>
</dl>

<a name="createdDate"></a>

## createdDate(file) ⇒ <code>String</code>
returns created date of a file

**Kind**: global function  
**Returns**: <code>String</code> - date file was modified  

| Param | Type | Description |
| --- | --- | --- |
| file | <code>String</code> | path to the file |

<a name="getFilesizeInBytes"></a>

## getFilesizeInBytes(filename) ⇒ <code>Number</code>
returns file size in bytes

**Kind**: global function  
**Returns**: <code>Number</code> - file size in bytes  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | file path |

<a name="bytesToSize"></a>

## bytesToSize(bytes) ⇒ <code>String</code>
converts bytes to a readable string

**Kind**: global function  
**Returns**: <code>String</code> - readable file suze  

| Param | Type | Description |
| --- | --- | --- |
| bytes | <code>Number</code> | file size yay |

<a name="getDemos"></a>

## getDemos() ⇒ <code>Promise.&lt;Arrray&gt;</code>
returns array of demo files from game server dir

**Kind**: global function  
**Returns**: <code>Promise.&lt;Arrray&gt;</code> - list of demo files  
<a name="cacheDemos"></a>

## cacheDemos() ⇒ <code>Promise.&lt;Array&gt;</code>
caches list of avaliable demo files

**Kind**: global function  
**Returns**: <code>Promise.&lt;Array&gt;</code> - list of files with readable date and file size  
