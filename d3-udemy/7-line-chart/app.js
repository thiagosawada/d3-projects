async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  const parseDate = d3.timeParse('%Y-%m-%d')
  const xAccessor = d => parseDate(d.date)
  const yAccessor = d => parseFloat(d.close)

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 500,
    margins: 50,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g") // <g>
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  const tooltip = d3.select('#tooltip')

  const tooltipDot = ctr.append('circle')
    .attr('r', 5)
    .attr('fill', '#fc8781')
    .attr('stroke', 'black')
    .attr('stroke-width', 2)
    .style('opacity', 0)
    .style('pointer-events', 'none') // O ponto não vai cancelar o evento se o cursor passar por cima

  // Scales
  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .range([dimensions.ctrHeight, 0])
    .nice()

  const xScale = d3.scaleUtc() // ou scaleTime()
    .domain(d3.extent(dataset, xAccessor))
    .range([0, dimensions.ctrWidth])

  // console.log(xScale(xAccessor(dataset[0])), dataset[0])

  const lineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))

  // console.log(lineGenerator(dataset))

  // Chart
  ctr.append('path')
    .datum(dataset) // datum porque vai retornar apenas um elemento path
    .attr('d', lineGenerator)
    .attr('fill', 'none')
    .attr('stroke', '#30475e')
    .attr('stroke-width', 2)

  // Axis
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(d => `$${d}`)

  ctr.append('g').call(yAxis)

  const xAxis = d3.axisBottom(xScale)

  ctr.append('g')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .call(xAxis)

  // Tooltip
  ctr.append('rect')
    .attr('width', dimensions.ctrWidth)
    .attr('height', dimensions.ctrHeight)
    .style('opacity', 0)
    .on('touchmouse mousemove', function(event) {
      const mousePos = d3.pointer(event, this) // Retorna as coordenadas da posição do cursor em relação ao container
      // console.log(mousePos)
      const date = xScale.invert(mousePos[0]) // Neste caso, recebe uma coordenada e retorna uma data
      // console.log(date)
      // CUSTOM BISECTOR - left, center, right
      const bisector = d3.bisector(xAccessor).left
      const index = bisector(dataset, date)
      // Como o bisector retorna o index onde o dado seria inserido no array, é necessário subtrair um para pegar o elemento a que a data se refere
      const stock = dataset[index - 1]
      // console.log(stock)
      // UPDATE IMAGE
      tooltipDot.style('opacity', 1)
        .attr('cx', xScale(xAccessor(stock))) // Não usa arrow function porque não existe dado associado ao ponto
        .attr('cy', yScale(yAccessor(stock)))
        .raise()

      tooltip.style('display', 'block')
        .style('left', `${xScale(xAccessor(stock))}px`)
        .style('top', `${yScale(yAccessor(stock)) - 20}px`)

      const dateFormatter = d3.timeFormat('%B %-d, %Y')

      tooltip.select('.date').text(dateFormatter(xAccessor(stock)))

      tooltip.select('.price').text(`$${yAccessor(stock)}`)
    })
    .on('mouseleave', function(event) {
      tooltipDot.style('opacity', 0)
      tooltip.style('display', 'none')
    })

}

draw()