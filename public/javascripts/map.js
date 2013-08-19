var width = 850, 
    height = 675,
    centered
  
var projection = d3.geo.albersUsa()
                       .scale(1200)
                       .translate([width / 2, height / 2])
  
var path = d3.geo.path()
                 .projection(projection);
  
var svg = d3.select(".map-container").append("svg")
                                     .attr("width", width)
                                     .attr("height", height)
  
svg.append("rect")
   .attr("class", "background")
   .attr("width", width)
   .attr("height", height)
   .on("click", clicked)
  
queue()
   .defer(d3.json, "/javascripts/us.json")
   .defer(d3.json, "/javascripts/hospitals.json")
   .await(ready)
  
var g = svg.append("g");  //create a group
    
function ready(error, us, hospitals){
  g.append("g")
   .attr("id","states")
   .selectAll("path")
   .data(topojson.feature(us, us.objects.states).features)
   .enter().append("path")
   .attr("d", path)
   .attr("id", function(d) { d.id })
   .on("click", clicked)

     
  g.append("path")
   .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
   .attr("id", "state-borders")
   .attr("d", path);
       
  g.append("g")
   .attr("id","hospitals")
   .selectAll("path")
   .data(topojson.feature(hospitals, hospitals.objects.hospitals).features)
   .enter().append("path")
   .attr("d", path.pointRadius(3))
   .attr("id", function(d) { return d.id })
   .attr("class", function(d) { return "hospital-location value-" + d.properties.value_rating })
   //.style("opacity",".9")
   .on("click", clicked)
   
   $(".header-container").fadeIn(1000);
}


function clicked(d) {
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

  g.selectAll("path")
   .classed("active", centered && function(d) { return d === centered })

  g.transition()
   .duration(500)
   .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
  
  if(d.properties.value_rating != undefined && centered) {
    $.get('/hospital/' + d.id, function(res) {
      $(".hospital-container .result").html(res)
      
      if( $(".hospitals-container").is(":visible") ) {
        $(".hospitals-container").fadeOut(100, function() {
          $(".hospital-container").fadeIn(500)
        })
      }
      
      g.select("#hospitals")
       .selectAll("path")
       .classed("inactive", function(d) { return d !== centered })
    });
  }
  else {
    $(".hospital-container").fadeOut(500, function() {
      $(".hospitals-container").fadeIn(100)
    });
    g.select("#hospitals")
     .selectAll("path")
     .classed("inactive", false)
  }
}