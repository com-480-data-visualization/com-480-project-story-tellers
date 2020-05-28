d3v3 = window.d3;
window.d3 = null;
var marginTitle = { top: 20, left: 500},
    mapWidth = 900,
    mapHeight = 700;

var mapSvg = d3v3.select("#map-container").append("svg")
                .attr("width", mapWidth)
                .attr("height", mapHeight);

var title = mapSvg.append("text")
                  .attr("class", "vis-title")
                  .attr("transform", "translate(" + marginTitle.left + "," + marginTitle.top + ")")
                  .text("Data load in progress");

const projection4 = d3v3.geo.albers()
                      .rotate([0, 0])
                      .center([8.3, 46.8])
                      .scale(16000)
                      .translate([mapWidth / 2, mapHeight / 2])
                      .precision(.1);


const path4 = d3v3.geo.path().projection(projection4);


//load and draw the map
d3v3.json( "data/suisse_cantons.json", function(error, swiss){
  if (error) throw error;


  var cantons4 = topojson.feature(swiss, swiss.objects.dd_geojson_switzerland);

  mapSvg.append("path")
      .datum(cantons4)
      .attr("class", "canton")
      .attr("d", path4);


  mapSvg.append("path")
      .datum(topojson.mesh(swiss, swiss.objects.dd_geojson_switzerland, function(a, b) { return a !== b; }))
      .attr("class", "canton-boundary")
      .attr("d", path4);

});



var colorScale  = d3v3.scale.category10();
//.range(["#D6D3D3", "#6B87AD", "#5F5E7C", "#3E2C4B", "#C87BC8"]);


var radiusScale = d3v3.scale.sqrt().range([2, 25]);
// Add the tooltip container to the vis container
// it's invisible and its position/contents are defined during mouseover

 var tooltip4 = d3v3.select("#map-container").append("div")
                     .style("opacity", 0)
                     .attr("class", "tooltip")
                     .style("background-color", "white")
                     .style("border", "solid")
                     .style("border-width", "1px")
                     .style("border-radius", "5px")
                     .style("padding", "10px");

// tooltip mouseover event handler
function tipMouseover(d) {
            this.setAttribute("class", "circle-hover"); // add hover class to emphasize

            var color = colorScale(d.route_type);
            var text_to_write  = "<span style='color:" + color + ";'>" + d.station_name + "</span><br/>" +
                                        "Count: " + d.number_of_transport;
            const coords = projection4([d.longitude, d.latitude])
            tooltip4.html(text_to_write);
            tooltip4.attr("text-anchor", "middle")
                    .style("left", (coords[0] + 20) + "px")
                    .style("top", (coords[1] -50) + "px");
            tooltip4.transition()
                      .duration(500) // ms
                    .style("opacity", .9)
                };

// tooltip mouseout event handler
function tipMouseout(d) {
              this.classList.remove("circle-hover"); // remove hover class

              tooltip4.transition()
                        .duration(500) // ms
                        .style("opacity", 0); // don't care about position!
                };

getData();


function getData() {
      // console.log("start to read data for stations capacity");

      d3v3.csv("data/station_capacity_no_bus.csv", function(error, dataForMap) {
      if (error) return console.log("error");

      // console.log("finished reading");

      var parseHourMin = d3v3.time.format("%H:%M").parse;

      var dataForTimeline = [],
          dateToTransportCount = {};

      dataForMap.forEach(function(d, idx) {
            // console.log("index", idx);
            d.arrival_time = parseHourMin(d.arrival_time);
            d.number_of_transport = +d.number_of_transport;
            d.latitude = +d.latitude;
            d.longitude = +d.longitude;
            colorScale(d.route_type);

            if (!dateToTransportCount[d.arrival_time]) {
                  dateToTransportCount[d.arrival_time] = d.number_of_transport;
            } else {
                  dateToTransportCount[d.arrival_time] += d.number_of_transport;
            }
          });
      Object.keys(dateToTransportCount).forEach(function(time) {
              dataForTimeline.push({ arrival_time: new Date(time), number_of_transport: dateToTransportCount[time]});
      });
      dataForTimeline.sort(function(a,b) { return a.arrival_time - b.arrival_time; });

      radiusScale.domain(d3v3.extent(dataForMap, function(transport) { return + transport.number_of_transport; }));

      makeTimeline(dataForMap, dataForTimeline);
      makeLegend(dataForMap);
      });
};
// Creates the event timeline and sets up callbacks for brush changes
function makeTimeline(dataForMap, dataForTimeline) {
         var margin = { top: 10, right: 10, bottom: 20, left: 50 },
            width  = mapWidth - margin.left - margin.right,
            height = 80 - margin.top  - margin.bottom;
            // console.log("timeline width:", width);
            // console.log("timeline height:", height);


            var timelineSvg = d3v3.select("#timeline-container").append("svg")
                  .attr("width", width + margin.left + margin.right)
                  .attr("height", height + margin.top + margin.bottom);

            var timeline3 = timelineSvg.append("g")
                    .attr("class", "timeline")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

            var x = d3v3.time.scale()
                    .domain(d3v3.extent(dataForTimeline.map(function(d) { return d.arrival_time; })))
                    .range([0, width]);

            var y = d3v3.scale.linear()
                    .domain(d3v3.extent(dataForTimeline.map(function(d) { return d.number_of_transport; })))
                    .range([height, 0]);

            var xAxis = d3v3.svg.axis()
                    .scale(x)
                    .orient("bottom");

            var yAxis = d3v3.svg.axis()
                    .scale(y)
                    .orient("left")
                    .ticks(4);

            var area = d3v3.svg.area()
                    .interpolate("linear")
                    .x(function(d) { return x(d.arrival_time); })
                    .y0(height)
                    .y1(function(d) { return y(d.number_of_transport); });

            timeline3.append("path")
                    .datum(dataForTimeline)
                    .attr("class", "area")
                    .attr("d", area);

            timeline3.append("g")
                    .attr("class", "x axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(xAxis);

            timeline3.append("g")
                    .attr("class", "y axis")
                    .call(yAxis);

            timeline3.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("dy", "1em")
                    .style("text-anchor", "end")
                    .text("# transports");

            var parseHourMin = d3v3.time.format("%H:%M").parse
            // Add brush to timeline, hook up to callback
            var brush = d3v3.svg.brush()
                    .x(x)
                    .on("brush", function() { brushCallback(brush, dataForMap); })
                    .extent([parseHourMin("03:00"), parseHourMin("06:00")]); // initial value

            timeline3.append("g")
                    .attr("class", "x brush")
                    .call(brush)
                    .selectAll("rect")
                    .attr("y", -6)
                    .attr("height", height + 7);

            brush.event(timeline3.select('g.x.brush')); // dispatches a single brush event
};

// Called whenever the timeline brush range (extent) is updated
// Filters the map data to those points that fall within the selected timeline range
function brushCallback(brush, dataForMap) {
        if (brush.empty()) {
              updateMapPoints([]);
              updateTitleText();
        } else {
              var newDateRange = brush.extent(),
                  filteredData = [];

              dataForMap.forEach(function(d) {
                    if (d.arrival_time >= newDateRange[0] && d.arrival_time <= newDateRange[1]) {
                            filteredData.push(d);
                    }
              });
              updateMapPoints(filteredData);
              updateTitleText(newDateRange);
          }
};

// Updates the vis title text to include the passed date array: [start Date, end Date]
function updateTitleText(newDateArray) {
        if (!newDateArray) {
              title.text("Data load in progress");
        } else {
              var from = ('0' + (newDateArray[0].getHours())).slice(-2) + ":" + ('0' + (newDateArray[0].getMinutes())).slice(-2),
                  to =   ('0'+(newDateArray[1].getHours())).slice(-2) + ":" +
                            ('0'+(newDateArray[1].getMinutes())).slice(-2);
              title.text("Time period " + from + " - " + to);
          }
};

// Updates the points displayed on the map, to those in the passed data array
function updateMapPoints(data) {
      // adjust scale
      var circles = mapSvg.selectAll("circle").data(data, d => d.station_id + d.station_name + d.route_type + d.number_of_transport);

            circles // update existing points
                    .on("mouseover", tipMouseover)
                    .on("mouseout", tipMouseout)
                    .attr("fill", d => colorScale(d.route_type))
                    .attr("opacity", 0.5)
                    .attr("cx", function(d) { return projection4([+d.longitude, +d.latitude])[0]; })
                    .attr("cy", function(d) { return projection4([+d.longitude, +d.latitude])[1]; })
                    .attr("r",  d => radiusScale(d.number_of_transport));


            circles.enter().append("circle") // new entering points
                    .on("mouseover", tipMouseover)
                    .on("mouseout", tipMouseout)
                    .attr("fill", function(d) { return colorScale(d.route_type); })
                    .attr("opacity", 0.5)
                    .attr("cx", function(d) { return projection4([+d.longitude, +d.latitude])[0]; })
                    .attr("cy", function(d) { return projection4([+d.longitude, +d.latitude])[1]; })
                    .attr("r",  function(d) { return radiusScale(d.number_of_transport); });

            circles.exit() // exiting points
                    .attr("r",  function(d) { return radiusScale(d.number_of_transport); })
                    .attr("r", 10).remove();
};
// Creates a legend showing the mapping from transport type to color
// **nb: the domain of colorScale should include all transport types when this is called
function makeLegend(dataForMap) {
        var margin = { top: 50, left: -10 },
                legendWidth  = 250,
                legendHeight = 150;

        var legend = mapSvg.append('g')
                     .attr('width', legendWidth)
                     .attr('height', legendHeight)
                     .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var legends = legend.selectAll(".legend")
                      .data(colorScale.domain())
                      .enter().append("g")
                      .attr("class", "legend")
                      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

        // draw legend colored rectangles
        legends.append("rect")
                  .attr("x", legendWidth - 18)
                  .attr("width", 18)
                  .attr("height", 18)
                  .style("fill", colorScale);
                //  .on("click", function(d) { update(d, legends, dataForMap) });

        // draw legend text
        legends.append("text")
                  .attr("x", legendWidth - 24)
                  .attr("y", 9)
                  .attr("dy", ".35em")
                  .style("text-anchor", "end")
                  .text(function(d) { return d.toLowerCase(); });
  };
