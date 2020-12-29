## Members

<dl>
<dt><a href="#files">files</a></dt>
<dd><p>list of javascript files to process for docs without the file extension</p>
</dd>
</dl>

## Functions

<dl>
<dt><a href="#writeFile">writeFile(name, md)</a> ⇒ <code>Promise.&lt;String&gt;</code></dt>
<dd><p>save a file</p>
</dd>
<dt><a href="#renderDoc">renderDoc(filename)</a> ⇒ <code>Void</code></dt>
<dd><p>renders a markdown document file from javascript comment</p>
</dd>
<dt><a href="#dependencies">dependencies()</a> ⇒ <code>String</code></dt>
<dd><p>output dependencies as a string</p>
</dd>
<dt><a href="#devDependencies">devDependencies()</a> ⇒ <code>String</code></dt>
<dd><p>output dev dependencies as a string</p>
</dd>
<dt><a href="#processDocs">processDocs()</a> ⇒ <code>String</code></dt>
<dd><p>parse through files array and generate docs.</p>
</dd>
<dt><a href="#hulkSmash">hulkSmash()</a> ⇒ <code>String</code></dt>
<dd><p>call all functions and smash their outputs into 1 string</p>
</dd>
</dl>

<a name="files"></a>

## files
list of javascript files to process for docs without the file extension

**Kind**: global variable  
<a name="writeFile"></a>

## writeFile(name, md) ⇒ <code>Promise.&lt;String&gt;</code>
save a file

**Kind**: global function  
**Returns**: <code>Promise.&lt;String&gt;</code> - string confirming successful file save  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>String</code> | filename |
| md | <code>String</code> | text content to be writen to file |

**Example** *(Example usage of writeFile() function.)*  
```js
writeFile('awesomefile-doc.md', '# Awesome File').then(console.log);
// returns `awesomefile-doc.md saved to disk`
// awesomefile-doc.md contains '# Awesome File'
```
<a name="renderDoc"></a>

## renderDoc(filename) ⇒ <code>Void</code>
renders a markdown document file from javascript comment

**Kind**: global function  
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | name of the file being processed |

**Example** *(Example usage of renderDoc() function.)*  
```js
renderDoc('awesomefile.js');
```
<a name="dependencies"></a>

## dependencies() ⇒ <code>String</code>
output dependencies as a string

**Kind**: global function  
**Returns**: <code>String</code> - list of dependencies  
**Example** *(Example usage of dependencies() function.)*  
```js
var dep = dependencies();
```
<a name="devDependencies"></a>

## devDependencies() ⇒ <code>String</code>
output dev dependencies as a string

**Kind**: global function  
**Returns**: <code>String</code> - list of dev dependencies  
**Example** *(Example usage of devDependencies() function.)*  
```js
var dev = devDependencies();
```
<a name="processDocs"></a>

## processDocs() ⇒ <code>String</code>
parse through files array and generate docs.

**Kind**: global function  
**Returns**: <code>String</code> - list of files  
**Example** *(Example usage of processDocs() function.)*  
```js
var processedDocs = processDocs();
```
<a name="hulkSmash"></a>

## hulkSmash() ⇒ <code>String</code>
call all functions and smash their outputs into 1 string

**Kind**: global function  
**Returns**: <code>String</code> - README.md contents  
**Example** *(Example usage of hulkSmash() function.)*  
```js
writeFile('README.md', hulkSmash()).then(console.log);
// outputs 'README.md saved to disk'
```
