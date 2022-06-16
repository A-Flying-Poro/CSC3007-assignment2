document.addEventListener('DOMContentLoaded', (event) => {
    const fullHeight = 500
    const fullWidth = 860
    const marginX = 50
    const marginY = 50
    const height = fullHeight - marginY * 2
    const width = fullWidth - marginX * 2

    const dataSvg = d3.select('#dataChart')
        .append('svg')
        .attr('viewBox', [0, 0, fullWidth, fullHeight])
        .append('g')
        .attr('transform', `translate(${marginX}, ${marginY})`);

    d3.csv('./data.csv', (data) => {
        return {
            year: data.year,
            crime: data.level_2,
            count: +data.value
        }
    }).then(data => {
        const crimesPerYear = [];
        const crimesNames = new Set();

        let currentYearCrimes = null;
        for (const value of data) {
            if (currentYearCrimes == null) {
                currentYearCrimes = {
                    year: value.year
                };
            } else if (currentYearCrimes.year !== value.year) {
                crimesPerYear.push(currentYearCrimes);
                currentYearCrimes = {
                    year: value.year
                };
            }
            currentYearCrimes[value.crime] = value.count;
            crimesNames.add(value.crime);
        }
        if (currentYearCrimes != null) {
            crimesPerYear.push(currentYearCrimes);
        }

        const stack = d3.stack()
            .keys(crimesNames.values())
            .order(d3.stackOrderNone)
            .offset(d3.stackOffsetNone);
        const stackedData = stack(crimesPerYear);

        // Labels
        // x-axis labels
        const xLabels = crimesPerYear.map(d => d.year);
        const xAxis = d3.scaleBand()
            .domain(xLabels)
            .range([0, width])
            .padding([0.2]);
        dataSvg.append('g')
            .attr('transform', `translate(0, ${height})`)
            .call(d3.axisBottom(xAxis).tickSizeOuter(0));

        // y-axis labels
        const yAxis = d3.scaleLinear()
            .domain([0, 20000])
            .range([height, 0]);
        dataSvg.append('g')
            .call(d3.axisLeft(yAxis));

        const colours = d3.schemeCategory10;
        const colourScale = d3.scaleOrdinal()
            .domain(crimesNames)
            .range(colours);

        // Bars
        dataSvg.append('g')
            // Group same crimes over years together
            .selectAll('g')
            .data(stackedData)
            .enter()
            .append('g')
            .style('fill', d => colourScale(d.key))
            // Drawing crime per year
            .selectAll('rect')
            .data(d => d)
            .enter()
            .append('rect')
            .attr('x', d => xAxis(d.data.year))
            .attr('y', d => yAxis(d[1]))
            .attr('width', xAxis.bandwidth())
            .attr('height', d => (yAxis(d[0]) - yAxis(d[1])));

        // Legend
        const legend = dataSvg
            .selectAll('.legend')
            .data(colours)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(30, ${i} * 22)`);

        legend.append('rect')
            .attr('x', width - 20)
            .attr('width', 20)
            .attr('height', 20)
            .style('fill', (d, i) => colours.slice().reverse()[i]);

        legend.append('text')
            .attr('x', width + 5)
            .attr('y', 10)
            .attr('dy', '.35rem')
            .attr('text-anchor', 'start')
            .text((d, i) => crimesNames.values().slice().reverse()[i])
    });
});
