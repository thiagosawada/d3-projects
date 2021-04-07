async function draw() {
  // Data
  const dataset = await d3.json('data.json')

  const xAccessor = (d) => d.currently.humidity
  const yAccessor = (d) => d.currently.apparentTemperature

  // Dimensions
  let dimensions = {
    width: 800,
    height: 800,
    margin: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50
    }
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom

  // Draw image
  const svg = d3.select('#chart')
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height)

  const ctr = svg.append('g')
    .attr(
      'transform',
      `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
    )

  const tooltip = d3.select("#tooltip")

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .rangeRound([0, dimensions.ctrWidth]) // Arredondar valores do range
    .clamp(true) // Não retorna valores fora do range

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .rangeRound([dimensions.ctrHeight, 0])
    .nice() // Arredondar números decimais do domain
    .clamp(true)

  // Draw circles
  ctr.selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .attr('r', 5)
    .attr('fill', 'red')

  // Axis
  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickFormat(d => d * 100 + '%')
    // .tickValues([0.4, 0.5, 0.8])

  const xAxisGroup = ctr.append('g')
    .call(xAxis)
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .classed('axis', true)

  xAxisGroup.append('text')
    .text('Humidity')
    .attr('fill', 'black')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margin.bottom - 10)

  const yAxis = d3.axisLeft(yScale)

  const yAxisGroup = ctr.append('g')
    .call(yAxis)
    .classed('axis', true)

  yAxisGroup.append('text')
    .html("Temperature &deg; F")
    .attr('fill', 'black')
    .attr('x', -dimensions.ctrHeight / 2)
    .attr('y', -dimensions.margin.left + 15)
    .style('transform', 'rotate(270deg)')
    .style('text-anchor', 'middle')

  const delaunay = d3.Delaunay.from(
    dataset,
    d => xScale(xAccessor(d)),
    d => yScale(yAccessor(d))
  ) // Retorna um objeto com as coordenadas para o desenho do diagrama de Voronoi
  // console.log(delaunay)

  const voronoi = delaunay.voronoi() // Retorna métodos para desenhar o diagrama
  voronoi.xmax = dimensions.ctrWidth
  voronoi.ymax = dimensions.ctrHeight
  // console.log(voronoi)

  ctr.append('g')
    .selectAll('path')
    .data(dataset)
    .join('path')
    // .attr('stroke', 'black')
    .attr('fill', 'transparent')
    .attr('d', (_,i) => voronoi.renderCell(i))
    .on('mouseenter', (_, datum) => {
      ctr.append('circle')
        .classed('dot-hovered', true)
        .attr('fill', '#120078')
        .attr('r', 8)
        .attr('cx', () => xScale(xAccessor(datum)))
        .attr('cy', () => yScale(yAccessor(datum)))
        .style('pointer-events', 'none')

      const formatter = d3.format('.2f')
      const dateFormatter = d3.timeFormat('%B %-d, %Y')

      tooltip.style('display', 'block')
        .style('top', `${yScale(yAccessor(datum)) - 40}px`)
        .style('left', `${xScale(xAccessor(datum))}px`)

      tooltip.select('.metric-humidity span')
        .text(formatter(xAccessor(datum)))

      tooltip.select('.metric-temp span')
        .text(formatter(yAccessor(datum)))

      tooltip.select('.metric-date')
        .text(dateFormatter(datum.currently.time * 1000))
    })
    .on('mouseleave', () => {
      ctr.select('.dot-hovered').remove()
      tooltip.style('display', 'none')
    })
}

draw()