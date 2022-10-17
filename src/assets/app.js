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
        d3.select(this).style('stroke', 'black').style('opacity', 0.5).style('cursor', 'pointer')
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
            .style('top', event.pageY - 10 + 'px')
    }

    const mouseleave = function (event, data) {
        tooltip.style('opacity', 0)
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
