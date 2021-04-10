async function draw() {
  // Data
  const dataset = await d3.csv('data.csv')

  // Dimensions
  let dimensions = {
    width: 600,
    height: 600,
    margins: 10,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  const radius = dimensions.ctrWidth / 2

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

  // SCALES
  const populationPie = d3.pie()
    .value(d => d.value) // O valor também é usado para ordenar os registros
    .sort(null)

  const slices = populationPie(dataset)

  // console.log(slices)

  const arc = d3.arc() // Desenhar o arco
    .outerRadius(radius)
    .innerRadius(0) // Adiciona espaço no centro do círculo. Usado para gráfico de rosquinha

  const arcLabels = d3.arc()
    .outerRadius(radius)
    .innerRadius(200)

  // quantize() - Chama a mesma função repedidamente com valores diferentes e retorna uma array. Recebe uma função e a quantidade de vezes que a função deve ser chamada. Tem um argumento t que se refere a uma valor entre 0 e 1, igualmente distribuído pela quantidade de vezes que a função é chamada.
  // const colors = d3.quantize((t) => d3.interpolateSpectral(t), dataset.length)
  const colors = d3.quantize(d3.interpolateSpectral, dataset.length)

  const colorScale = d3.scaleOrdinal()
    .domain(dataset.map(element => element.name))
    .range(colors)

  // DRAW SHAPES
  const arcGroup = ctr.append('g')
    .attr(
      'transform',
      `translate(${dimensions.ctrHeight / 2}, ${dimensions.ctrWidth / 2})`
    )

  arcGroup.selectAll('path')
    .data(slices)
    .join('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.data.name))

  const labelsGroup = ctr.append('g')
    .attr(
      'transform',
      `translate(${dimensions.ctrHeight / 2}, ${dimensions.ctrWidth / 2})`
    )
    .classed('labels', true)

  labelsGroup.selectAll('text')
    .data(slices)
    .join('text')
    .attr('transform', d => `translate(${arcLabels.centroid(d)})`)
    .call(
      text => text.append('tspan')
        .style('font-weight', 'bold')
        .attr('y', -4)
        .text(d => d.data.name)
    )
    .call(
      text => text.filter(d => d.endAngle - d.startAngle > 0.25)
        .append('tspan')
        .attr('y', 9)
        .attr('x', 0)
        .text(d => d.data.value)
    )
}

draw()