var proxyquire = require('proxyquire');
var should = require('should');
var mocha = require('mocha');
var config = require('./waterlock.config');

var WaterlockGoogleAuth = proxyquire.noCallThru().load('../../lib/waterlock-google-auth',{
  './waterlock-config': function(){},
  './config': function(){},
  './models': function(){},
  './controllers': function(){},
  './google-factory': function(){},
  './google-config': function(){}
});

describe('waterlock-google-auth', function(){
  it('should be a function', function(done){
    WaterlockGoogleAuth.should.be.type('function');
    done();
  });
  describe('#constructor()', function(){
    it('should return a waterlock-google-auth object', function(done){
      var waterlockGoogleAuth = new WaterlockGoogleAuth();
      waterlockGoogleAuth.should.be.instanceOf(WaterlockGoogleAuth);
      done();
    });
  });
   describe('properties', function(){
    var waterlockGoogleAuth = new WaterlockGoogleAuth();

    describe('.authType', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('authType');
        done();
      });
    });
    describe('.actions', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('actions');
        done();
      });
    });
    describe('.model', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('model');
        done();
      });
    });
    describe('.config', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('config');
        done();
      });
    });
    describe('.waterlockConfig', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('waterlockConfig');
        done();
      });
    });
    describe('.googleFactory', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('googleFactory');
        done();
      });
    });
    describe('.googleConfig', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('googleConfig');
        done();
      });
    });
    describe('.configFound', function(){
      it('should exist', function(done){
        waterlockGoogleAuth.should.have.property('configFound');
        done();
      });
    });
   });
});