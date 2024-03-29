/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import D3Chart from './d3-chart'
import * as d3 from 'd3'

export default class D3BarChart extends D3Chart {

  static get type() {
    return 'd3-bar-chart'
  }

  get styleSheet() {
    return `
    .bar {
      fill: steelblue;
    }
    
    .bar:hover {
      fill: brown;
    }
    
    .axis--x path {
      display: none;
    }`
  }

  onchangedata(after, before) {

    var {
      dimension,
      margin = { top: 20, right: 20, bottom: 30, left: 40 },
    } = this.state

    var width = dimension.width - margin.left - margin.right
    var height = dimension.height - margin.top - margin.bottom

    var svg = d3.select(this.domElement)

    svg.selectAll("*").remove()

    var x = d3.scaleBand().rangeRound([0, width]).padding(0.1)
    var y = d3.scaleLinear().rangeRound([height, 0])

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.domain(after.map(function (d) { return d.letter; }));
    y.domain([0, d3.max(after as ArrayLike<{}>, function (d) { return (d as any).frequency; })]);

    g.append("g")
      .attr("class", "axis axis--x")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

    g.append("g")
      .attr("class", "axis axis--y")
      .call(d3.axisLeft(y).ticks(10, "%"))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Frequency");

    g.selectAll(".bar")
      .data(after)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function (d) { return x((d as any).letter); })
      .attr("y", function (d) { return y((d as any).frequency); })
      .attr("width", x.bandwidth())
      .attr("height", function (d) { return height - y((d as any).frequency); });
  }
}

Component.register(D3BarChart.type, D3BarChart)
