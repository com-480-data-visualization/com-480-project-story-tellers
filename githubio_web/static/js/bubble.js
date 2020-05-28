var svg3 = d3.select("#svg3"),
    margin = 20,
    diameter = +svg3.attr("width"),
    g3 = svg3.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

var color = d3.scaleLinear()
    .domain([-1, 5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);

var pack = d3.pack()
    .size([diameter - margin, diameter - margin])
    .padding(2);

d3.json("data/bubble.json", function(error, root3) {
  if (error) throw error;

  root3 = d3.hierarchy(root3)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus3 = root3,
      nodes3 = pack(root3).descendants(),
      view3;

  var circle3 = g3.selectAll("circle")
    .data(nodes3)
    .enter().append("circle")
    .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
    .style("fill", function(d) { return d.children ? color(d.depth) : null; })
    .on("click", function(d) { if (focus3 !== d) zoom(d), d3.event.stopPropagation(); });

  var text = g3.selectAll("text")
    .data(nodes3)
    .enter().append("text")
      .attr("class", "label")
      //.style("fill-opacity", function(d) { return d.parent === root3 ? 1 : 0; })
      .style("display", function(d) { return d.parent === root3 ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  var node3 = g3.selectAll("circle,text");

  svg3.on("click", function() { zoom(root3); });

  zoomTo([root3.x, root3.y, root3.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus3; focus3 = d;

    var transition3 = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus3.x, focus3.y, focus3.r * 2 + margin]);
          return function(t) { zoomTo(i(t)); };
        });

    transition3.selectAll("text")
      .filter(function(d) { return d.parent === focus3 || this.style.display === "inline"; })
        .style("fill-opacity", function(d) { return d.parent === focus3 ? 1 : 0; })
        .on("start", function(d) { if (d.parent === focus3) this.style.display = "inline"; })
        .on("end", function(d) { if (d.parent !== focus3) this.style.display = "none"; });
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node3.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle3.attr("r", function(d) { return d.r * k; });
  }
});
