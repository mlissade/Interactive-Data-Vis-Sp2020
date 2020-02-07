d3.csv("../data/breast-cancer.data").then(data => {
    console.log("data", data);

    const table = d3.select("table");
    
    const thead = table.append("thead");
    thead
        .append("tr")
        .append("th")
        .attr("colspan", "10")
        .text("Breast Cancer Data");

    thead
        .append("tr")
        .selectAll("th")
        .data(data.columns)
        .join("td")
        .text(d => d);

    const rows = table
    .append("tbody")
    .selectAll("tr")
    .data(data)
    .join("tr");

  rows
    .selectAll("td")
    .data(d => Object.values(d))
    .join("td")
    
    // update the below logic to apply to your dataset
    .attr("class", d => +d > 3 ? 'high' : null)
    .text(d => d);
   
});