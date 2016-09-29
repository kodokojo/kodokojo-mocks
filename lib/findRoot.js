var fs = require('fs')
  , path = require('path')
  , selfModule = module.parent;

if (typeof fs.existsSync === 'undefined')
  fs.existsSync = path.existsSync; //make Node v0.4 -> v0.8 compatible


function packageFind(paths) {
  if (!paths) return null;

  for (var i = 0; i < paths.length; ++i){
    var dir = path.dirname(paths[i]);
    if (fs.existsSync(path.join(dir, 'package.json')))
      return dir;
  }

  return null;
}

module.exports.getProjectRoot = function(){
  return packageFind(selfModule.parent.paths);
};