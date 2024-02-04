// set the dimensions and margins of the graph
//const margin = { top: 30, right: 100, bottom: 70, left: 70 }, // Adjusted margins to make room for labels
//    width = 460 - margin.left - margin.right,
//    height = 400 - margin.top - margin.bottom;

const margin = { top: 50, right: 100, bottom: 70, left: 70 }, // Adjusted margins for better spacing
    width = window.innerWidth - margin.left - margin.right - 20, // Adjusted width based on the window size
    height = 500 - margin.top - margin.bottom; // Adjusted height for better spacing

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("data/pokemon_data.csv").then(function (data) {

    // List of groups (here I have one group per column)
    const catergorical = ["generation", "is_legendary", "type1", "type2"]

    var generationCounts = d3.rollup(data, (D) => D.length, (d) => d.generation)
    var is_legendaryCounts = d3.rollup(data, (D) => D.length, (d) => d.is_legendary)
    var type1Counts = d3.rollup(data, (D) => D.length, (d) => d.type1)
    var type2Counts = d3.rollup(data, (D) => D.length, (d) => d.type2)

    // add the options to the button
    d3.select("#selectButton")
        .selectAll('myOptions')
        .data(catergorical)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d+"Counts"; }) // corresponding value returned by the button

    // A color scale: one color for each group
    const myColor = d3.scaleOrdinal()
        .domain(catergorical)
        .range(d3.schemeSet2);

    // Add X axis 

    var xScale = d3.scaleBand()
        .range([0, width])
        .padding(0.2);
    var xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")

    // add yaxis

    var yScale = d3.scaleLinear()
        .range([height, 0])
    var yAxis = svg.append("g")
        .attr("class", "myYaxis")

    update("generationCounts")

    // A function that update the chart
    function update(selectedGroup) {

        var isCategorical = false
        if (selectedGroup.endsWith("Counts")) {
            // is a categorical variable
            isCategorical = true
        }
        if (isCategorical) {
            d3.select("#field").text(selectedGroup.slice(0, -6) + ": Categorical");
        }
        else {
            d3.select("#field").text(selectedGroup + ": Numerical");
        }

        // Update x-axis label to the selected group
        svg.selectAll(".x-axis-label").remove(); // Remove existing X axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
            .style("text-anchor", "middle")
            .text(selectedGroup)
            .attr("dy", "1em");

        // Update y-axis label to "Frequency"
        svg.selectAll(".y-axis-label").remove(); // Remove existing Y axis label
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Frequency");

        xScale
            .domain(Array.from(eval(selectedGroup).keys()).sort())
        xAxis
            .transition().duration(1000)
            .call(d3.axisBottom(xScale))
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 9)
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start");

        yScale
            .domain([0, d3.max(eval(selectedGroup).values())])

        yAxis
            .transition().duration(1000)
            .call(d3.axisLeft(yScale))

        var bars = svg.selectAll("rect").data(eval(selectedGroup).entries());

        bars.exit()
            .transition()
            .duration(500)
            .attr("height", 0)
            .remove();

        // Update the remaining bars
        bars.enter()
            .append("rect")
            .merge(bars)
            .transition()
            .duration(1000)
            .attr("x", d => xScale(d[0]))
            .attr("y", d => yScale(d[1]))
            .attr("width", xScale.bandwidth())
            .attr("height", d => height - yScale(d[1]))
            .attr("fill", function (d) { return myColor(selectedGroup.slice(0, -6)) });
    }

    // When the button is changed, run the updateChart function
    d3.select("#selectButton").on("change", function (event, d) {
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })

})