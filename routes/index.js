/*
 * GET home page.
 */

var HospitalProvider = require('./hospital-provider').HospitalProvider
var mongolab_url = 'mongodb://hdadmin:1npat!ent@ds041238.mongolab.com:41238/inpatient_data'
var hospitalProvider = new HospitalProvider(mongolab_url);

exports.index = function(req, res){
  res.render('index', { title: 'VISUALIZING HOSPITAL PRICE DATA'})
};

exports.hospitals = function(req, res){
  var usps_state = req.params.usps_state
  var state = req.params.state == 'All' ? "The US" : req.params.state
  var filter = usps_state === 'ALL' ? {} : {"state" : usps_state}
  var sort = { sort: {"value_rating":-1}}
  hospitalProvider.findAll(filter, sort, function(error, docs){
    res.render('hospitals', { title: 'Hospital Data: Hospitals', state: state, hospitals: docs })
  });
};

exports.hospital = function(req, res){
  var id = req.params.id;
  hospitalProvider.findById(id, function(error, docs){
    res.render('hospital', { title: 'Hospital Data: Hospital ', hospital: docs })
  });
};