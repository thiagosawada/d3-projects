// const pBrowser = document.querySelector('p');
// const body = d3.select('body');

// console.log(pBrowser);
// console.log(pD3);

// const data = [10, 20, 30, 40, 50, 60, 70]

// const el = d3.select('ul')
//   .selectAll('li')
//   .data(data)
//   .join(
//     enter => {
//       return enter.append('li').style('color', "yellowgreen")
//     },
//     update => update.style('color', "hotpink"),
//     exit => exit.remove()
//   )
//   .text(d => d)

async function getData() {
  // const data = await d3.json('data.json')
  const data = await d3.csv('data.csv')
  console.log(data)
}

getData()