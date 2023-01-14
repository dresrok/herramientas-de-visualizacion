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
    // y se cambia la opacidad del path geográfico mientras el mouse esté encima
    // para dar una indicación al usuario que esta siendo seleccionado el elemento
    const mouseover = function (event, data) {
        tooltip.style('opacity', 1)
        d3.select(this).style('opacity', 0.5).style('cursor', 'pointer')
    }
    // Se define una función flecha para capturar el evento 'mousemove' del mouse
    // donde se renderiza el contenido del tooltip basado en la información geográfica
    // seleccionada, mostrando la comunidad y el número de infracciones, también se añade
    // un offset en la posición top y left del tooltip para mejorar su visualización
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

    // Se define una escala de colores tomando el valor mínimo y máximo de robos
    // y se define el limite inferior y superior de la escala de color
    const colorScale = d3
        .scaleLinear()
        .domain([891, 108560])
        .range(['#f7efd9', '#7a0177'])

    // Se añade un objeto 'g' para renderizar la leyenda de colores identificado
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


// ------------- BAR CHART -------------

// variables para la definición de el tamaño del gráfico (incluye variables para proporción de las márgenes)
var margin = {top: 10, right: 30, bottom: 90, left: 40},
    width = 460 - margin.left - margin.right,
    height = 450 - margin.top - margin.bottom;

// Creación del objeto svg que se agregará al div bar-chart y se definen las margenes
var svg = d3.select("#bar-chart")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

// Carga de datos de JSON de crifras de crímenes y creación de las escalas y barras con la información obtenida
// Nota: Los datos se cargarán desde un archivo de JSON descargado y almacenado en la carpeta del proyecto.
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

     // Definición del eje X
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

    // Definición del eje Y
    var y = d3.scaleLinear()
        .domain([0, 13000])
        .range([ height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // Barras del gráfico
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

    // Definición de la animación con una duración de 800 ms para la visualización de las barras
    svg.selectAll("rect")
        .transition()
        .duration(800)
        .attr("y", function(d) { return y(d.value); })
        .attr("height", function(d) { return height - y(d.value); })
        .delay(function(d, i){ return(i*1000) });
});