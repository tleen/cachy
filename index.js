'use strict';

var defaultStorage = require('cachy-default'),
crypto = require('crypto'),
pkg = require('./package.json'),
_ = require('underscore');

module.exports = function(store, config){

  var storage = (store || defaultStorage());

  var configuration = _.defaults({}, config, {
    duration : '5 minutes'
  });

  var hashFunction = function(key){
    return crypto.createHash('md5').update(JSON.stringify(key)).digest('hex');
  };


  return _.defaults({
    hash : hashFunction
    },storage,{
    version : pkg.version
  });

};
