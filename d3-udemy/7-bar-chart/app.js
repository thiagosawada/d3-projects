async function draw() {
  // Data
  const dataset = await d3.csv('data.csv', (d, _, columns) => {
    d3.autoType(d) // Detecta o tipo de dado apropriado automaticamente
    d.total = d3.sum(columns, c => d[c])

    return d
  })

  dataset.sort((a, b) => b.total - a.total)

  // Dimensions
  let dimensions = {
    width: 1000,
    height: 600,
    margins: 20,
  };

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2

  // Draw Image
  const svg = d3.select('#chart')
    .append("svg")
    // .attr("width", dimensions.width)
    // .attr("height", dimensions.height)
    .attr("viewBox", `0 0 ${dimensions.width} ${dimensions.height}`) // Responsível

  const ctr = svg.append("g")
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  // Scales
  const stackGenerator = d3.stack() // Agrupa os registros pelo intervalo de idades
    .keys(dataset.columns.slice(1)) // Retorna array com o nome das colunas, excluindo a primeira

  const stackData = stackGenerator(dataset).map(ageGroup => {
    ageGroup.forEach(state => {
      state.key = ageGroup.key
    })
    return ageGroup
  })
  // Ver o segundo elemento do array agrupado
  // console.log(stackData)

  const yScale = d3.scaleLinear()
    .domain([
      0, d3.max(stackData, ag => {
        return d3.max(ag, state => state[1])
      })
    ])
    .rangeRound([dimensions.ctrHeight, dimensions.margins])

  const xScale = d3.scaleBand()
    .domain(dataset.map(state => state.name))
    .range([dimensions.margins, dimensions.ctrWidth])
    // .paddingInner(0.1) // Aceita valores entre 0 e 1
    // .paddingOuter(0.1) // O valor equivale a 0.1 * bandwidth ou 10% do bandwidth
    .padding(0.1) // paddingInner + paddingOuter

  const colorScale = d3.scaleOrdinal()
    .domain(stackData.map(d => d.key))
    .range(d3.schemeSpectral[stackData.length])
    .unknown('#ccc') // Fallback color

  // DRAW BARS
  const ageGroups = ctr.append('g')
    .classed('age-groups', true)
    .selectAll('g')
    .data(stackData)
    .join('g')
    .attr('fill', d => colorScale(d.key))

  ageGroups.selectAll('rect')
    .data(d => d)
    .join('rect')
    .attr('x', d => xScale(d.data.name))
    .attr('y', d => yScale(d[1]))
    .attr('width', xScale.bandwidth())
    .attr('height', d => yScale(d[0]) - yScale(d[1]))

  // AXIS
  const xAxis = d3.axisBottom(xScale)
    .tickSizeOuter(0) // Configura o tamanho das marcações do começo e do final do eixo

  const yAxis = d3.axisLeft(yScale)
    .ticks(null, 's') // 's' Notação M para milhão

  ctr.append('g')
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .call(xAxis)

  ctr.append('g')
    .style('transform', `translateX(${dimensions.margins}px)`)
    .call(yAxis)
}

draw()