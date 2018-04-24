# StreamingChart.JS

StreamingChart component based on EaselJS.

https://heterotroph.github.io/streamingchart/test/index.html

https://www.npmjs.com/package/streamingchart

https://createjs.com/easeljs



### index.html

```sh
<head>
    <script src="https://code.createjs.com/easeljs-0.8.2.min.js"></script>
    <script src="./index.js"></script>
</head>
<body>
    <canvas id="canvas" width="600" height="300">empty</canvas>
    <script>init("canvas")</script>
</body>
</html>
```

### index.js

```sh
function init(canvasID) {
    const canvas = document.getElementById(canvasID);
    window.context = canvas.getContext("2d");
    
    const stage = new createjs.Stage(canvasID);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", stage.update.bind(stage));
    createjs.Touch.enable(stage, false, true);
    stage.preventSelection = false;
    
    const chart = createChart(canvas);
    stage.addChild(chart);

    let t = 0;
    createjs.Ticker.on("tick", function() {
        chart.append([
            Math.sin(t) * Math.abs(Math.sin(t))
        ]);
        t += 0.05;
    });
}

function createChart(canvas) {
    const size = {width: canvas.width, height: canvas.height};
    const point = {width: 10, height: 10};
    const axis = {offset: 0, isDynamic: true, dynamicSpace: {top: 25, bottom: 25}};
    const style = {
        grid: {thickness: 1, color: "rgba(0,255,255,0.33)", width: 0, height: 0.1, dash: [1, 0]},
        axisX: {thickness: 1, color: "#00FFFF"},
        chart: {
            lines: {
                thickness: 1,
                color: "#003333",
                dash: [1, 0],
                bounds: true
            },
            fill: {
                type: "linear", 
                isSymmetric: true,
                colors: ["rgba(0,255,255,0.25)", "rgba(0,255,255,0.05)", "rgba(0,255,255,0.25)"],
                ratios: [0, 0.50, 1],
                coords: [0, 0, 0, 1],
                bounds: false
            }
        }
    };
    
    const charts = require("streamingchart");
    return new charts.StreamingChart(size, point, axis, style);
}
```