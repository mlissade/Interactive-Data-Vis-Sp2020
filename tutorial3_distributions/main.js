/* CONSTANTS AND GLOBALS */
const width = window.innerWidth * 0.7,
  height = window.innerHeight * 0.7,
  margin = { top: 20, bottom: 50, left: 60, right: 40 },
  radius = 5;

// these variables allow us to access anything we manipulate in init() but need access to in draw().
// All these variables are empty before we assign something to them.
let svg;
let xScale;
let yScale;

/* APPLICATION STATE */
let state = {
  data: [],
  selection: "All", // + YOUR FILTER SELECTION
};

/* LOAD DATA */  
// + SET YOUR DATA PATH
d3.csv("../data/iris.csv", d3.autoType).then(raw_data => {
  console.log("raw_data", raw_data);
  state.data = raw_data;
  init();
});

/* INITIALIZING FUNCTION */
// this will be run *one time* when the data finishes loading in 
function init() {
  // + SCALES
  xScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.sepal_length_cm))
    .range([margin.left, width - margin.right]);

  yScale = d3
    .scaleLinear()
    .domain(d3.extent(state.data, d => d.sepal_width_cm))
    .range([height - margin.bottom, margin.top]);
  
    // + AXES
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  // + UI ELEMENT SETUP

  const selectElement = d3.select("#dropdown").on("change", function() {
    // `this` === the selectElement
    // 'this.value' holds the dropdown value a user just selected
    console.log("new selected species is", this.value)
    state.selection = this.value;
    draw(); // re-draw the graph based on this new selection
  });

  // add in dropdown options from the unique values in the data
  selectElement
    .selectAll("option")
    .data(["All", "Iris-setosa", "Iris-versicolor", "Iris-virginica"]) // + ADD UNIQUE VALUES
    .join("option")
    .attr("value", d => d)
    .text(d => d);

  // + CREATE SVG ELEMENT
  svg = d3
    .select("#d3-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

   // add the xAxis
   svg
    .append("g")
    .attr("class", "axis x-axis")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("class", "axis-label")
    .attr("x", "50%")
    .attr("dy", "3em")
    .text("Sepal Length");

 // add the yAxis
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
    .text("Sepal Width");

  draw(); // calls the draw function
}

/* DRAW FUNCTION */
 // we call this everytime there is an update to the data/state
function draw() {
  // + FILTER DATA BASED ON STATE
  let filteredData = state.data;
  if (state.selection !== "All") {
    filteredData = state.data.filter(d => d.species === state.selection);
  }


  const dot = svg
    .selectAll(".dot")
    .data(filteredData, d => d.id)
    .join(
      enter => 
        enter // + HANDLE ENTER SELECTION
          .append("circle")
          .attr("class", "dot") // Note: this is important so we can identify it in future updates
          .attr("stroke", "lightgrey")
          .attr("opacity", 0.7)
          .attr("fill", d => {
            if (d.species === "Iris-setosa") return "blue";
            else if (d.species === "Iris-versicolor") return "magenta";
            else return "lime";
          })
          .attr("r", radius)
          .attr("cx", d => margin.left)
          .attr("cy", d => [height - margin.bottom]) // initial value - to be transitioned
          .call(enter =>
            enter
              .transition() // initialize transition
              .delay(d => 500 * d.sepal_width_cm) // delay on each element
              .duration(200)
              .attr("cy", d => yScale(d.sepal_width_cm))
              .attr("cx", d => xScale(d.sepal_length_cm))
          ),
      update => 
        update.call(update =>
        // + HANDLE UPDATE SELECTION
          update
            .transition()
            .duration(200)
            .attr("stroke", "black")
            .transition()
            .duration(200)
            .attr("stroke", "lightgrey")
        ),
      exit => 
        exit.call(exit =>
        // + HANDLE EXIT SELECTION
          exit
            .transition()
            .delay(d => 500 * d.sepal_width_cm)
            .duration(200)
            .attr("cy", margin.top)
            .attr("cx", width)
            .remove()
        )
     );
}
