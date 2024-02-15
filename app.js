// Adjusted margins for better spacing
const margin = { top: 50, right: 50, bottom: 70, left: 70 };

// Adjusted width based on the container size
const containerWidth = document.querySelector("#my_dataviz").clientWidth;
const width = containerWidth - margin.left - margin.right;

// Adjusted height based on the container size
const containerHeight = document.querySelector("#my_dataviz").clientHeight;
const height = containerHeight - margin.top - margin.bottom;
//const height = 220

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
    const catergorical = ["Generation", "Is Legendary?", "Primary Type", "Secondary Type"]

    var generationCounts = d3.rollup(data, (D) => D.length, (d) => d['Generation'])
    var is_legendaryCounts = d3.rollup(data, (D) => D.length, (d) => d['Is Legendary?'])
    var type1Counts = d3.rollup(data, (D) => D.length, (d) => d['Primary Type'])
    var type2Counts = d3.rollup(data, (D) => D.length, (d) => d['Secondary Type'])

    const numeric = ["Attack", "Defense", "Speed", "Special Attack", "Special Defense", "HP", "Percentage Male", "Capture Rate", "Base Happiness", "Base Total", "Base Egg Steps", "Weight in Kilograms", "Height in Meters", "Number of votes", "Rank"]


    const allFields = catergorical.concat(numeric)
   
    // add the options to the button
    d3.select("#selectButtonField")
        .selectAll('myOptions')
        .data(allFields)
        .enter()
        .append('option')
        .text(function (d) { return d; }) // text showed in the menu
        .attr("value", function (d) { return d; }) // corresponding value returned by the button

    let isSideways = false;
    let isCategorical = true;
    let isScatter = false;
    let scatterX = "generation"
    let scatterY= "generation"

    // When the button is changed, run the updateChart function
    d3.select("#selectButtonScatter").on("change", function (event, d) {
        isCategorical = false;
        isScatter = true;
        // recover the option that has been chosen
        const selectedOption = d3.select(this).property("value");

        // Check which radio button is selected
        const xAxisRadio = document.querySelector('input[name="axis"][value="X"]');

        if (xAxisRadio.checked) {
            scatterX = selectedOption;
        } else {
            scatterY = selectedOption;
        }

        // run the updateChart function with this selected option
        update(selectedOption);
    });

    d3.select("#scatterPlotDropdownButton").on("click", function (event, d) {
        isCategorical = false;
        isScatter = true;
        // recover the option that has been chosen
        const selectedOption = d3.select("#selectButtonScatter").property("value");

        // Check which radio button is selected
        scatterX = selectedOption;
        scatterY = selectedOption;

        // run the updateChart function with this selected option
        update(selectedOption);
    })

    // Add event listeners to the radio buttons
    d3.selectAll('input[name="axis"]').on("change", function () {
        const selectedOption = d3.select("#selectButtonScatter").property("value");

        if (this.value === "X") {
            scatterX = selectedOption;
        } else {
            scatterY = selectedOption;
        }

        // run the updateChart function with the selected option
        update(selectedOption);
    });

    var TICKS = 20

    // Listen to the button -> update if user change it
    d3.select("#nBin").on("input", function () {
        TICKS = +this.value
        isCategorical = false;
        update(d3.select("#selectButtonNum").property("value"))
    });


    // TOGGLE SCATTER PLOT FUNCTIONALITY
    d3.select('#togglePlotType').on("change", function () {
        isScatter = !isScatter;

        const selectedOption = d3.select("#selectButtonField").property("value");
        update(selectedOption);
    })

    // TOGGLE ORIENTATION FUNCTIONALITY

    // Add an event listener to the toggle button
    d3.select("#toggleOrientation").on("change", function () {
        // Toggle the orientation state
        isSideways = !isSideways;

        if (isScatter) {
            [scatterX, scatterY] = [scatterY, scatterX];
        }

        // Call the update function with the current selected option
        const selectedOption = d3.select("#selectButtonField").property("value");
        update(selectedOption);
    })

    // A color scale: one color for each group
    const colorCategorical = d3.scaleOrdinal()
        .domain(catergorical)
        .range(d3.schemeSet2);

    const colorNumeric = d3.scaleOrdinal()
        .domain(numeric)
        .range(d3.schemeSet1);

    const colorScatter = d3.scaleOrdinal()
        .domain(allFields)
        .range(d3.schemeDark2);


    update("generationCounts")

    // A function that update the chart
    function update(selectedGroup) {

        //svg.select("*").remove()

        if (numeric.includes(selectedGroup))
            isCategorical = false;
        else isCategorical = true;

        addAxesLabels(selectedGroup) // add the axes labels
        svg.selectAll(".xAxis, .yAxis").remove(); // remove the axes values
        
        svg.selectAll("rect") // remove the bars of the bar plot and ths hist
            .transition()
            .duration(500)
            .attr("height", 0)
            .remove();

        svg.selectAll("circle")
            .transition()
            .duration(500)
            .attr("r", 0.0)
            .remove();

        if (isScatter) {
            document.getElementById('xAxisLabel').innerHTML = "X-axis Field: "+scatterX;
            document.getElementById('yAxisLabel').innerHTML = "Y-axis Field: "+scatterY;
            drawScatterPlot()
        }
        else {
            if (isCategorical) {
                drawBarPlot(selectedGroup)
            }
            else {
                drawHistogram(selectedGroup)
            }
        }
    }

    function drawScatterPlot() {
        title.text(`Scatterplot of ${scatterX} (x-axis) vs ${scatterY} (y-axis)`);

        // Determine the extent of values for both x and y axes
        var xExtent = d3.extent(data, function (d) { return parseFloat(d[scatterX]); });
        var yExtent = d3.extent(data, function (d) { return parseFloat(d[scatterY]); });

        // Find the minimum value for x and y
        var xMin = Math.min(0, xExtent[0]);
        var yMin = Math.min(0, yExtent[0]);

        // Determine the maximum values for x and y
        var xMax = xExtent[1];
        var yMax = yExtent[1];

        // Add X axis
        var xScale;
        if (numeric.includes(scatterX)) {
            xScale = d3.scaleLinear()
                .domain([xMin, xMax])
                .range([0, width]);
        } else if (catergorical.includes(scatterX)) {
            xScale = d3.scaleBand()
                .domain(data.map(function (d) { return d[scatterX]; }))
                .range([0, width])
                .padding(0.1);
        }

        // Add Y axis
        var yScale;
        if (numeric.includes(scatterY)) {
            yScale = d3.scaleLinear()
                .domain([yMin, yMax])
                .range([height, 0]);
        } else if (catergorical.includes(scatterY)) {
            yScale = d3.scaleBand()
                .domain(data.map(function (d) { return d[scatterY]; }))
                .range([height, 0])
                .padding(0.1);
        }

        // Adjust the transform of the Y axis to move it to the leftmost position
        svg.append("g")
            .attr("class", "yAxis")
            .call(d3.axisLeft(yScale));

        // Adjust the transform of the X axis to move it to the bottom position
        svg.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + height + ")") // Translate the x axis to the bottom position
            .call(d3.axisBottom(xScale));

        // Use the update selection
        var dots = svg.selectAll(".dots")
            .data(data);

        // Remove any dots that are not needed
        dots.exit().remove();

        // Add dots
        svg.append('g')
            .selectAll("dot")
            .data(data)
            .enter()
            .append("circle")
            .attr("class", "dots")
            .merge(dots)
            .transition().duration(1000)
            .attr("cx", function (d) {
                if (numeric.includes(scatterX)) {
                    return xScale(parseFloat(d[scatterX])) + Math.random() * 10; // Add random jittering to x-coordinates
                } else if (catergorical.includes(scatterX)) {
                    return xScale(d[scatterX]) + xScale.bandwidth() / 2 + Math.random() * 10;
                }
            })
            .attr("cy", function (d) {
                if (numeric.includes(scatterY)) {
                    return yScale(parseFloat(d[scatterY])) + Math.random() * 10; // Add random jittering to y-coordinates
                } else if (catergorical.includes(scatterY)) {
                    return yScale(d[scatterY]) + yScale.bandwidth() / 2 + Math.random() * 10;
                }
            })
            .attr("r", 2.0)
            .attr("fill", function (d) { return colorScatter(scatterX); });    
    }

    function drawBarPlot(selectedGroup) {
        // update the title of the graph to show that it is a bar plot
        title.text(`Bar Chart of ${!isSideways ? `${selectedGroup} (x-axis) vs Frequency (y-axis)` : `Frequency (x-axis) vs ${selectedGroup}(y-axis)`}`);

        if (selectedGroup.indexOf("Legendary") !== -1) selectedGroup = "is_legendaryCounts";
        else if (selectedGroup.indexOf("Generation") !== -1) selectedGroup = "generationCounts";
        else if (selectedGroup.indexOf("Primary") !== -1) selectedGroup = "type1Counts";
        else selectedGroup = "type2Counts";

        var bars = svg.selectAll("rect").data(eval(selectedGroup).entries());

        if (isSideways) {
            xScale = d3.scaleLinear()
                .range([0, width])
                .domain([0, d3.max(eval(selectedGroup).values())])
            xAxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "xAxis")
                .transition().duration(1000)
                .call(d3.axisBottom(xScale))

            yScale = d3.scaleBand()
                .range([height, 0])
                .domain(Array.from(eval(selectedGroup).keys()).sort())
                .padding(0.2);
            yAxis = svg.append("g")
                .transition().duration(1000)
                .attr("class", "yAxis")
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
                .attr("class", "xAxis")

            // add yaxis

            yScale = d3.scaleLinear()
                .range([height, 0])
            yAxis = svg.append("g")
                .attr("class", "yAxis")


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

    function drawHistogram(selectedGroup) {
        // update the title of the graph to show that it is a historgram
        title.text(`Histogram of ${!isSideways ? `${selectedGroup} (x-axis) vs Frequency (y-axis)` : `Frequency (x-axis) vs ${selectedGroup} (y-axis)`}`);

        var values = data.map(function (d) {
            return parseFloat(d[selectedGroup])
        });

        if (!isSideways) {
            var xScale = d3.scaleLinear()
                .domain(d3.extent(values))
                .range([0, width])
                .nice()

            var histogram = d3.histogram()
                .value(function (d) { return d[selectedGroup]; })
                .domain(d3.extent(values))
                .thresholds(xScale.ticks(TICKS))

            var bins = histogram(data)

            // Calculate bin width
            var binWidth = (bins[0].x1 - bins[0].x0);

            // Calculate bin midpoints
            var binMidpoints = bins.map(function (bin) {
                return bin.x0 + binWidth / 2;
            });

            if (TICKS < 25) {
                var xAxis = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "xAxis")
                    .transition().duration(1000)
                    .call(d3.axisBottom(xScale).tickValues(binMidpoints))
            } else {
                var xAxis = svg.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "xAxis")
                    .transition().duration(1000)
                    .call(d3.axisBottom(xScale))
            }


            var yScale = d3.scaleLinear()
                .domain([0, d3.max(bins, function (d) { return d.length; })])
                .range([height, 0])

            var yAxis = svg.append("g")
                .attr("class", "yAxis")
                .transition().duration(1000)
                .call(d3.axisLeft(yScale));

            // Use the update selection
            var bars = svg.selectAll(".bar")
                .data(bins);

            // Remove any bars that are not needed
            bars.exit().remove();

            // Enter new bars
            bars.enter().append("rect")
                .attr("class", "bar")
                .merge(bars) // Merge update and enter selections
                .transition().duration(1000)
                .attr("x", function (d) { return xScale(d.x0); })
                .attr("y", function (d) { return yScale(d.length); })
                .attr("width", function (d) { return xScale(d.x1) - xScale(d.x0); })
                .attr("height", function (d) { return height - yScale(d.length); })
                .attr("fill", function (d) { return colorNumeric(selectedGroup); })
        } else {
            var yScale = d3.scaleLinear()
                .domain(d3.extent(values))
                .range([height, 0])
                .nice();

            var histogram = d3.histogram()
                .value(function (d) { return d[selectedGroup]; })
                .domain(d3.extent(values))
                .thresholds(yScale.ticks(TICKS));

            var bins = histogram(data);


            if (TICKS < 25) {
                // Calculate bin height
                var binHeight = bins[0].x1 - bins[0].x0;

                // Calculate bin midpoints
                var binMidpoints = bins.map(function (bin) {
                    return bin.x0 + binHeight / 2;
                });

                var yAxis = svg.append("g")
                    .attr("class", "yAxis")
                    .call(d3.axisLeft(yScale).tickValues(binMidpoints));
            } else {
                var yAxis = svg.append("g")
                    .attr("class", "yAxis")
                    .call(d3.axisLeft(yScale));
            }

            var xScale = d3.scaleLinear()
                .domain([0, d3.max(bins, function (d) { return d.length; })])
                .range([0, width]);

            var xAxis = svg.append("g")
                .attr("transform", "translate(0," + height + ")")
                .attr("class", "xAxis")
                .call(d3.axisBottom(xScale));

            // Use the update selection
            var bars = svg.selectAll(".bar")
                .data(bins);

            // Remove any bars that are not needed
            bars.exit().remove();

            // Enter new bars
            bars.enter().append("rect")
                .attr("class", "bar")
                .merge(bars) // Merge update and enter selections
                .transition().duration(1000)
                .attr("y", function (d) { return yScale(d.x1); })
                .attr("x", function (d) { return 1; }) // Adjust x position as needed
                .attr("height", function (d) { return yScale(d.x0) - yScale(d.x1); })
                .attr("width", function (d) { return xScale(d.length); })
                .attr("fill", function (d) { return colorNumeric(selectedGroup); });
        }

    }

    function addAxesLabels(selectedGroup) {
        // Update x-axis label to the selected group
        svg.selectAll(".x-axis-label").remove(); // Remove existing X axis label
        svg.append("text")
            .attr("class", "x-axis-label")
            .attr("transform", `translate(${width / 2}, ${height + margin.top - 20})`)
            .style("text-anchor", "middle")
            .text(isScatter ? (scatterX) : (isSideways ? "Frequency" : selectedGroup))
            .attr("dy", "1em");

        // Update y-axis label to "Frequency"
        svg.selectAll(".y-axis-label").remove(); // Remove existing Y axis label
        svg.append("text")
            .attr("class", "y-axis-label")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left - 5)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(isScatter ? (scatterY) : (isSideways ? selectedGroup : "Frequency"));
    }

})