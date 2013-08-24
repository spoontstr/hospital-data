var h;
var width = 860, 
    height = 660,
    centered
  
var projection = d3.geo.albersUsa()
                       .scale(1100)
                       .translate([width / 2, height / 2.5])
  
var path = d3.geo.path()
                 .projection(projection);
  
var svg = d3.select(".hospital_map").append("svg")
                                     .attr("width", width)
                                     .attr("height", height)
  
svg.append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height)
   .on("click", mapClicked)
 
  
var g = svg.append("g");  //create a group
    

function mapStates() {
  queue()
   .defer(d3.json, "/javascripts/api/state.json")
   .defer(d3.json, "/javascripts/api/state_centroids.json")
   .await(ready)
  
  function ready(error, us, centroids){
    g.append("g")
     .attr("class","states-map")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.state).features)
     .enter().append("path")
     .attr("id", function(d) { return d.properties.STUSPS10 })
     .attr("d", path)
     .on("click", mapClicked)

    g.append("path")
     .datum(topojson.mesh(us, us.objects.state, function(a, b) { return a !== b; }))
     .attr("class", "state-borders")
     .attr("d", path)
   
  }
}
function mapHospitals(state, duration) {
  var url = "map/" + state
  var duration = duration ? duration : 800;
  
  $('#hospital-map-result').load(url, function(result) {
    var h = jQuery.parseJSON($('#hospital-map-result .hospital_map').html());
    if(h && h.features) {
      d3.select("#hospital-locations")
        .remove();
        
      g.append("g")
       .attr("id","hospital-locations")
       .style("opacity",0)
       .selectAll("path")
       .data(h.features)
       .enter().append("path")
       .attr("d", path.pointRadius(4))
       .attr("id", function(d) { return "h" + d.properties.id })
       .attr("class", function(d) { return "hospital-location value-" + d.properties.value_rating })
       .on("click", mapClicked)
      
      g.selectAll("#hospital-locations")
       .transition()
       .duration(duration)
       .style("opacity",1);
    }
  });
}

function mapClicked(d) {
  var x, y, k;
  
  if (d && centered !== d) {
    var centroid = path.centroid(d)
    x = centroid[0]
    y = centroid[1]
    k = 4;
    centered = d
  } else {
    x = width / 2
    y = height / 2
    k = 1
    centered = null
  }
  
  var zoomMap = d3.transition().duration(800).each( function() {
                  g.transition()
                   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
                })

  

  g.select("#hospital-locations")
   .selectAll("path")
   .style("opacity",.2);
                         
  
  g.selectAll("path")
   .classed("active", centered && function(d) { return d === centered })
 
   
  if(d && d.properties && d.properties.value_rating != undefined && centered) {
    id = d.properties.id
    
    $(".breadcrumb").empty()
                    .append("Back to <a href='javascript:void(0)' onclick='hospitalsBack(\"ALL\")'>US</a>")
                    .append(" &gt; <a href='javascript:void(0)' onclick='hospitalsBack(\"" + d.properties.usps_state + "\")' >" + d.properties.state + "</a>")
    
    $.get('/hospital/' + id, function(res) {
      $(".hospital-container .result").html(res)
                
      g.select("#h" + id).style("opacity", 1)
      
      if( $(".hospitals-container").is(":visible") ) {
        outAllInOneHospital()
      }
      
    })
  }
  else {
    var usps_state = 'ALL'
    $(".breadcrumb").empty();
    
    if(centered && d && d.properties) {
      if(d.properties.STUSPS10){
        $(".breadcrumb").append("Back to <a href='javascript:void(0)' onclick='hospitalsBack(\"ALL\")'>US</a>")
        usps_state = d.properties.STUSPS10
      }
    }
    filterState = usps_state
      
    mapHospitals(usps_state)
    
    var value = "" 
    if(filterValueRatings != ""){
      value = "?int_value_rating=" + filterValueRatings;
    }
    
    console.log('/hospitals/' + usps_state + value);
    $.get('/hospitals/' + usps_state + value, function(res) {
      $(".hospitals-container .result").html(res)
      outOneInAllHospitals()
    })
  }
}
function outAllInOneHospital(){
  $(".hospitals-container").fadeOut(500, function() {
    $(".hospital-container").fadeIn(100)
  });
}
function outOneInAllHospitals(){
  $(".hospital-container").fadeOut(500, function() {
    $(".hospitals-container").fadeIn(100)
  });
}
