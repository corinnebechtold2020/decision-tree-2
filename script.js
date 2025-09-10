
// --- CONFIG ---
const CANVAS_ID = 'tree-canvas';
const RUN_BTN_ID = 'run-btn';
const DATA_URL = 'data/titanic.json';
const WIDTH = 1100;
const HEIGHT = 700;
const NODE_RADIUS = 38;
const LEAF_RADIUS = 44;
const FONT = '13px Arial';
const ANIMATION_SPEED = 18; // px per frame
const DOT_RADIUS = 10;
const DOT_GAP = 6;
const LEAF_ROWS = 3;
const COLORS = {
    male: '#3b82f6', // blue
    female: '#f472b6', // pink
    survive: '#22c55e', // green
    die: '#ef4444', // red
    split: '#2563eb', // dark blue
    leaf: '#e5e7eb', // gray
    test: '#fbbf24', // orange (for other differentiators)
};

// --- HARD-CODED TREE STRUCTURE ---
// Classic Titanic splits: Sex -> Pclass -> Age
const TREE = {
    label: 'Sex',
    split: 'Sex',
    children: [
        {
            value: 'female',
            color: COLORS.female,
            node: {
                label: 'Pclass',
                split: 'Pclass',
                children: [
                    {
                        value: '1',
                        color: COLORS.split,
                        node: { label: 'Survive', outcome: 1, color: COLORS.survive }
                    },
                    {
                        value: '2',
                        color: COLORS.split,
                        node: { label: 'Survive', outcome: 1, color: COLORS.survive }
                    },
                    {
                        value: '3',
                        color: COLORS.split,
                        node: {
                            label: 'Age',
                            split: 'Age',
                            children: [
                                {
                                    value: '<20',
                                    color: COLORS.split,
                                    node: { label: 'Survive', outcome: 1, color: COLORS.survive }
                                },
                                {
                                    value: '20+',
                                    color: COLORS.split,
                                    node: { label: 'Die', outcome: 0, color: COLORS.die }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            value: 'male',
            color: COLORS.male,
            node: {
                label: 'Age',
                split: 'Age',
                children: [
                    {
                        value: '<10',
                        color: COLORS.split,
                        node: { label: 'Survive', outcome: 1, color: COLORS.survive }
                    },
                    {
                        value: '10+',
                        color: COLORS.split,
                        node: {
                            label: 'Pclass',
                            split: 'Pclass',
                            children: [
                                {
                                    value: '1',
                                    color: COLORS.split,
                                    node: { label: 'Survive', outcome: 1, color: COLORS.survive }
                                },
                                {
                                    value: '2',
                                    color: COLORS.split,
                                    node: { label: 'Die', outcome: 0, color: COLORS.die }
                                },
                                {
                                    value: '3',
                                    color: COLORS.split,
                                    node: { label: 'Die', outcome: 0, color: COLORS.die }
                                }
                            ]
                        }
                    }
                ]
            }
        }
    ]
};

// --- DATA SPLIT ---
let train = [], test = [], all = [];
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

function splitData(data) {
    shuffle(data);
    const split = Math.floor(data.length * 0.8);
    train = data.slice(0, split);
    test = data.slice(split);
}

// --- TREE LAYOUT ---
// Precompute node positions for drawing
function layoutTree(tree, x, y, level = 0, parent = null) {
    // For vertical layout, each split node is above its children
    let node = {
        ...tree,
        x, y, level, parent,
        children: []
    };
    if (tree.children) {
        const n = tree.children.length;
        const width = 180 * (n - 1);
        let cx = x - width / 2;
        for (let i = 0; i < n; ++i) {
            const child = layoutTree(tree.children[i].node, cx + i * 180, y + 120, level + 1, node);
            child.branchValue = tree.children[i].value;
            child.branchColor = tree.children[i].color;
            node.children.push(child);
        }
    }
    return node;
}

// --- TREE TRAVERSAL FOR DATA POINTS ---
function getLeafForPassenger(passenger, node) {
    if (!node.children) return node;
    if (node.split === 'Sex') {
        const branch = node.children.find(c => c.branchValue === passenger.Sex);
        return getLeafForPassenger(passenger, branch);
    }
    if (node.split === 'Pclass') {
        let val = String(passenger.Pclass);
        if (node.children.length === 2) {
            // female: 1st or 2nd vs 3rd
            val = (passenger.Pclass === 1 || passenger.Pclass === 2) ? '1' : '3';
        }
        const branch = node.children.find(c => c.branchValue === val);
        return getLeafForPassenger(passenger, branch);
    }
    if (node.split === 'Age') {
        let val = '';
        if (node.children.some(c => c.branchValue === '<10')) {
            val = passenger.Age < 10 ? '<10' : '10+';
        } else {
            val = passenger.Age < 20 ? '<20' : '20+';
        }
        const branch = node.children.find(c => c.branchValue === val);
        return getLeafForPassenger(passenger, branch);
    }
    return node;
}

// --- DRAWING ---
function drawTree(ctx, node) {
    // Draw children and connectors first
    if (node.children) {
        node.children.forEach(child => {
            // Draw connector
            ctx.strokeStyle = child.branchColor || COLORS.split;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(node.x, node.y + NODE_RADIUS);
            ctx.lineTo(child.x, child.y - NODE_RADIUS);
            ctx.stroke();
            // Draw branch value
            ctx.save();
            ctx.font = '12px Arial';
            ctx.fillStyle = child.branchColor || COLORS.split;
            ctx.textAlign = 'center';
            ctx.fillText(child.branchValue, (node.x + child.x) / 2, (node.y + child.y) / 2 - 8);
            ctx.restore();
            drawTree(ctx, child);
        });
    }
    // Draw node
    ctx.save();
    ctx.beginPath();
    ctx.arc(node.x, node.y, node.children ? NODE_RADIUS : LEAF_RADIUS, 0, 2 * Math.PI);
    ctx.fillStyle = node.children ? COLORS.split : node.color || COLORS.leaf;
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = node.children ? COLORS.split : node.color || COLORS.leaf;
    ctx.stroke();
    // Draw label
    ctx.font = node.children ? 'bold 15px Arial' : 'bold 13px Arial';
    ctx.fillStyle = node.children ? '#fff' : '#222';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(node.label, node.x, node.y);
    ctx.restore();
}

// --- ANIMATION ---
let leafMap = {};
let animating = false;
let testOrder = [];
let dots = [];

function resetLeafMap(tree) {
    leafMap = {};
    function visit(node) {
        if (!node.children) {
            leafMap[node.x + ',' + node.y] = [];
        } else {
            node.children.forEach(visit);
        }
    }
    visit(tree);
}

function drawDots(ctx) {
    Object.values(leafMap).forEach(arr => {
        arr.forEach(dot => {
            ctx.save();
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, DOT_RADIUS, 0, 2 * Math.PI);
            ctx.fillStyle = dot.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();
            ctx.restore();
        });
    });
}

function animateTestPoints(ctx, tree, testSet, callback) {
    animating = true;
    testOrder = [...testSet];
    shuffle(testOrder);
    let i = 0;
    function animateNext() {
        if (i >= testOrder.length) {
            animating = false;
            if (callback) callback();
            return;
        }
        const p = testOrder[i];
        const leaf = getLeafForPassenger(p, tree);
        // Find slot in leaf
        const key = leaf.x + ',' + leaf.y;
        const arr = leafMap[key];
        const slot = arr.length;
        const col = slot % 7;
        const row = Math.floor(slot / 7);
        const targetX = leaf.x - 36 + col * (DOT_RADIUS * 2 + DOT_GAP);
        const targetY = leaf.y + LEAF_RADIUS + 18 + row * (DOT_RADIUS * 2 + DOT_GAP);
        // Start at top
        let dot = {
            x: Math.random() * WIDTH,
            y: 0,
            color: p.Sex === 'female' ? COLORS.female : COLORS.male,
            border: p.Survived ? COLORS.survive : COLORS.die,
            targetX, targetY, p
        };
        function step() {
            let dx = dot.targetX - dot.x;
            let dy = dot.targetY - dot.y;
            let dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < ANIMATION_SPEED) {
                dot.x = dot.targetX;
                dot.y = dot.targetY;
                arr.push(dot);
                drawAll();
                i++;
                setTimeout(animateNext, 180);
            } else {
                dot.x += dx / dist * ANIMATION_SPEED;
                dot.y += dy / dist * ANIMATION_SPEED;
                drawAll(dot);
                requestAnimationFrame(step);
            }
        }
        step();
    }
    animateNext();
}

function drawAll(flyingDot) {
    const canvas = document.getElementById(CANVAS_ID);
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
    drawTree(ctx, window._treeLayout);
    drawDots(ctx);
    if (flyingDot) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(flyingDot.x, flyingDot.y, DOT_RADIUS, 0, 2 * Math.PI);
        ctx.fillStyle = flyingDot.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        ctx.restore();
    }
}

// --- MAIN ---
window.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById(CANVAS_ID);
    const ctx = canvas.getContext('2d');
    fetch(DATA_URL)
        .then(r => r.json())
        .then(data => {
            all = data;
            splitData(all);
            // Build tree using only training set (for demo, tree is hardcoded)
            window._treeLayout = layoutTree(TREE, WIDTH / 2, 90);
            resetLeafMap(window._treeLayout);
            drawAll();
        });

        document.getElementById(RUN_BTN_ID).onclick = () => {
            if (animating) return;
            console.log('Run button clicked. Test set size:', test.length);
            if (test.length === 0) {
                alert('No test data to animate!');
                return;
            }
            // Always redraw the tree before animating
            resetLeafMap(window._treeLayout);
            drawAll();
            animateTestPoints(ctx, window._treeLayout, test, () => {
                // Redraw the tree after animation completes
                drawAll();
            });
        };
});

function renderTreeWithRefs(container, node, depth = 0, nodeRefs = []) {
    const nodeEl = createNodeElement(node, depth);
    container.appendChild(nodeEl);
    nodeRefs.push(nodeEl);
    node._el = nodeEl; // attach DOM ref for animation
    if (node.branches) {
        // Create a vertical container for all branches
        const branchesContainer = document.createElement('div');
        branchesContainer.className = 'branches-vertical';
        branchesContainer.style.display = 'flex';
        branchesContainer.style.flexDirection = 'column';
        branchesContainer.style.alignItems = 'center';
        branchesContainer.style.gap = '8px';
        container.appendChild(branchesContainer);
        node.branches.forEach((branch, i) => {
            // Draw vertical line down from node to branch bubble
            const connectorLine = document.createElement('div');
            connectorLine.className = 'vertical-connector';
            branchesContainer.appendChild(connectorLine);

            // Branch bubble and child node in a vertical stack
            const branchStack = document.createElement('div');
            color: p.Sex === 'female' ? COLORS.female : (p.Sex === 'male' ? COLORS.male : COLORS.test),
            branchStack.style.display = 'flex';
            branchStack.style.flexDirection = 'column';
            branchStack.style.alignItems = 'center';
        console.log('Animating dot:', dot);

            // Branch bubble
            const branchBubble = document.createElement('div');
            branchBubble.className = 'branch-bubble';
            branchBubble.textContent = branch.value;
            branchStack.appendChild(branchBubble);

            // Draw child node
            const childContainer = document.createElement('div');
            childContainer.style.position = 'relative';
            childContainer.style.marginTop = '8px';
            branchStack.appendChild(childContainer);
            renderTreeWithRefs(childContainer, branch.node, depth + 1, nodeRefs);

            branchesContainer.appendChild(branchStack);
        });
    }
    return nodeRefs;
}

// Animate a dot along the path
function animateDot(path, color, delay = 0) {
    const dot = document.createElement('div');
    dot.className = 'dot';
    dot.style.background = color;
    dot.style.position = 'absolute';
    dot.style.left = '50%';
    dot.style.transform = 'translate(-50%, -50%)';
    dot.style.zIndex = 10;
    let i = 0;
    function moveToNext() {
        if (i >= path.length) return;
        const nodeEl = path[i]._el;
        const rect = nodeEl.getBoundingClientRect();
        const parentRect = document.body.getBoundingClientRect();
        dot.style.top = (rect.top - parentRect.top + rect.height / 2) + 'px';
        dot.style.left = (rect.left - parentRect.left + rect.width / 2) + 'px';
        if (i === 0) document.body.appendChild(dot);
        i++;
        if (i < path.length) {
            setTimeout(moveToNext, 500);
        } else {
            // At leaf, pulse and remove after a moment
            dot.classList.add('at-leaf');
            setTimeout(() => dot.remove(), 1000);
        }
    }
    setTimeout(moveToNext, delay);
}


// (Removed legacy DOM-based code)
