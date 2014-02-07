'use strict';

// xx - add timed cache tests

var filesystemStore = require('cachy-filesystem'),
memoryStore = require('cachy-memory');

var async = require('async'),
pkg = require('../package.json'),
should = require('should'),
_ = require('underscore');

describe('versioning', function(){
  var cache = require('..')();
  it('should have a version', function(){
    cache.should.have.property('version');
  });

  it('should equal package version', function(){
    cache.version.should.be.exactly(pkg.version);
  });
});

describe('default storage', function(){
  var cache = require('..')();

  describe('should return', function(){
    it('error for put()', function(done){
      cache.put('key', 'value', function(err){
	err.should.be.a.Error;
	return done();
      });
    });

    it('false for has()', function(done){
      cache.has('key', function(err){
	err.should.be.false;
	return done();
      });
    });

    it('error for get()', function(done){
      cache.get('key', function(err){
	err.should.be.a.Error;
	return done();
      });
    });

    it('error for remove()', function(done){
      cache.remove('key', function(err){
	err.should.be.a.Error;
	return done();
      });
    });

    it('error for clear()', function(done){
      cache.clear(function(err){
	err.should.be.a.Error;
	return done();
      });
    });

    it('error for size()', function(done){
      cache.size(function(err){
	err.should.be.a.Error;
	return done();
      });
    });

    it('error for info()', function(done){
      cache.info(function(err){
	err.should.be.Error;
	return done();
      });
    });


  });
});



var objects = [
  {
    key : 'This is the key for an object',
    data : {first: 1, second: 2, third : 'third'}
  },
  {
    key: 654321,
    data : 123456
  }
];

_.each([
  {
    name : 'memory',
    store : memoryStore
  },
  {
    name : 'filesystem',
    store : filesystemStore()
  }], function(storage){
    describe(storage.name + ' storage, forever', function(){
      var cache = require('..')(storage.store);
      
      describe('put()', function(){
	_.each(objects,  function(obj){
	  it('should put object "' + obj.key + '"', function(done){
	    cache.put(obj.key, obj.data, function(err){
	      should.not.exist(err);
	      return done();
	    });
	  });
	});
      });

      describe('get()', function(){
	_.each(objects,  function(obj){
	  it('should get object "' + obj.key + '"', function(done){
	    cache.get(obj.key, function(err, data){
	      should.not.exist(err);
	      obj.data.should.eql(data);
	      return done();
	    });
	  });
	});
      });

      // has
      describe('has()', function(){
	_.each(objects,  function(obj){
	  it('should have object "' + obj.key + '"', function(done){
	    cache.has(obj.key, function(has){
	      has.should.be.true;
	      return done();
	    });
	  });
	});

	_.each(['badkey', 'another non existant key'],  function(key){
	  it('should not have object "' + key + '"', function(done){
	    cache.has(key, function(has){
	      has.should.be.false;
	      return done();
	    });
	  });
	});
      });
      
      describe('size()', function(){
	it('should equal put() objects', function(done){
	  cache.size(function(err, size){
	    size.should.equal(objects.length);
	    done();
	  });
	});
      });

      
      describe('remove()', function(){
	it('should remove the entry "' + objects[0].key + '"', function(done){
	  cache.remove(objects[0].key, function(err){
	    should.not.exist(err);
	    cache.size(function(err, size){
	      size.should.equal(objects.length - 1);
	      done();
	    });
	  });
	});
      });
      // clear

      describe('clear()', function(){
	it('should clear the cache', function(done){
	  cache.clear(function(err){
	    should.not.exist.err;
	    cache.size(function(err, size){
	      size.should.equal(0);
	      done();
	    });
	  });
	});
      });
    });

    describe(storage.name + ' storage, timed (5 seconds)', function(){
      var cache = require('..')(storage.store, {duration : 5000});
      it('should perform multiple (undescribed) tests in one async series', function(done){
	this.timeout(10000);
	async.series([
	  function(callback){
	    async.each(objects, function(item, callback){
	      cache.put(item.key, item.data, function(err){
		should.not.exist(err);
		return callback(err);
	      });
	    }, callback);
	  },
	  function(callback){
	    cache.size(function(err, size){
//	      size.should.equal(objects.length);
	      return callback();
	    });
	  },
	  function(callback){ // force a pause in the test
	    setTimeout(callback,3000);
	  },
	  function(callback){
	    cache.size(function(err, size){
//	      size.should.equal(objects.length);
	      return callback();
	    });
	  },
	  function(callback){ // force another pause in the test (putting us over cache duration)
	    setTimeout(callback,5000);
	  },
	  function(callback){
	    cache.size(function(err, size){
	      if(err) return callback(err);
	      size.should.equal(0);
	      return callback();
	    });
	  }
	],function(err, results){
	  return done(err);
	});
      });
    });
});
