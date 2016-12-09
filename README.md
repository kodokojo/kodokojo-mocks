<div align="center">
  <a href="https://github.com/kodokojo">
    <img width=710px src="https://github.com/kodokojo/kodokojo/raw/master/doc/images/logo-kodokojo-baseline-black1.png">
  </a>

<br/>

Kodokojo-mocks is an initiative from <a href="https://github.com/kodokojo">Kodokojo</a> project

</br>
</br>

<b>Standalone mocking server using Restify</b>

</br>
</br>
</div>


[![Open Source Love](https://badges.frapsoft.com/os/v2/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badge/) [![](https://img.shields.io/badge/License-GPLv3-blue.svg?style=flat)](http://www.gnu.org/licenses/gpl-3.0.en.html)


[![NPM](https://nodei.co/npm/kodokojo-mocks.png?downloads=true&downloadRank=true)](https://nodei.co/npm/kodokojo-mocks/)


## Install

```bash
$ npm install kodokojo-mocks --save-dev
```

**Then create a folder to store your mock files**

eg: `{your_project_path}/mocks`

**Create a config file**

eg: `{your_project_path}/mocks_config.json`

**Config file example :**

```
{
  "port":8080,
  "logs":false,
  "prefix": "api/v1",
  "path": "mocks",
  "routes":[
    {"path":"/user","method":"POST","mockType":"raw","serve":"123"},
    {"path":"/user/:id","method":"GET","mockType":"file","serve":"user.get.json"},
    {"path":"/auth/:token","method":"GET","mockType":"func","serve":"auth.get.js"}
  ],
  "memoryStorage": true,
  "persistStorage": false
}
```

**port** (default: **8080**) _: Bind server to the specified port (eg: 8080)_ <br>
**logs** (default: **true**) _: Enable request and error logging_ <br>
**prefix** (default: **""**) _: Prefix path (eg: http://localhost:8080 **/api/v1/**...)_ <br>
**path** (default: **""**) _: <b>Relative path</b> to mocks folder (from your project root folder, where your package.json was created)_ <br>
**routes** (default: **[]**) _: An array containing the routes you want to mock. ExpressJs format for parameters and paths_ <br>
**memoryStorage** (default: **false**) _: Use memory only storage_ <br>
**persistStorage** (default: **false**) _: Previous storage file is used if `memoryStorage` is **false** else create a new empty storage file_ <br>

## Usage

### Inside your module

#### Start
```javascript
var MockServer = require('kodokojo-mocks');

var mockServer = new MockServer(__dirname+"/mocks_config.json");
mockServer.start().then(function(state){
  console.log(state); // Should display : { ready: true }
  console.log(server.config); // you can access to parsed configuration
});
```

#### Stop
```javascript
// ... Server should be started
mockServer.stop();
```

### Npm script
 _Soon_


##
*Have a look at ./test/index.js to see some examples.*

## Create your mocks

There is 3 ways to serve a mock : as you can see in the config file above, every mock have a type ("mockType" property) so you can define how the mock will be loaded.


### Raw data
Return the value that you specified in your config file ("serve" property)
```
{... "mockType":"raw","serve":"[value_to_serve]"}
```

### Json file content
Return the content of the given json file
```
{... "mockType":"file","serve":"[file_name]"}
```
<b>The mock file should be a standard json file.</b><br>
You can write data from the incoming request content inside your json file by using mustach syntax, eg :
```
{ ...
  "identifier": "{{req.id}}",
  ... }
```
{{req.NAME_OF_PROPERTY_FROM_REQ_OBJECT}}

### ExpressJs controller
You can use a classic ExpressJs controller to serve your data, it's allow you to write some custom/business logic as a mock, eg :
```
{... "mockType":"func","serve":"[file_name]"}
```
Controller example:
```javascript
exports.controller = function(req, res, next, server) {
  // Your code here ...
  // Classic ExpressJs api below
  res.contentType = "application/json";
  res.send(200, data_to_serve);
  next();
};
```

## Persistence
A file based (in-memory if `memoryStorage` is **true**) key-value store is exposed as `server.store` that can be
used to store and retrieve data in a custom controller.
```javascript
exports.controller = function(req, res, next, server) {
  store.get('visits', function (err, value) {
    // visits = 0
    store.put('visits', value+1, function (err) {
        // visits = 1
    });
  });

  res.contentType = "application/json";
  res.send(200, data_to_serve);
  next();
};
```

## To do
Enhanced logs <br>
Rename type 'file' to 'json' <br>
rename type 'func' to 'controller' <br>
Npm script <br>