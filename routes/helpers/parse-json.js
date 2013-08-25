var cachedJson = {};
exports.GeoJson = function(data,state,cache) {
  if(cachedJson[state] && cache) {
    console.log('using cache')
    return cachedJson[state]
  }
  else {
    var _geoJson = {
        "type": "FeatureCollection",
        "features": [ ]
      };
    if(data){
      console.log(data.length)
      var value_rating = 0;
      for(var i=0; i < data.length; i++){
        if(data[i]["value_rating"] < 2) {
          value_rating = 1;
        }
        else {
          value_rating = Math.floor(data[i]["value_rating"])
        }
        _geoJson.features.push({
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [data[i]["long"], data[i]["lat"]]// [x,y]
          }, 
          "properties": {
            "id": data[i]["provider_no"],
            "state": data[i]["state_longname"],
            "usps_state": data[i]["usps_state"],
            "value_rating": value_rating
          }
        })
      }
      if(cache){
        cachedJson[state] = (JSON.stringify(_geoJson));
      }
      console.log("creating JSON")
      return JSON.stringify(_geoJson);
    }
  }
}

