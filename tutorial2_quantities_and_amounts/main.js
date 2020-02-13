d3.csv("../data/squirrelActivities.csv", d3.autoType).then(data => {
    console.log(data);
        
    const width = window.innerWidth * 0.9,
        height = window.innerHeight / 3,
        paddingInner = 0.2,
        margin = { top: 20, bottom: 40, left: 40, right: 40 };

    const xScale = d3
        .scaleLinear()
        .domain([0, d3.max(data, d => d.count)])
        .range([width - margin.left, margin.right]);

    const yScale = d3
        .scaleBand()
        .domain(data.map(d => d.activity))
        .range([height - margin.bottom, margin.top])
        .paddingInner(paddingInner);

    const yAxis = d3.axisLeft(yScale).ticks(data.length);

    const svg = d3
        .select("#d3-container")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    const rect = svg
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("y", d => yScale(d.activity))
        .attr("x", 0, d => xScale(d.count))
        .attr("width", d => width - margin.left - xScale(d.count))
        .attr("transform", `translate(130, ${height - margin.bottom, margin.top})`)
        .attr("height", yScale.bandwidth())
        .attr("fill", "steelblue")

    const text = svg
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("class", "label")
        // this allows us to position the text in the center of the bar
        .attr("x", 0, d => xScale(d.count))
        .attr("y", d => yScale(d.activity) + (yScale.bandwidth()))
        .text(d => d.count)
        .attr("dx", "160");

    svg
        .append("g")
        .attr("class", "axis")
        .attr("transform", `translate(120, ${height - margin.bottom, margin.top})`)
        .call(yAxis);
});