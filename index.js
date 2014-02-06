'use strict';

/*
* Unsure the cache <-> storage relationship is well defined enough
* Should allow delegation of tasks to storage when it is more efficient
* but keep them available in cache for simple impl
*/

var defaultStorage = require('cachy-default');

var async = require('async'),
crypto = require('crypto'),
moment = require('moment'),
pkg = require('./package.json'),
_ = require('underscore');

module.exports = function(store, config){

  var storage = (store || defaultStorage());

  var configuration = _.defaults({}, config, {
    duration : false
  });

  var duration = (configuration.duration || false);

  var hash = (((typeof storage.hash) === 'function') ? storage.hash : function(key){
    return crypto.createHash('md5').update(JSON.stringify(key)).digest('hex');
  });
 
 // wrap put/get with key set

  function pack(key, hashed, data){   
    var returner = {
      created : Date.now(),      
      key : key,
      hash : hashed,
      data : data
    };

    if(duration){      
      returner.expires = (returner.created + duration);
    }

//    console.log(returner);
    return returner;
  }

  function unpack(data){
    return data.data;
  }

  function putHash(hash, key, value, callback){
    storage.write(hash, pack(key, hash, value), callback);
  }

  function put(key, value, callback){
    putHash(hash(key), key, value, callback);
  }

  function getHash(hash, callback){
    storage.read(hash, function(err, data){
      if(err) return callback(err);
      
      if(data.expires && (data.expires <= Date.now())){
//	console.log('expiring data:', data.key);
	storage.remove(data.hash);
	return callback(new Error('expired: ' + data.key));
      }

      return callback(null, unpack(data));
    });
  }

  function get(key, callback){
    getHash(hash(key), callback);
  }


  function hasHash(hash, callback){
    getHash(hash, function(err, data){
//      console.log('hasHash', hash, err);
      return callback((!err));
    });
  }

  function has(key, callback){
    return hasHash(hash(key), callback);
  }

  function remove(key, callback){
    storage.remove(hash(key), callback);
  }
  
  function clear(callback){
    storage.clear(callback);
  }

  // xx- allow delegation to storage
  function size(callback){
    storage.keys(function(err, hashes){ // storage keys are the hashes
      if(err) return callback(err);
      if(!duration) return callback(hashes.length);
      
//      console.log('size found hashes', hashes);
      // if duration we need to check for expired entries

      async.map(hashes, function(h, callback){
	hasHash(h, function(bool){ callback(null, bool); });
      }, function(err, results){
//	console.log(results);
	if(err) return callback(err);
	var len = _.filter(results, function(bool) { return bool; }).length;
//	console.log('duration based size returning', len);
	return callback(null, len);		
      });

    });
  }
  
 // get all keys and return formatted object representing cache state
  function info(callback){
    storage.keys(function(err, keys){
      if(err) return callback(err);
      var returner = {};    
      return callback(null, returner);
    });
  }

  return {
    put : put,
    has : has,
    get : get,
    remove : remove,
    clear : clear,
    size : size,
    info : info,
    version : pkg.version
  };

};
