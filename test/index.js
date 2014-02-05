'use strict';

var pkg = require('../package.json'),
should = require('should'),
_ = require('underscore');

// sort of stupid tests, but they are my most basic and initial tests to get testing up and going
describe('versioning', function(){
  var cache = require('..')();
  it('should have a version', function(){
    cache.should.have.property('version');
  });

  it('should equal package version', function(){
    cache.version.should.be.exactly(pkg.version);
  });
});



var fxns = ['info','clear','put','has','get','remove','hash'];
function verifyInterface(cache){
  describe('interface has', function(){
    _.each(fxns, function(fxn){
      it(fxn + '()', function(){
	cache[fxn].should.be.a.Function;
      });
    });
  });
}

// test hash
describe('default hash', function(){
  var cache = require('..')();
  
  describe('can handle input', function(){
    it('empty string', function(){
      cache.hash('').should.equal('9d4568c009d203ab10e33ea9953a0264');
    });

    it('numbers', function(){
      cache.hash(12345).should.equal('827ccb0eea8a706c4c34a16891f84e7b');
      cache.hash(77.0).should.equal('28dd2c7955ce926456240b2ff0100bde');
    });

    it('objects', function(){
      cache.hash({foo : 'bar', baz : 'foo'}).should.equal('d4998d3e1ce20a86f073d24501fea77c');
    });

    it('handles empty object', function(){
      cache.hash({}).should.equal('99914b932bd37a50b983c5e7c90ae93b');
    });
  });

  it('returns same values for equal keys', function(){
    cache.hash('foobar').should.equal(cache.hash('foobar'));
  });
  
  
});

describe('default storage', function(){
  var cache = require('..')();
  verifyInterface(cache);

  _.each(['info','clear','put','has','get','remove'], function(fxn){
    it(fxn + '() should callback an error', function(done){
      cache[fxn](function(err){
	err.should.be.a.Error;
	return done();
      });
    });
  });
});


