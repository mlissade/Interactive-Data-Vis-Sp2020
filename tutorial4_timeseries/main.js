/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5
  default_selection = "Select a Region";

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: null, // + YOUR FILTER SELECTION
};

/* LOAD DATA */
// + SET YOUR DATA PATH
d3.csv("../data/avocado.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in
function init() {
  // + SCALES
  xScale = d3
    .scaleTime()
    .domain(d3.extent(state.data, d => d.year))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(0, d3.max(state.data, d => d.AveragePrice))
    .range([height - margin.bottom, margin.top]);
  // + AXES

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
      ...Array.from(new Set(state.data.map(d => d.region))),
      default_selection,
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
    .text("Year");

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
  let filteredData;
  if (state.selection !== null) {
    filteredData = state.data.filter(d => d.region === state.selection);
  }
  //
  // + UPDATE SCALE(S), if needed
  yScale.domain([0, d3.max(filteredData, d => d.AveragePrice)]);
  // + UPDATE AXIS/AXES, if needed
  const lineFunc = d3
    .line()
    .x(d => xScale(d.year))
  // + DRAW CIRCLES, if you decide to
  // const dot = svg
  //   .selectAll("circle")
  //   .data(filteredData, d => d.name)
  //   .join(
  //     enter => enter, // + HANDLE ENTER SELECTION
  //     update => update, // + HANDLE UPDATE SELECTION
  //     exit => exit // + HANDLE EXIT SELECTION
  //   );
  //
  // + DRAW LINE AND AREA
}
