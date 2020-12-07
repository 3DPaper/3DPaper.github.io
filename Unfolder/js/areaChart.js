class AreaChart {

    constructor(parentElement, data , burshName , xAxisName) {
        this.parentElement = parentElement;
        this.data = data;
        this.brushName = burshName;
        this.xAxisName = xAxisName;

        console.log(data)
        this.max = d3.max(data, function(d) { return +d;} );
        this.min = d3.min(data, function(d) { return +d;} );
        this.step = 30
        this.gap = (this.max-this.min)/(this.step-1)
        this.hisData = []

        for(var i = 0; i<this.step;i++){
            var temp = {}
            temp["key"] = i
            temp["x_value"] = this.min + i * this.gap
            temp['value'] = 0
            this.hisData.push(temp)
        }

        for(var i = 0; i<this.data.length;i++){
            var group =  Math.floor((this.data[i] - this.min) / this.gap)
            this.hisData[group].value +=1
        }

        this.displayData = this.hisData
        this.initVis()

    }

    initVis() {
        let vis = this;

        // * TO-DO *
        vis.margin = {top: 20, right: 40, bottom: 33, left: 40};

        vis.width = $('#' + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = ($('#' + vis.parentElement).height() - vis.margin.top - vis.margin.bottom)*0.25

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(vis.displayData, function(d) { return (d.x_value);}))

        vis.y = d3.scaleLinear()
            .range([vis.height, 0])
            .domain([0, d3.max(vis.displayData, function(d) { return d.value; })]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .ticks(5)


        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .ticks(5)

        vis.xScale = d3.scaleLinear()
            .range([0, vis.width])
            .domain(d3.extent(vis.displayData, function(d) { return d.key; }));

        // SVG area path generator
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(function(d) { return vis.x(d.x_value); })
            .y0(vis.height)
            .y1(function(d) { return vis.y(d.value); });

        // Draw area by using the path generator
        vis.svg.append("path")
            .datum(vis.displayData)
            .attr("fill", "#ccc")
            .attr("d", vis.area);

        // TO-DO: Initialize brush component

        vis.brush = d3.brushX()
            .extent([[0, 0], [vis.width, vis.height]])
            .on("brush", brushed);

        // TO-DO: Append brush component here
        vis.svg.append("g")
            .attr("class", vis.brushName)
            .call(vis.brush)
            .selectAll("rect")
            .attr("y", -6)
            .attr("height", vis.height + 7);

        // Append x-axis
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")")
            .call(vis.xAxis);

        vis.svg.append("text")
            .attr("class", "x-axis-text")
            .attr("x", (vis.width) -100)
            .attr("y", vis.height + vis.margin.bottom - 5)
            .text(vis.xAxisName);

        vis.svg.append("g")
            .attr("class", "y-axis axis")
            //.attr("transform", "translate(0," + vis.height + ")")
            .call(vis.yAxis);

        vis.svg.append("text")
            .attr("x", 0)
            .attr("y", -8)
            //.text("Number of Edges");

        /*
        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", "translate(" + -5 +",0)")
            .call(vis.yAxis)
            .append("text")
            .attr("class", "y-axis-text")
            .attr("transform", "translate(0," + -5 + ")")
            .text("count")

         */

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }


    /*
     * Data wrangling
     */

    wrangleData() {
        let vis = this;

        // (1) Group data by date and count survey results for each day
        // (2) Sort data by day


        // * TO-DO *


        // Update the visualization
        vis.updateVis();
    }


    /*
     * The drawing function
     */

    updateVis() {
        let vis = this;

        // * TO-DO *

    }
}

