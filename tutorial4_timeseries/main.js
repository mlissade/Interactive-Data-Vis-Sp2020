/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5,
  default_selection = "Select a Region";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;
let xAxis;
let yAxis;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: null, // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("../data/avocado.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data
    .sort((a, b) => d3
      .ascending(a.Date, b.Date));
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.Date))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain([0, d3.max(state.data, d => d.AveragePrice)])
    .range([height - margin.bottom, margin.top])
    console.log("yScale", yScale.domain());

  // + AXES
  const xAxis = d3.axisBottom(xScale);
  yAxis = d3.axisLeft(yScale);
  // + UI ELEMENT SETUP
  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    state.selection = this.value; // + UPDATE STATE WITH YOUR SELECTED VALUE
    console.log("new value is", this.value);
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data([
      default_selection,
      ...Array.from(new Set(state.data.map(d => d.region))),
    ]) // + ADD DATA VALUES FOR DROPDOWN
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + SET SELECT ELEMENT'S DEFAULT VALUE (optional)
  selectElement.property("value", default_selection);
  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);
  // + CALL AXES
  svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Date");

  svg
    .append("g")
    .attr("class", "axis y-axis")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("y", "50%")
    .attr("dx", "-3em")
    .attr("writing-mode", "vertical-rl")
    .text("Price");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
// we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData = [];
  if (state.selection !== null) {
    filteredData = state.data.filter(d => d.region === state.selection);
  }
  //
  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(filteredData, d => d.AveragePrice)]);
  // + UPDATE AXIS/AXES, if needed
  d3.select("g.y-axis")
    .transition()
    .duration(1000)
    .call(yAxis.scale(yScale));

  const lineFunc = d3
    .line()
    .x(d => xScale(d.Date))
    .y(d => yScale(d.AveragePrice));

  // + DRAW CIRCLES, if you decide to
  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.Id)
    .join(
      enter => 
        enter
          .append("circle")
          .attr("class", "dot")
          .attr("r", radius)
          .attr("cy", height - margin.bottom)
          .attr("cx", d => xScale(d.Date)), // + HANDLE ENTER SELECTION
      update => update, // + HANDLE UPDATE SELECTION
      exit => 
        exit.call(exit =>
          exit
            .transition()
            .delay(d => d.Date)
            .duration(500)
            .attr("cy", height - margin.bottom)
             // + HANDLE EXIT SELECTION
        )
        .remove()
    )
    .call(
      selection =>
        selection
          .transition()
          .duration(1000)
          .attr("cy", d => yScale(d.AveragePrice))
    );
  // + DRAW LINE AND AREA
    const line = svg
    .selectAll("path.trend")
    .data([filteredData])
    .join(
      enter =>
        enter
          .append("path")
          .attr("class", "trend")
          .attr("opacity", 0), // start them off as opacity 0 and fade them in
      update => update, // pass through the update selection
      exit => exit.remove()
    )
    .call(selection =>
      selection
        .transition() // sets the transition on the 'Enter' + 'Update' selections together.
        .duration(1000)
        .attr("opacity", 1)
        .attr("d", d => lineFunc(d))
    );
}
