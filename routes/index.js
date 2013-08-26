/*
 * GET home page.
 */

var HospitalProvider = require('./helpers/hospital-provider').HospitalProvider
var mongolab_url = 'mongodb://hdadmin:1npat!ent@ds041238.mongolab.com:41238/inpatient_data'
var hospitalProvider = new HospitalProvider(mongolab_url)
var parseJson = require('./helpers/parse-json.js')
var filterJson = {}  

exports.index = function(req, res){
  res.render('index', { title: 'TOP VALUE US HOSPITALS: An Interactive Visualization'})
}

exports.hospitals = function(req, res){
  var max_results = 1000;
  var usps_state = req.params.usps_state
  var sort = {sort: {"value_rating":-1}}
  var filter = makeFilter(req)
  if(usps_state == "ALL") {
    max_results = 50;
  }

  
  hospitalProvider.findAll(filter, sort, max_results, function(error, docs){
    res.render('hospitals', { title: 'Top Value Hospitals: Hospitals', usps_state: usps_state, hospitals: docs })
  })
}

exports.hospital = function(req, res){
  var id = req.params.id;
  hospitalProvider.findById(id, function(error, docs){
    res.render('hospital', { title: 'Top Value Hospitals: Hospital', hospital: docs })
  });
};

exports.map = function(req, res){
  var max_results = 0
  var usps_state = req.params.usps_state
  var values = req.query.int_value_rating ? req.query.int_value_rating : ""
  var sort = {sort: {"value_rating":1}}
  var filter = makeFilter(req)
  var cached = false
  console.log("making a map")
  console.log("the state is:" + usps_state)
  console.log("the values are:" + values)
  console.log("with filter:" + JSON.stringify(filter))
  
  if(values == ""){
    cached = true
  }
  
  hospitalProvider.findAll(filter, sort, max_results, function(error, docs){
    geo = parseJson.GeoJson(docs, usps_state, cached)
    res.render('map', { title: 'Map', hospitalGeo: geo.toString() })
  });
}

makeFilter = function(req){
  var filters = []
  var usps_state = req.params.usps_state
  var values = req.query.int_value_rating
  var i = 0
  
  if(usps_state !== 'ALL') {
     filters.push({"usps_state":usps_state})
  }
  
  if(values){
    var v = values.split(",");
    if(v.length ==1){
      filters.push({"int_value_rating":parseInt(v[0])})
    }
    else {
      var filterOr = {
        "$or":[]
      };
      for(i=0; i < v.length; i++) {
        filterOr["$or"].push({"int_value_rating":parseInt(v[i])})
      }
      filters.push(filterOr)
    }
  }
  
  var filterAnd = {
        "$and":[]
      };
  if(filters){
    if(filters.length == 0){
      filterAnd["$and"].push({})
    }
    for(var i=0; i < filters.length; i++){
       filterAnd["$and"].push(
         filters[i]
       ) 
    }
    return filterAnd;
  }
  else {
    return {}
  }
}