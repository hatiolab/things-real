/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import D3Chart from './d3-chart'
import * as d3 from 'd3'

export default class D3LineChart extends D3Chart {

  static get type() {
    return 'd3-line-chart'
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

    var parseTime = d3.timeParse("%d-%b-%y")
    var data = after.map(datum => {
      return {
        ...datum,
        date: parseTime(datum.date)
      }
    })

    var x = d3.scaleTime().rangeRound([0, width])
    var y = d3.scaleLinear().rangeRound([height, 0])

    var line = d3.line()
      .x(function (d) { return x(d.date); })
      .y(function (d) { return y(d.close); })

    x.domain(d3.extent(data, function (d) { return d.date; }));
    y.domain(d3.extent(data, function (d) { return d.close; }));

    var g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")")

    g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x))
      .select(".domain")
      .remove();

    g.append("g")
      .call(d3.axisLeft(y))
      .append("text")
      .attr("fill", "#000")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", "0.71em")
      .attr("text-anchor", "end")
      .text("Price ($)");

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", line);
  }
}

Component.register(D3LineChart.type, D3LineChart)
