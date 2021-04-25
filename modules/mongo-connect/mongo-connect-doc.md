<a name="mongo-connect.module_js"></a>

## mongo-connect.js
establish a connection to mongodb

**Requires**: <code>module:mongodb</code>, <code>module:loadConfig.js</code>  
**Author**: Jimmy Doughten <https://github.com/dough10>  
**Example** *(Example usage of mongo-connect module.)*  
```js
const mongoConnect = require('modules/mongo-connect/mongo-connect.js');
mongoConnect().then(database => {
  getNewUsers(database, 13).then(console.log); // = new users on the 13th
});
```
