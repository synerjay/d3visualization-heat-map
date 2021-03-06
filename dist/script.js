const container = document.getElementById("container");
const tooltip = document.createElement("div");
tooltip.setAttribute("id", "tooltip");
container.appendChild(tooltip);


fetch("https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json").
then(response => response.json()).
then(response => {
  const { monthlyVariance } = response;

  makeHeatMap(monthlyVariance);
});



function makeHeatMap(data) {
  const baseTemp = 8.66;
  const dataTemp = data.map(obj => {
    let rObj = {};
    rObj["month"] = obj.month;
    rObj["year"] = obj.year;
    rObj["variance"] = obj.variance;
    rObj["temperature"] = Math.round((baseTemp + obj.variance) * 10) / 10;
    return rObj;
  }); // data with actual Temperature added


  const h = 500;
  const w = 1300;
  const padding = 100;
  const barWidth = Math.ceil((w - 2 * padding) / dataTemp.length) + 3;
  const barHeight = Math.ceil((h - 2 * padding) / 12);

  const colors = ["rgb(69, 117, 180)", "rgb(171, 217, 233)", "rgb(255, 255, 191)", "rgb(253, 174, 97)", "rgb(215, 48, 39)"];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  console.log(dataTemp[0]);
  let minYear = dataTemp[0].year;
  let maxYear = dataTemp[dataTemp.length - 1].year;
  let minVar = d3.min(dataTemp, d => d.variance);
  let maxVar = d3.max(dataTemp, d => d.variance);



  //X-scale 
  const xScale = d3.scaleTime().domain([new Date(minYear, 0), new Date(maxYear, 0)]).range([padding, w - padding]);

  //Y-scale
  const yScale = d3.scaleBand().domain(months).range([padding, h - padding]);

  //color scale
  const colorScale = d3.scaleQuantile().
  domain([minVar, maxVar]).
  range(colors);


  const svg = d3.
  select("#container").
  append("svg").
  style("width", w).
  style("height", h);


  svg.
  selectAll("rect").
  data(dataTemp).
  enter().
  append("rect").
  attr('class', 'cell').
  attr("data-month", d => d.month - 1).
  attr("data-year", d => d.year).
  attr("data-temp", d => d.temperature).
  attr("fill", (d, i) => colorScale(d.variance)).
  attr('x', (d, i) => xScale(new Date(d.year, 0))).
  attr("y", (d, i) => yScale(months[d.month - 1])).
  attr("width", barWidth).
  attr("height", barHeight).
  on('mouseover', (d, i) => {
    tooltip.style.visibility = "visible";
    tooltip.setAttribute('data-year', i.year);
    tooltip.style.transform = `translate(${xScale(new Date(i.year, 0)) + 10}px, ${yScale(months[i.month - 1])}px )`;

    let info = [
    `${months[i.month - 1]} - ${i.year}`,
    `${i.temperature}`,
    `${i.variance}`];
    tooltip.innerHTML = `<center><p class="tooltipinfo">${info.join("<br>")}</p></center>`;
  }).on('mouseout', () => {
    tooltip.style.visibility = "hidden";
  });


  const xAxis = d3.axisBottom(xScale).tickFormat(d3.scaleTime().tickFormat(10, "%Y"));


  const yAxis = d3.axisLeft(yScale);

  svg.
  append("g").
  attr("transform", `translate(0, ${h - padding})`).
  attr("id", "x-axis").
  call(xAxis);



  svg.append('g').
  attr('id', 'y-axis').
  attr('transform', `translate(${padding}, 0)`).
  call(yAxis);





  var legend = svg.selectAll('.legend').
  data([0].concat(colorScale.quantiles()), function (d) {return d;}).
  enter().
  append('g').
  attr('id', 'legend').
  attr('transform', function (d, i) {return 'translate(' + (w - 80) + ',' + (100 + i * 20) + ')';});

  legend.append('rect').
  attr('width', 20).
  attr('height', 20).
  style('fill', colorScale);

  legend.append('text').
  text(function (d, i) {return d.toFixed(2);}).
  attr('x', 30).
  attr('y', 15);



}