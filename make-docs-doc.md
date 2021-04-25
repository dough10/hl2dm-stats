<a name="make-docs.module_js"></a>

## make-docs.js
processes javascript files creating markdown documentation from comments. Edit head.txt and foot.txt to customize the generated [README.md](./README.md) file

**Requires**: <code>module:fs</code>, <code>module:jsdoc-to-markdown</code>, <code>module:package.json</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  

* [make-docs.js](#make-docs.module_js)
    * [~writeFile(name, md)](#make-docs.module_js..writeFile) ⇒ <code>Promise.&lt;String&gt;</code>
    * [~renderDoc(filename)](#make-docs.module_js..renderDoc) ⇒ <code>Void</code>
    * [~dependencies()](#make-docs.module_js..dependencies) ⇒ <code>String</code>
    * [~devDependencies()](#make-docs.module_js..devDependencies) ⇒ <code>String</code>
    * [~processDocs()](#make-docs.module_js..processDocs) ⇒ <code>String</code>
    * [~hulkSmash()](#make-docs.module_js..hulkSmash) ⇒ <code>String</code>

<a name="make-docs.module_js..writeFile"></a>

### make-docs.js~writeFile(name, md) ⇒ <code>Promise.&lt;String&gt;</code>
save a file

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
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
<a name="make-docs.module_js..renderDoc"></a>

### make-docs.js~renderDoc(filename) ⇒ <code>Void</code>
renders a markdown document file from javascript comments

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
**Returns**: <code>Void</code> - nothing  

| Param | Type | Description |
| --- | --- | --- |
| filename | <code>String</code> | name of the file being processed |

**Example** *(Example usage of renderDoc() function.)*  
```js
renderDoc('awesomefile.js');
```
<a name="make-docs.module_js..dependencies"></a>

### make-docs.js~dependencies() ⇒ <code>String</code>
output dependencies from package.json to markdown unindexed list

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
**Returns**: <code>String</code> - list of dependencies  
**Example** *(Example usage of dependencies() function.)*  
```js
let dep = dependencies();
```
<a name="make-docs.module_js..devDependencies"></a>

### make-docs.js~devDependencies() ⇒ <code>String</code>
output dev dependencies from package.json to markdown unindexed list

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
**Returns**: <code>String</code> - list of dev dependencies  
**Example** *(Example usage of devDependencies() function.)*  
```js
let dev = devDependencies();
```
<a name="make-docs.module_js..processDocs"></a>

### make-docs.js~processDocs() ⇒ <code>String</code>
parse through files array and generate docs.

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
**Returns**: <code>String</code> - list of files  
**Example** *(Example usage of processDocs() function.)*  
```js
let processedDocs = processDocs();
```
<a name="make-docs.module_js..hulkSmash"></a>

### make-docs.js~hulkSmash() ⇒ <code>String</code>
call all functions and smash their outputs into 1 string

**Kind**: inner method of [<code>make-docs.js</code>](#make-docs.module_js)  
**Returns**: <code>String</code> - README.md contents  
**Example** *(Example usage of hulkSmash() function.)*  
```js
writeFile('README.md', hulkSmash()).then(console.log);
// outputs 'README.md saved to disk'
```
