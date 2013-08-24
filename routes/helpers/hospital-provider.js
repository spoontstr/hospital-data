var Db = require('mongodb').Db;
var MongoClient = require('mongodb').MongoClient;
var providerDb;
//var Connection = require('mongodb').Connection;
//var Server = require('mongodb').Server;
//var BSON = require('mongodb').BSON;
//var ObjectID = require('mongodb').ObjectID;
//mongodb://'inpatient_data_user':'1npat!ent'@ds041238.mongolab.com:41238/inpatient_data

HospitalProvider = function(url) {
  if(providerDb == null) {
    MongoClient.connect(url, function(err,db){
      if(err) return console.error(err);
      else providerDb = db;
    });
  }
};


HospitalProvider.prototype.getCollection= function(callback) {
  if(providerDb != null) {
    providerDb.collection('cost_quality_value', function(error, hospital_collection){
      if( error ) callback(error);
      else callback(null, hospital_collection);
    })
  }
};

HospitalProvider.prototype.findAll = function(filter,sort,max,callback) {
    this.getCollection(function(error, hospital_collection) {
      if( error ) callback(error)
      else {
        hospital_collection.find(filter,sort).limit(max).toArray(function(error, results) {
          if( error ) callback(error)
          else callback(null, results)
        });
      }
    });
};


HospitalProvider.prototype.findById = function(id, callback) {
    this.getCollection(function(error, hospital_collection) {
      if( error ) callback(error)
      else {
        hospital_collection.findOne({"provider_no": id}, function(error, result) {
          if( error ) callback(error)
          else callback(null, result)
        });
      }
    });
};

exports.HospitalProvider = HospitalProvider;