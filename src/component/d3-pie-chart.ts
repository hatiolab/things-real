/*
 * Copyright © HatioLab Inc. All rights reserved.
 */

import Component from './component'

import D3Chart from './d3-chart'
import * as d3 from 'd3'

export default class D3PieChart extends D3Chart {

  static get type() {
    return 'd3-pie-chart'
  }

  onchangedata(after, before) {

    var {
      dimension,
      margin = { top: 20, right: 20, bottom: 20, left: 20 },
    } = this.state

    var width = dimension.width - margin.left - margin.right
    var height = dimension.height - margin.top - margin.bottom
    var radius = Math.min(width, height) / 2

    var svg = d3.select((this.cssObject3D as any).element)

    svg.selectAll("*").remove()

    var arc = d3.arc()
      .innerRadius(radius - 100)
      .outerRadius(radius - 20)

    var pie = d3.pie()
      .value(function (d) { return d.apples; })
      .sort(null)

    var color = d3.scaleOrdinal(d3.schemeCategory10)

    var data = after

    var g = svg.append("g").attr("transform", "translate(" + (margin.left + width / 2) + "," + (margin.top + height / 2) + ")")

    var path = g.datum(data).selectAll("path")
      .data(pie)
      .enter().append("path")
      .attr("fill", function (d, i) { return color(i); })
      .attr("d", arc)
  }
}

Component.register(D3PieChart.type, D3PieChart)
