var h;
var width = 943, 
    height = 625,
    centered
  
var projection = d3.geo.albersUsa()
                       .scale(1150)
  
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
   .defer(d3.json, "/javascripts/api/us-named.json")
   .defer(d3.json, "/javascripts/api/us-named.json")
   .await(ready)
  
  function ready(error, us){
    g.append("g")
     .attr("class","states-map")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.states).features)
     .enter().append("path")
     .attr("id", function(d) { return d.properties.code })
     .attr("d", path)
     .on("click", mapClicked)
 }
}
function mapHospitals(state, duration) {
  var url = "map/" + state
  var duration = duration ? duration : 800;

  if(filterValueRatings != ""){
    url += "?int_value_rating=" + filterValueRatings;
  }
    
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
                   .append("Back to <a href='javascript:void(0)' onclick='goToState(\"ALL\")'>US</a>")
                    .append(" &gt; <a href='javascript:void(0)' onclick='goToState(\"" + d.properties.usps_state + "\")' >" + d.properties.state + "</a>")
    
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
      if(d.properties.code){
        $(".breadcrumb").append("Back to <a href='javascript:void(0)' onclick='goToState(\"ALL\")'>US</a>")
        usps_state = d.properties.code
      }
    }
    filterState = usps_state
    
    var value = "" 
    if(filterValueRatings != ""){
      value = "?int_value_rating=" + filterValueRatings;
    }
    
    $('.state-selector').val(usps_state);
    mapHospitals(usps_state)
    
    console.log('/hospitals/' + usps_state + value);
    $.get('/hospitals/' + usps_state + value, function(res) {
      $(".hospitals-container .result").html(res)
      outOneInAllHospitals()
    })
  }
}
function outAllInOneHospital(){
  $(".hospitals-container").fadeOut(500, function() {
    $(".hospital-container").fadeIn(500)
  });
}
function outOneInAllHospitals(){
  $(".hospital-container").fadeOut(500, function() {
    $(".hospitals-container").fadeIn(500)
  });
}
