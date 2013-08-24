/*
 * GET home page.
 */

var HospitalProvider = require('./helpers/hospital-provider').HospitalProvider
var mongolab_url = 'mongodb://hdadmin:1npat!ent@ds041238.mongolab.com:41238/inpatient_data'
var hospitalProvider = new HospitalProvider(mongolab_url)
var parseJson = require('./helpers/parse-json.js')

exports.index = function(req, res){
  res.render('index', { title: 'VISUALIZING HOSPITAL PRICE DATA'})
};

exports.hospitals = function(req, res){
  var max_results = 20;
  var usps_state = req.params.usps_state
  var filter = usps_state === 'ALL' ? {} : {"usps_state" : usps_state}
  var sort = { sort: {"value_rating":-1}}
  hospitalProvider.findAll(filter, sort, max_results, function(error, docs){
    res.render('hospitals', { title: 'Hospital Data: Hospitals', usps_state: usps_state, hospitals: docs })
  });
};

exports.hospital = function(req, res){
  var id = req.params.id;
  hospitalProvider.findById(id, function(error, docs){
    res.render('hospital', { title: 'Hospital Data: Hospital', hospital: docs })
  });
};

exports.map = function(req, res){
  var sort = { sort: {"value_rating":1}}
  var max_results = 0;
  var usps_state = req.params.usps_state;
  var filter = usps_state === 'ALL' ? {} : {"usps_state" : usps_state}
  hospitalProvider.findAll(filter, sort, max_results, function(error, docs){
    geo = parseJson.GeoJson(docs, usps_state);
    res.render('map', { title: 'Map', hospitalGeo: geo.toString() })
  });
}
