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
 
 // wrap put/get with key set

  function container(key, data){
    return JSON.stringify({
      timestamp : Date.now(),
      key : key,
      data : data
    });
  }

  function uncontainer(data){
    return data.data;
  }

  return _.defaults({
    hash : hashFunction
    },storage,{
    version : pkg.version
  });

};
