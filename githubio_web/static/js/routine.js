var svg1 = d3.select("#svg1"),
    width = +svg1.attr("width"),
    height = +svg1.attr("height"),
    innerRadius = 180,
    outerRadius = Math.min(width, height) / 2.5,
    g_1 = svg1.append("g").attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");


var xScaleOffset = Math.PI * 75/180;
var x = d3.scaleBand()
    .range([xScaleOffset, 2 * Math.PI + xScaleOffset])
    .align(0);

var y = d3.scaleLinear()
    .range([innerRadius, outerRadius]);

var z = d3.scaleOrdinal()
    .range(["#98abc5", "#8a89a6"]);

var zClasses = ['Number of Starting transportation', 'Number of Finishing transportation'];

d3.csv("data/time_routine.csv", function(d, i, columns) {
  d.start = (+d.start);
  d.end =  (+d.end);
  return d;
}, function(error, data) {
  if (error) throw error;

  var keys = data.columns.slice(1);
  var meanAccidents = d3.mean(data, function(d) { return d3.sum(keys, function(key) { return d[key]; }); })

  x.domain(data.map(function(d) { return d.time; }));
  y.domain([0, d3.max(data, function(d) { return (d.start + d.end); })]);
  z.domain(data.columns.slice(1));

  g_1.append('g')
      .selectAll("g")
    .data(d3.stack().keys(data.columns.slice(1))(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("path")
    .data(function(d) { return d; })
    .enter().append("path")
      .attr("d", d3.arc()
          .innerRadius(function(d) { return y(d[0]); })
          .outerRadius(function(d) { return y(d[1]); })
          .startAngle(function(d) { return x(d.data.time); })
          .endAngle(function(d) { return x(d.data.time) + x.bandwidth(); })
          .padAngle(0.01)
          .padRadius(innerRadius));

  //yAxis and Mean

  var yAxis = g_1.append("g")
      .attr("text-anchor", "middle");

  var yTicksValues = d3.ticks(0, 40, 4);


  // Mean value line
  var yMeanTick = yAxis
    .append("g")
    .datum([meanAccidents]);

  yMeanTick.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#C0625E")
      .attr("stroke-dasharray", "5 3")
      .attr("r", y);

  var yTick = yAxis
    .selectAll("g")
    .data(yTicksValues)
    .enter().append("g");

  yTick.append("circle")
      .attr("fill", "none")
      .attr("stroke", "#ccdcea")
      .attr("r", y);

  yTick.append("text")
      .attr("y", function(d) { return -y(d); })
      .attr("dy", "0.35em")
      .attr("fill", "none")
      .attr("stroke", "#fff")
      .attr("stroke-width", 5)
      .text(y.tickFormat(5, "s"));

  yTick.append("text")
      .attr("y", function(d) { return -y(d); })
      .attr("dy", "0.35em")
      .text(y.tickFormat(5, "s"));

  yAxis.append("text")
      .attr("y", function(d) { return -y(yTicksValues.pop()); })
      .attr("dy", "-2em")
      .text("Number");

  // Labels for xAxis

  var label_1 = g_1.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("text-anchor", "middle")
      .attr("transform", function(d) { return "rotate(" + ((x(d.time) + x.bandwidth() / 2) * 180 / Math.PI - 90) + ")translate(" + innerRadius + ",0)"; });

  label_1.append("line")
      .attr("x2", function(d) { return (((d.time % 5) == 0) | (d.time == '1')) ? -7 : -4 })
      .attr("stroke", "#000");

  label_1.append("text")
      .attr("transform", function(d) { return (x(d.time) + x.bandwidth() / 2 + Math.PI / 2) % (2 * Math.PI) < Math.PI ? "rotate(90)translate(0,16)" : "rotate(-90)translate(0,-9)"; })
      .text(function(d) {
        var xlabel = (((d.time % 5) == 0) | (d.time == '1')) ? d.time : '';
        return xlabel; });

// Legend
 var legend_1 = g_1.append("g")
    .selectAll("g")
    .data(zClasses)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(-50," + (i - (zClasses.length - 1) / 2) * 25+ ")"; });

  legend_1.append("circle")
      .attr("r", 8)
      .attr("fill", z);

  legend_1.append("text")
      .attr("x", 15)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .text(function(d) { return d; });

});
