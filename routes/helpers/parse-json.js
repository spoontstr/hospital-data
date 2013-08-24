var cachedJson = {};
exports.GeoJson = function(data,state) {
  console.log(state)
  if(cachedJson[state]) {
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
      for(var i=0; i < data.length; i++){
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
            "value_rating": Math.round(data[i]["value_rating"])
          }
        })
      }
      cachedJson[state] = (JSON.stringify(_geoJson));
      console.log("creating JSON")
      return JSON.stringify(_geoJson);
    }
  }
}

