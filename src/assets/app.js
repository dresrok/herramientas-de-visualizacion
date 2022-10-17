/*
* Se definen variables generales de configuración
* como el ancho y alto del mapa y leyenda,
* tipo de proyección del mapa, la url del dataset
* y una función utilitaria para formato de cifras numéricas
*/
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

/*
* Se selecciona el identificador map inicializando el objeto donde se renderizarán los datos del mapa
* y se definen tanto los atributos de ancho y alto como el estilo de opacidad
*/
const map = d3
    .select('#map')
    .append('svg')
    .attr('width', config.map.width)
    .attr('height', config.map.height)
    .style('opacity', 0)

/*
* Se selecciona el identificador map-legend inicializando el objeto donde se renderizarán los datos de la leyenda
* y se definen tanto los atributos de ancho y alto como el estilo de opacidad
*/
const mapLegend = d3
    .select('#map-legend')
    .append('svg')
    .attr('width', config.legend.width)
    .attr('height', config.legend.height)
    .style('opacity', 0)

/*
* Se crea un nuevo generador de rutas geográficas
* basado en la proyección definida
*/
const path = d3.geoPath(config.projection)

/*
* Se lee dataset mediante su URL y se carga
* la información en la variable geojson
*/
d3.json(config.dataUrl).then(function (geojson) {
    // Se ajusta la proyección basado en los features del geojson 
    config.projection.fitSize([config.map.width, config.map.height], geojson)

    // Se selecciona el identificador map y se añade un elemento div
    // que contendrá el toolptip, se le coloca la clase .tooltip y
    // se hace invisible meidante la opacidad
    const tooltip = d3
        .select('#map')
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)

    // Se define una función para capturar el evento 'mouseover' del mouse
    // donde se cambia la opacidad el tooltip haciéndolo visible
    // y se cambia la opacidad del path geográfico mientras el mouse este encima
    // para dar una indicación al usuario que esta siendo seleccioando el elemento
    const mouseover = function (event, data) {
        tooltip.style('opacity', 1)
        d3.select(this).style('opacity', 0.5).style('cursor', 'pointer')
    }
    // Se define una función flecha para capturar el evento 'mousemove' del mouse
    // donde se renderiza el contenido el tooltip basado en la información geográfica
    // seleccionada mostrando la comunidad y el número de infracciones
    // también se añade un offset en la posición top y left del tooltip para mejorar
    // su visualización
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

    // Se define una función para capturar el evento 'mouseleave' del mouse
    // donde se oculta el tooltip mediante la opacidad y se cambia su posición
    // se restaura la opacidad del path geográfico cuando el mouse pierda el foco
    // para dar una indicación al usaurio que se dejó de seleccionar el elemento
    const mouseleave = function (event, data) {
        tooltip.style('opacity', 0).style('left', 0).style('top', 0)
        d3.select(this).style('stroke', 'black').style('opacity', 1)
    }

    // Se define una escala de colores tomand el valor mínimo y máximo de robos
    // y se define el limite inferior y superior de la escala de color
    const colorScale = d3
        .scaleLinear()
        .domain([891, 108560])
        .range(['#f7efd9', '#7a0177'])

    // Se añade un objeto 'g' para renderizar la leyenda de colores identidicado
    // con la clase .legendLinear, se define el tamaño de letra y se adiciona un
    // offset de 20 en las posiciones top y left
    mapLegend
        .append('g')
        .attr('class', 'legendLinear')
        .attr('transform', 'translate(20,20)')
        .style('font-size', '0.8em')

    // Se inicializa el objeto leyenda, formateando las cifras numéricas con separador ','
    // se configura su ancho, espaciado y orientación y se definen 10 clases de rangos 
    // para los valores de robos de vehículos, por último se reutiliza la escala de colores
    const legendLinear = d3
        .legendColor()
        .labelFormat(d3.format(',d'))
        .shapeWidth(60)
        .cells(10)
        .orient('horizontal')
        .scale(colorScale)
        .shapePadding(10)

    // Se renderiza la leyenda en el elemento con la clase .legendLinear
    mapLegend.select('.legendLinear').call(legendLinear)

    // Se seleccionan todos los elementos path del mapa y se renderizan los datos
    // Se adiciona un nuevo elemento path para renderizar cada capa geográfica
    // donde se pinta el contorno de la capa en color negro y para el relleno
    // se utiliza la escala de colores basada en el número de infracciones
    // Se adjuntan las funciones para capturar los eventos del mouse
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

    // Se añade una animación tenue para mostrar
    // el mapa al cargar la página
    map.transition()
        .duration(2000)
        .ease(d3.easeBackInOut.overshoot(0.7))
        .style('opacity', 1)

    // Se añade una animación tenue para mostrar 
    // la leyenda al cargar la página
    mapLegend
        .transition()
        .duration(2000)
        .ease(d3.easeBackInOut.overshoot(0.7))
        .style('opacity', 1)
})
