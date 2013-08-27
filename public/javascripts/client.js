var filterValueRatings = ''
var filterState = ''
var defaultUspsState = 'ALL'
var checkResize;
var count = 1;
var i = 0
var interval = 700;
var medicareSpending = ",100,000,000".split("");

$("#modal").fadeIn(800, function() {
  animateCountFirstSequence()
})


function animateCountFirstSequence(){
  if(count < 549){
    $("#modal .message h1").html(count)
    count += 1;
    if(interval > 100) {
      interval -= 50
    }
    else {
      interval = 10
    }
    setTimeout(animateCountFirstSequence,interval)
  }
  else{
    header = count
    animateCountSecondSequence()
  }
}

function animateCountSecondSequence(){
  if(i < medicareSpending.length) {
    header += medicareSpending[i]
    $("#modal .message h1").html(header)
    i += 1
    setTimeout(animateCountSecondSequence,50)
  }
  else {
    $("#modal .text").fadeIn(800, function(){
      setTimeout(animateValueSequence,3500) 
    })
  }
}

function animateValueSequence() {
  $("#modal .message").fadeOut(800, function(){
    $(this).find("h3").html("How do we find value in such a complicated space?")
    $(this).find("h1").html("").hide()
    $(this).find(".text").html("").hide()
    $("#modal .message").fadeIn(1000,function(){
      setTimeout(animateDataDescriptionSequence,2000)
    })
  })
}

function animateDataDescriptionSequence() {
  $("#modal .message .text").html("The Centers for Medicare and Medicaid Services increased transparency through the first time release of the 2011 data set showing what hospitals charged and what Medicare paid for the 100 most common inpatient stays.");
  $("#modal .message .text").fadeIn(1000,function(){
    setTimeout(animateValuePropSequence,5000)
  })
}

function animateValuePropSequence() {
  $("#modal .message .text").fadeOut(500,function(){
      $("#modal .message .text").html("We set out to find a way to utilize this newly available data to show patients hospitals that deliver great quality of care without the high price tag. For each procedure we compared the average charged price against all other hospitals that perform that procedure. This allowed us to group them into values ranging from 1, hospitals that provide low quality of care for high cost, to 5, hospitals that provide high quality of care for low cost.")
      $("#modal .message .text").fadeIn(500, function(){
        setTimeout(initializeApplication,10000)
      })
  })
}

function initializeApplication(){
  $("#modal").fadeOut(500,function(){
    mapStates(function() {
      $('.hospitals-container .result').load('/hospitals/ALL')
      mapHospitals(defaultUspsState,500,function(){})
      $("header").fadeIn(500)
      $(".main-content").fadeIn(500, function(){
        windowResized()
      })
    })
  })
}

// close the error dialog
$("#error .close").click(function() {
  $("#error").hide();
})

// show or hide filters
$(".filter-link").click(function() {
  var fadeTime = 500;
  var slideTime = 800;
  if($(".filter-container").is(":visible")){
    $(".filter-container").slideUp(slideTime);
    $(".filter-link").fadeTo(fadeTime,.6)
  }
  else {
    $(".filter-container").slideDown(fadeTime);
    $(".filter-link").fadeTo(fadeTime,.8)
  }
})

//filter by value range
$(".filter-value-range .value").click(function(){
  if(centered && centered.properties && centered.properties.value_rating != undefined){
    $("#error .message").text("We're sorry. Unfortunately, you can't filter on value when a single hospital is selected");
    $("#error").show();
    return;
  }
  var values = []
  var value = "" 
  filterState = filterState != "" ? filterState : defaultUspsState;
        
  $(this).toggleClass('active')
  $(this).parent().find(".active").each(function(){
    values.push($(this).data("int_value_rating"))
  })
  filterValueRatings = values.join(",");
  
  g.select("#hospital-locations")
   .selectAll("path")
   .style("opacity",.2);
  
  if(filterValueRatings != ""){
    value = "?int_value_rating=" + filterValueRatings;
  }

  var url = '/hospitals/'+ filterState + value;

  $.get(url, function(data){
    $(".hospitals-container .result").html(data);
  })
  
  mapHospitals(filterState + value,500,function(){});
})

// filter by state
$('.state-selector').change(function(){
  goToState($(this).val())
})

function goToState(usps_state) {
  var p1
  var url = '/hospitals/' + usps_state
  if(usps_state !== defaultUspsState) {
    p1 = d3.select("#" + usps_state).datum()
    $('.state-selector').val(usps_state);
    filterState = usps_state
  }
  else {
    $('.state-selector').val(defaultUspsState);
    filterState = defaultUspsState
  }
  mapClicked(p1)
  $(".hospitals-container .result").load(url);
} 

//window resizing
function windowResized(){
  var x = locX
  var y = locY
  var k = 1
  window_width = $(window).width();
  data_container_width = $(".data-container").width();
  map_width = window_width - data_container_width
  if(map_width <= default_width) {
    map_width = default_width;
  }
  if(centered) {
    var centroid = path.centroid(centered)
    x = centroid[0]
    y = centroid[1]
    k = 4
  }
  d3.select(".background").attr("width", map_width);
  d3.select(".hospital_map")
    .select("svg")
    .attr("width", map_width)

  g.transition()
   .duration(200)
   .attr("transform", "translate(" + map_width / 2 + "," + map_height / 2.3 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")

}

$(window).resize(function() {
    clearTimeout(checkResize);
    var checkResize = setTimeout(function() {
      windowResized();
    }, 1000);
});