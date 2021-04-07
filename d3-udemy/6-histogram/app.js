async function draw() {
  // Data
  const dataset = await d3.json('data.json')

  // Dimensions
  let dimensions = {
    width: 800,
    height: 400,
    margins: 50
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g")
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  const labelsGroup = ctr.append('g')
    .classed('bar-labels', true)

  const xAxisGroup = ctr.append('g')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)

  const meanLine = ctr.append('line')
    .classed('mean-line', true)

  function histogram(metric) {
    const xAccessor = d => d.currently[metric]
    const yAccessor = d => d.length

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(dataset, xAccessor))
      .rangeRound([0, dimensions.ctrWidth])
      .nice()

    const bin = d3.bin()
      .domain(xScale.domain())
      .value(xAccessor) // Propriedade usada para agrupamento
      .thresholds(10) // Número de agrupamentos

    const newDataset = bin(dataset)

    const padding = 1

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(newDataset, yAccessor)])
      .rangeRound([dimensions.ctrHeight, 0])
      .nice()

    const exitTransition = d3.transition().duration(500)
    const updateTransition = exitTransition.transition().duration(500)

    // Bars
    ctr.selectAll('rect')
      .data(newDataset)
      .join(
        (enter) => {
          return enter.append('rect')
            .attr('width', d => xScale(d.x1) - xScale(d.x0) - padding)
            .attr('height', 0) // Barra começa com altura zero
            .attr('x', d => xScale(d.x0))
            .attr('y', dimensions.ctrHeight)
            .attr('fill', '#b8de6f')
        },
        (update) => update,
        (exit) => {
          return exit.attr('fill', '#f39233')
            .transition(exitTransition)
            .attr('height', 0)
            .attr('y', dimensions.ctrHeight)
            .remove()
        }
      )
      .transition(updateTransition)
      .attr('width', d => xScale(d.x1) - xScale(d.x0) - padding)
      .attr('height', d => dimensions.ctrHeight - yScale(yAccessor(d)))
      .attr('x', d => xScale(d.x0))
      .attr('y', d => yScale(yAccessor(d)))
      .attr('fill', '#01c5c4')

    labelsGroup.selectAll('text')
      .data(newDataset)
      .join(
        (enter) => {
          return enter.append('text')
            .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
            .attr('y', dimensions.ctrHeight)
            .text(yAccessor)
        },
        (update) => update,
        (exit) => {
          return exit.transition(exitTransition)
            .attr('y', dimensions.ctrHeight)
            .remove()
        }
      )
      .transition(updateTransition)
      .attr('x', d => xScale(d.x0) + (xScale(d.x1) - xScale(d.x0)) / 2)
      .attr('y', d => yScale(yAccessor(d)) - 10)
      .text(yAccessor)

    const mean = d3.mean(dataset, xAccessor)
    const xMean = xScale(mean)

    meanLine.raise() // Reinsere um elemento para que ele fique na frente
      .transition(updateTransition)
      .attr('x1', xMean)
      .attr('y1', 0)
      .attr('x2', xMean)
      .attr('y2', dimensions.ctrHeight)

    // Axis
    const xAxis = d3.axisBottom(xScale)

    xAxisGroup.transition(updateTransition)
      .call(xAxis)
  }

  d3.select('#metric')
    .on('change', function(e) {
      e.preventDefault()
      histogram(this.value)
    })

  histogram('humidity')
}

draw()