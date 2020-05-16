const urls = {

  map: "data/suisse_cantons.json",

  stations:
    "data/stations.csv",

  trips:
    "data/trips.csv"
};

const svg  = d3.select("#svg2");

const width  = parseInt(svg.attr("width"));
const height = parseInt(svg.attr("height"));
const hypotenuse = Math.sqrt(width * width + height * height);

const projection = d3.geoAlbers()
                      .rotate([0, 0])
                      .center([8.3, 46.8])
                      .scale(16000)
                      .translate([width / 2, height / 2])
                      .precision(.1);

const path = d3.geoPath().projection(projection);
const scales = {
  // used to scale station bubbles
  stations: d3.scaleSqrt()
    .range([4, 18]),

  // used to scale number of segments per line
  segments: d3.scaleLinear()
    .domain([0, hypotenuse])
    .range([1, 10])
};

// have these already created for easier drawing
const g = {
  basemap:  svg.select("g#basemap"),
  trips:  svg.select("g#trips"),
  stations: svg.select("g#stations"),
  voronoi:  svg.select("g#voronoi")
};

console.assert(g.basemap.size()  === 1);
console.assert(g.trips.size()  === 1);
console.assert(g.stations.size() === 1);
console.assert(g.voronoi.size()  === 1);

const tooltip = d3.select("text#tooltip");
console.assert(tooltip.size() === 1);

// load and draw base map
d3.json(urls.map).then(drawMap);

// load the station and trip data together
const promises = [
  d3.csv(urls.stations, typestation),
  d3.csv(urls.trips,  typetrip)
];

Promise.all(promises).then(processData);

// process station and trip data
function processData(values) {
  console.assert(values.length === 2);

  let stations = values[0];
  let trips  = values[1];

  console.log("stations: " + stations.length);
  console.log(" trips: " + trips.length);

  // convert stations array (pre filter) into map for fast lookup
  let iata = new Map(stations.map(node => [node.iata, node]));

  // calculate incoming and outgoing degree based on trips
  // trips are given by station iata code (not index)
  trips.forEach(function(link) {
    link.source = iata.get(link.origin);
    link.target = iata.get(link.destination);

    link.source.outgoing += link.count;
    link.target.incoming += link.count;
  });


  drawstations(stations);
  drawPolygons(stations);
  drawtrips(stations, trips);

  console.log({stations: stations});
  console.log({trips: trips});
}

// draws the underlying map
function drawMap(swiss) {

  var cantons = topojson.feature(swiss, swiss.objects.dd_geojson_switzerland);

  g.basemap.append("path")
      .datum(cantons)
      .attr("class", "canton")
      .attr("d", path);

  g.basemap.append("path")
      .datum(topojson.mesh(swiss, swiss.objects.dd_geojson_switzerland, function(a, b) { return a !== b; }))
      .attr("class", "canton-boundary")
      .attr("d", path);


}

function drawstations(stations) {
  // adjust scale
  const extent = d3.extent(stations, d => d.outgoing);
  scales.stations.domain(extent);

  // draw station bubbles
  g.stations.selectAll("circle.station")
    .data(stations, d => d.iata)
    .enter()
    .append("circle")
    .attr("r",  d => scales.stations(d.outgoing))
    .attr("cx", d => d.x) // calculated on load
    .attr("cy", d => d.y) // calculated on load
    .attr("class", "station")
    .each(function(d) {
      // adds the circle object to our station
      // makes it fast to select stations on hover
      d.bubble = this;
    });
}

function drawPolygons(stations) {
  // convert array of stations into geojson format
  const geojson = stations.map(function(station) {
    return {
      type: "Feature",
      properties: station,
      geometry: {
        type: "Point",
        coordinates: [station.longitude, station.latitude]
      }
    };
  });

  // calculate voronoi polygons
  const polygons = d3.geoVoronoi().polygons(geojson);
  console.log(polygons);

  g.voronoi.selectAll("path")
    .data(polygons.features)
    .enter()
    .append("path")
    .attr("d", d3.geoPath(projection))
    .attr("class", "voronoi")
    .on("mouseover", function(d) {
      let station = d.properties.site.properties;

      d3.select(station.bubble)
        .classed("highlight", true);

      d3.selectAll(station.trips)
        .classed("highlight", true)
        .raise();

      // make tooltip take up space but keep it invisible
      tooltip.style("display", null);
      tooltip.style("visibility", "hidden");

      // set default tooltip positioning
      tooltip.attr("text-anchor", "middle");
      tooltip.attr("dy", -scales.stations(station.outgoing) - 4);
      tooltip.attr("x", station.x);
      tooltip.attr("y", station.y);

      // set the tooltip text
      tooltip.text(station.name + " in " + station.canton);

      // double check if the anchor needs to be changed
      let bbox = tooltip.node().getBBox();

      if (bbox.x <= 0) {
        tooltip.attr("text-anchor", "start");
      }
      else if (bbox.x + bbox.width >= width) {
        tooltip.attr("text-anchor", "end");
      }

      tooltip.style("visibility", "visible");
    })
    .on("mouseout", function(d) {
      let station = d.properties.site.properties;

      d3.select(station.bubble)
        .classed("highlight", false);

      d3.selectAll(station.trips)
        .classed("highlight", false);

      d3.select("text#tooltip").style("visibility", "hidden");
    })
    .on("dblclick", function(d) {
      // toggle voronoi outline
      let toggle = d3.select(this).classed("highlight");
      d3.select(this).classed("highlight", !toggle);
    });
}

function drawtrips(stations, trips) {
  // break each trip between stations into multiple segments
  let bundle = generateSegments(stations, trips);

  // https://github.com/d3/d3-shape#curveBundle
  let line = d3.line()
    .curve(d3.curveBundle)
    .x(station => station.x)
    .y(station => station.y);

  let links = g.trips.selectAll("path.trip")
    .data(bundle.paths)
    .enter()
    .append("path")
    .attr("d", line)
    .attr("class", "trip")
    .each(function(d) {
      // adds the path object to our source station
      // makes it fast to select outgoing paths
      d[0].trips.push(this);
    });

  // https://github.com/d3/d3-force
  let layout = d3.forceSimulation()
    // settle at a layout faster
    .alphaDecay(0.1)
    // nearby nodes attract each other
    .force("charge", d3.forceManyBody()
      .strength(10)
      .distanceMax(scales.stations.range()[1] * 2)
    )
    // edges want to be as short as possible
    // prevents too much stretching
    .force("link", d3.forceLink()
      .strength(0.7)
      .distance(0)
    )
    .on("tick", function(d) {
      links.attr("d", line);
    })
    .on("end", function(d) {
      console.log("layout complete");
    });

  layout.nodes(bundle.nodes).force("link").links(bundle.links);
}

// Turns a single edge into several segments that can
// be used for simple edge bundling.
function generateSegments(nodes, links) {
  // generate separate graph for edge bundling
  // nodes: all nodes including control nodes
  // links: all individual segments (source to target)
  // paths: all segments combined into single path for drawing
  let bundle = {nodes: [], links: [], paths: []};

  // make existing nodes fixed
  bundle.nodes = nodes.map(function(d, i) {
    d.fx = d.x;
    d.fy = d.y;
    return d;
  });

  links.forEach(function(d, i) {
    // calculate the distance between the source and target
    let length = distance(d.source, d.target);

    // calculate total number of inner nodes for this link
    let total = Math.round(scales.segments(length));

    // create scales from source to target
    let xscale = d3.scaleLinear()
      .domain([0, total + 1]) // source, inner nodes, target
      .range([d.source.x, d.target.x]);

    let yscale = d3.scaleLinear()
      .domain([0, total + 1])
      .range([d.source.y, d.target.y]);

    // initialize source node
    let source = d.source;
    let target = null;

    // add all points to local path
    let local = [source];

    for (let j = 1; j <= total; j++) {
      // calculate target node
      target = {
        x: xscale(j),
        y: yscale(j)
      };

      local.push(target);
      bundle.nodes.push(target);

      bundle.links.push({
        source: source,
        target: target
      });

      source = target;
    }

    local.push(d.target);

    // add last link to target node
    bundle.links.push({
      source: target,
      target: d.target
    });

    bundle.paths.push(local);
  });

  return bundle;
}

// determines which states belong to the continental united states
// https://gist.github.com/mbostock/4090846#file-us-state-names-tsv
function isContinental(state) {
  const id = parseInt(state.id);
  return id < 60 && id !== 2 && id !== 15;
}

// see stations.csv
// convert gps coordinates to number and init degree
function typestation(station) {
  station.longitude = parseFloat(station.longitude);
  station.latitude  = parseFloat(station.latitude);

  // use projection hard-coded to match topojson data
  const coords = projection([station.longitude, station.latitude]);
  station.x = coords[0];
  station.y = coords[1];

  station.outgoing = 0;  // eventually tracks number of outgoing trips
  station.incoming = 0;  // eventually tracks number of incoming trips

  station.trips = [];  // eventually tracks outgoing trips

  return station;
}

// see trips.csv
// convert count to number
function typetrip(trip) {
  trip.count = parseInt(trip.count);
  return trip;
}

// calculates the distance between two nodes
// sqrt( (x2 - x1)^2 + (y2 - y1)^2 )
function distance(source, target) {
  const dx2 = Math.pow(target.x - source.x, 2);
  const dy2 = Math.pow(target.y - source.y, 2);

  return Math.sqrt(dx2 + dy2);
}
