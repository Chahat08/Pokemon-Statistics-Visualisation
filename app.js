// Adjusted margins for better spacing
const margin = { top: 50, right: 50, bottom: 70, left: 50 };

// Adjusted width based on the container size
const containerWidth = document.querySelector(".container").clientWidth;
const width = containerWidth - margin.left - margin.right - 20;

// Adjusted height based on the container size
const containerHeight = 500;
const height = containerHeight - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3.select("#my_dataviz")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const title = svg.append("text")
    .attr("x", width / 2)
    .attr("y", -margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "1.5em");

//Read the data
d3.csv("data/pokemon_data.csv").then(function (data) {

    // List of groups (here I have one group per column)
    const catergorical = ["generation", "is_legendary", "type1", "type2"]

    var generationCounts = d3.rollup(data, (D) => D.length, (d) => d.generation)
    var is_legendaryCounts = d3.rollup(data, (D) => D.length, (d) => d.is_legendary)
    var type1Counts = d3.rollup(data, (D) => D.length, (d) => d.type1)
    var type2Counts = d3.rollup(data, (D) => D.length, (d) => d.type2)

    const numeric = ["attack", "defense", "speed", "sp_attack", "sp_defense", "hp", "percentage_male", "capture_rate", "base_happiness", "base_total", "base_egg_steps", "weight_kg", "height_m", "Number of votes", "Rank"]

    // add the options to the button
    d3.select("#selectButtonCat")
        .selectAll('myOptions')
        .data(catergorical)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d + "Counts"; }) // corresponding value returned by the button

    // add the options to the button
    d3.select("#selectButtonNum")
        .selectAll('myOptions')
        .data(numeric)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    // TOGGLE ORIENTATION FUNCTIONALITY

    let isSideways = false;
    let isCategorical = true;

    // Add an event listener to the toggle button
    d3.select("#toggleButton").on("click", function () {
        // Toggle the orientation state
        isSideways = !isSideways;

        // Call the update function with the current selected option
        const selectedOption = isCategorical ? d3.select("#selectButtonCat").property("value") : d3.select("#selectButtonNum").property("value");
        update(selectedOption);
    });

    // A color scale: one color for each group
    const colorCategorical = d3.scaleOrdinal()
        .domain(catergorical)
        .range(d3.schemeSet2);

    const colorNumeric = d3.scaleOrdinal()
        .domain(numeric)
        .range(d3.schemeSet1);

    const TICKS = 70

    update("generationCounts")

    // A function that update the chart
    function update(selectedGroup) {
        
        if (isCategorical) {
            d3.select("#field").text(selectedGroup.slice(0, -6) + ": Categorical");
            title.text(`Bar Chart of ${isSideways ? `${selectedGroup.slice(0, -6)} vs Frequency` : `Frequency vs ${selectedGroup.slice(0, -6)}`}`);
        }
        else {
            d3.select("#field").text(selectedGroup + ": Numerical");
            title.text(`Histogram of ${isSideways ? `${selectedGroup} vs Frequency` : `Frequency vs ${selectedGroup}`}`);
        }

        // Update x-axis label to the selected group
        svg.selectAll(".x-axis-label").remove(); // Remove existing X axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.top})`)
            .style("text-anchor", "middle")
            .text(isSideways ? "Frequency" : selectedGroup)
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
            .text(isSideways ? selectedGroup : "Frequency");

        var xScale, xAxis, yScale, yAxis;

        svg.selectAll(".Xaxis, .myYaxis").remove();

        svg.selectAll("rect")
            .transition()
            .duration(1000)
            .attr("height", 0)
            .remove();

        if (isCategorical) {
            var bars = svg.selectAll("rect").data(eval(selectedGroup).entries());

            if (isSideways) {
                xScale = d3.scaleLinear()
                    .range([0, width])
                    .domain([0, d3.max(eval(selectedGroup).values())])
                xAxis = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "Xaxis")
                    .transition().duration(1000)
                    .call(d3.axisBottom(xScale))

                yScale = d3.scaleBand()
                    .range([height, 0])
                    .domain(Array.from(eval(selectedGroup).keys()).sort())
                    .padding(0.2);
                yAxis = svg.append("g")
                    .transition().duration(1000)
                    .attr("class", "myYaxis")
                    .call(d3.axisLeft(yScale))

                // Update the remaining bars
                bars.enter()
                    .append("rect")
                    .merge(bars)
                    .transition()
                    .duration(1000)
                    .attr("x", 0)
                    .attr("y", d => yScale(d[0]))
                    .attr("width", d => xScale(d[1]))
                    .attr("height", yScale.bandwidth())//d => height - yScale(d[1]))
                    .attr("fill", function (d) { return colorCategorical(selectedGroup.slice(0, -6)) });


            }
            else {


                // Add X axis 

                xScale = d3.scaleBand()
                    .range([0, width])
                    .padding(0.2);
                xAxis = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "Xaxis")

                // add yaxis

                yScale = d3.scaleLinear()
                    .range([height, 0])
                yAxis = svg.append("g")
                    .attr("class", "myYaxis")


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
                    .attr("fill", function (d) { return colorCategorical(selectedGroup.slice(0, -6)) });
            }
        }
        else {
            drawHistogram(selectedGroup, xAxis, xScale, yAxis, yScale);
            }
        }


    // When the button is changed, run the updateChart function
    d3.select("#selectButtonCat").on("change", function (event, d) {
        isCategorical = true;
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })

    // When the button is changed, run the updateChart function
    d3.select("#selectButtonNum").on("change", function (event, d) {
        isCategorical = false;
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value")
        // run the updateChart function with this selected option
        update(selectedOption)
    })


    function drawHistogram(selectedGroup) {
        console.log("drwing hist")
        var histogram = d3.scaleLinear()
        svg.selectAll(".Xaxis, .myYaxis").remove();

        if (isSideways) {
            // TODO
        } else {

            var values = data.map(function (d) {
                return d[selectedGroup]
            });

            var histogram = d3.histogram()
                .value(function (d) { return d; })
                .domain(d3.extent(values))
                .thresholds(TICKS)

            var bins = histogram(values)

            var xScale = d3.scaleLinear()
                .domain(d3.extent(values))
                .range([0, width])

            var xAxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "xAxis")

            var yScale = d3.scaleLinear()
                .domain([0, d3.max(bins, function (d) { return d.length; })])
                .range([height, 0])

            var yAxis = svg.append("g")
                .attr("class", "myYAxis")

            svg.selectAll("rect")
                .data(bins)
                .enter().append("rect")
                .attr("x", function (d) { return xScale(d.x0); })
                .attr("y", function (d) { return yScale(d.length); })
                .attr("width", function (d) { return xScale(d.x1) - xScale(d.x0) - 1; })
                .attr("height", function (d) { return height - yScale(d.length); })
                .style("fill", function (d) { return colorNumeric(selectedGroup) })

            
            xAxis.call(d3.axisBottom(xScale))

            
            yAxis.call(d3.axisLeft(yScale));

        }
        
    }

})