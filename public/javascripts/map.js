//TODO: this should be namespaced
var h;
var default_width = 899,
    default_height = 625,
    map_width = default_width, 
    map_height = default_height,
    locX = map_width/2,
    locY = map_height/2.5,
    centered
  
var projection = d3.geo.albersUsa()
                       .scale(1150)
                       .translate([locX, locY])
  
var path = d3.geo.path()
                 .projection(projection);
  
var svg = d3.select(".hospital_map")
            .append("svg")
                                    
svg.append("rect")
   .attr("class", "background")
   .attr("width", map_width)
   .attr("height", map_height)
   .on("click", mapClicked)
 
  
var g = svg.append("g")
           .attr("class", "map-container");  //create a group
    

function mapStates(callback) {
  d3.json("/javascripts/api/us-named.json", function(error, us) {
    console.log(error);
    g.append("g")
     .attr("render-order", 0)
     .attr("class","states-map")
     .selectAll("path")
     .data(topojson.feature(us, us.objects.states).features)
     .enter().append("path")
     .attr("id", function(d) { return d.properties.code })
     .attr("d", path)
     .on("click", mapClicked)
     callback()
  })
}
function mapHospitals(state, duration, callback) {
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
       .attr("render-order", 2)
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
    callback()
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
    x = locX
    y = locY
    k = 1
    centered = null
  }
  
  d3.transition().duration(800).each( function() {
    g.transition()
     .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2.5 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
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
    
    $.get('/hospitals/' + usps_state + value, function(res) {
      $(".hospitals-container .result").html(res)
      setTimeout(800, outOneInAllHospitals())
      
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
