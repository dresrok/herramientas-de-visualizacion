const config = {
    map: {
        width: 900,
        height: 720,
    },
    legend: {
        width: 725,
        height: 80,
    },
    projection: d3.geoMercator(),
    dataUrl: './datasets/spain-communities-merged.geojson',
    numberFormat: Intl.NumberFormat('en-US'),
}

const map = d3
    .select('#map')
    .append('svg')
    .attr('width', config.map.width) // apply width,height to svg
    .attr('height', config.map.height)
    .style('opacity', 0)

const mapLegend = d3
    .select('#map-legend')
    .append('svg')
    .attr('width', config.legend.width)
    .attr('height', config.legend.height)
    .style('opacity', 0)

const path = d3.geoPath(config.projection)

d3.json(config.dataUrl).then(function (geojson) {
    config.projection.fitSize([config.map.width, config.map.height], geojson) // adjust the projection to the features
    // svg.append('path').attr('d', path(geojson)) // draw the features

    const tooltip = d3
        .select('#map')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    const mouseover = function (event, data) {
        tooltip.style('opacity', 1)
        d3.select(this).style('opacity', 0.5).style('cursor', 'pointer')
    }

    const mousemove = (event, data) => {
        tooltip
            .html(
                `
            <div class="tooltip-title">
                <div>Comunidad Autónoma:</strong> ${
                    data.properties.parametro
                }</div>
            </div>
            <div class="tooltip-content">
                <ul>
                    <li><strong>Número de infracciones:</strong> ${config.numberFormat.format(
                        data.properties.valor
                    )}</li>
                </ul>
            </div>
        `
            )
            .style('left', event.pageX + 70 + 'px')
            .style('top', event.pageY - 70 + 'px')
    }

    const mouseleave = function (event, data) {
        tooltip.style('opacity', 0).style('left', 0).style('top', 0)
        d3.select(this).style('stroke', 'black').style('opacity', 1)
    }

    const colorScale = d3
        .scaleLinear()
        .domain([891, 108560])
        .range(['#f7efd9', '#7a0177'])

    mapLegend
        .append('g')
        .attr('class', 'legendLinear')
        .attr('transform', 'translate(20,20)')
        .style('font-size', '0.8em')

    const legendLinear = d3
        .legendColor()
        .labelFormat(d3.format(',d'))
        .shapeWidth(60)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale)
        .shapePadding(10)

    mapLegend.select('.legendLinear').call(legendLinear)

    map.selectAll('path')
        .data(geojson.features)
        .enter()
        .append('path')
        .attr('d', path)
        .style('stroke', 'black')
        .attr('fill', (data) => {
            return colorScale(parseInt(data.properties.valor))
        })
        .on('mouseover', mouseover)
        .on('mousemove', mousemove)
        .on('mouseleave', mouseleave)

    map.transition()
        .duration(2000)
        .ease(d3.easeBackInOut.overshoot(0.7))
        .style('opacity', 1)

    mapLegend
        .transition()
        .duration(2000)
        .ease(d3.easeBackInOut.overshoot(0.7))
        .style('opacity', 1)
})


// ------------- BAR CHART -------------

// set the dimensions and margins of the graph
var margin = {top: 10, right: 30, bottom: 90, left: 40},
    width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.json("./datasets/las_cifras_del_crimen_en_españa.json").then((response) => {
    const data  = response['Respuesta']['Datos']['Metricas'][0]['Datos'];
    let dataVehicleTheft = [];

    for (let row of data) {
        let year = row['Agno'];
        let parameter = row['Parametro'];
        let value = row['Valor'];

        if (parameter === 'Sustracciones de vehículos') {
            dataVehicleTheft.push({year: '1er T - ' + year, value});
        }
    }

     // X axis
    var x = d3.scaleBand()
        .range([ 0, width ])
        .domain(dataVehicleTheft.map(function(d) { return d.year; }))
        .padding(0.2);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 13000])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Bars
    svg.selectAll("mybar")
        .data(dataVehicleTheft)
        .enter()
        .append("rect")
        .attr("x", function(d) { return x(d.year); })
        .attr("width", x.bandwidth())
        .attr("fill", "#69b3a2")
        // no bar at the beginning thus:
        .attr("height", function(d) { return height - y(0); }) // always equal to 0
        .attr("y", function(d) { return y(0); })

    // Animation
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .delay(function(d, i){ return(i*1000) });
});