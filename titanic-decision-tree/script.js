const width = 800;
const height = 600;

const svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

d3.json("data/titanic.json").then(data => {
    const treeData = createDecisionTree(data);
    drawTree(treeData);
});

function createDecisionTree(data) {
    // Simplified decision tree logic based on Titanic dataset features
    const tree = {
        name: "Passenger",
        children: [
            {
                name: "Class",
                children: [
                    {
                        name: "1st",
                        children: [
                            { name: "Survived", value: "Yes" },
                            { name: "Died", value: "No" }
                        ]
                    },
                    {
                        name: "2nd",
                        children: [
                            { name: "Survived", value: "Yes" },
                            { name: "Died", value: "No" }
                        ]
                    },
                    {
                        name: "3rd",
                        children: [
                            { name: "Survived", value: "Yes" },
                            { name: "Died", value: "No" }
                        ]
                    }
                ]
            },
            {
                name: "Gender",
                children: [
                    {
                        name: "Male",
                        children: [
                            { name: "Survived", value: "Yes" },
                            { name: "Died", value: "No" }
                        ]
                    },
                    {
                        name: "Female",
                        children: [
                            { name: "Survived", value: "Yes" },
                            { name: "Died", value: "No" }
                        ]
                    }
                ]
            }
        ]
    };
    return tree;
}

function drawTree(treeData) {
    const root = d3.hierarchy(treeData);
    const treeLayout = d3.tree().size([height, width - 160]);
    treeLayout(root);

    svg.selectAll('line')
        .data(root.links())
        .enter()
        .append('line')
        .attr('x1', d => d.source.y)
        .attr('y1', d => d.source.x)
        .attr('x2', d => d.target.y)
        .attr('y2', d => d.target.x)
        .attr('stroke', '#ccc');

    const nodes = svg.selectAll('circle')
        .data(root.descendants())
        .enter()
        .append('circle')
        .attr('cx', d => d.y)
        .attr('cy', d => d.x)
        .attr('r', 5)
        .attr('fill', d => d.children ? '#555' : '#f00');

    const labels = svg.selectAll('text')
        .data(root.descendants())
        .enter()
        .append('text')
        .attr('x', d => d.y)
        .attr('y', d => d.x)
        .attr('dy', 3)
        .attr('dx', 8)
        .text(d => d.data.name);
}