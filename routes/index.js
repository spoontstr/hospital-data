/*
 * GET home page.
 */

var HospitalProvider = require('./hospital-provider').HospitalProvider
var mongolab_url = "mongodb://hdadmin:1npat!ent@ds041238.mongolab.com:41238/inpatient_data"
var hospitalProvider = new HospitalProvider(mongolab_url);

exports.index = function(req, res){
  var filter = {state:"CO"};
  var sort = { sort: {"value_rating":-1}};
  hospitalProvider.findAll(filter, sort, function(error, docs){
      res.render('index', { title: 'VISUALIZING HOSPITAL PRICE DATA', hospitals: docs })
  });
};

exports.hospital = function(req, res){
  var id = req.params.id;
  hospitalProvider.findById(id, function(error, docs){
    res.render('hospital', { title: 'Hospitals ', hospital: docs })
  });
  
};