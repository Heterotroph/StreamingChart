var charts = require("../streamingchart.js");
/**
 * 
 * 
 */
global.init = function(canvasID) {
    var canvas = document.getElementById(canvasID);
    window.context = canvas.getContext("2d");
    
    var stage = new createjs.Stage(canvasID);
    createjs.Touch.enable(stage, false, true);
    createjs.Ticker.setFPS(60);
    createjs.Ticker.on("tick", stage.update.bind(stage));
    stage.preventSelection = false;
    
    testCharts(canvas, stage);
}
/**
 * 
 * 
 */
function handleResize(canvas, chartA0, chartB0, chartC0, textField) {
    var containerID = "container";
    var container = document.getElementById(containerID);
    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();
    
    function resizeCanvas(e) {
        canvas.height = chartC0.getSize().height + chartC0.y + 25;
        var width = container.clientWidth - 50;
        chartA0.setComplexSize(width, chartA0.getSize().height);
        chartB0.setComplexSize(width, chartB0.getSize().height);
        chartC0.setComplexSize(width - 250, chartC0.getSize().height);
        textField.x = chartC0.x + chartC0.getSize().width + 25;
        textField.y = chartC0.y + 25;
        canvas.width = container.clientWidth;
    }
}

/**
 * 
 * 
 */
function testCharts(canvas, stage) {
    var chartA0 = stage.addChild(createChartA0(canvas));
    var chartB0 = stage.addChild(createChartB0(canvas));
    var chartC0 = stage.addChild(createChartC0(canvas));
    
    var textField = new createjs.Text("EMPTY", "16px Courier", "#000000");
    textField.lineHeight = 16;
    stage.addChild(textField);
    
    handleResize(canvas, chartA0, chartB0, chartC0, textField);
    
    createjs.Ticker.on("tick", function() {
        var text = "Last added: " + chartC0.getData()[chartC0.getData().length - 1];
        var extreme = chartC0.getExtreme();
        text += "\nLocal max: " + extreme.max.value;
        text += "\nLocal min: " + extreme.min.value;
        var localPoint = chartC0.globalToLocal(stage.mouseX, stage.mouseY);
        text += "\nLC [" + localPoint.x + ", " + localPoint.y + "]";
        text += "\nLP [" + chartC0.getIndexByLocalX(localPoint.x).toFixed(2) + ", " + chartC0.getValueByLocalY(localPoint.y).toFixed(2) + "]";
        text += "\nInterpolated: " + chartC0.getInterpolatedValueByLocalX(localPoint.x).toFixed(2);
        text += "\nLV [" + chartC0.getValueByLocalY(0).toFixed(2) + ", " + chartC0.getValueByLocalY(chartC0.getSize().height).toFixed(2) + "]";
        var pointSize = chartC0.getPoint();
        text += "\nPS [" + pointSize.width.toFixed(2) + ", " + pointSize.height.toFixed(2) + "]";
        textField.text = text;
    });
}

/**
 * 
 * 
 */
function createChartA0(canvas) {
    var size = {width: canvas.width - 50, height: 250};
    var point = {width: size.width / 70, height: 0.20};
    var axis = {offset: 0, isDynamic: true, dynamicSpace: {top: 10, bottom: 10}};
    var style = {
        background: {color: "rgba(0,170,255,0.1)"},
        grid: {thickness: 0.5, color: "rgba(0,255,255,0.33)", width: 5, height: 300, dash: [1, 0], offset: 0},
        axisX:  {thickness: 1, color: "#00FFFF"},
        chart: {
            lines: {thickness: 1, color: "#003333", dash: [1, 0], bounds: true},
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
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 25;
    chart.x = 25;
    
    var t = 0;
    setInterval(function() {
        var data = [];
        data.push(Math.sin(t) * Math.abs(Math.sin(t)) * 2500);
        chart.append(data);
        if (chart.getCapacity() == chart.getDataLength()) {
            chart.setGridOffset(chart.getGridOffset() - 1);
        }
        t += 0.050;
    }, 50);
    
    return chart;
}

/**
 * 
 * 
 */
function createChartB0(canvas) {
    var size = {width: canvas.width - 50, height: 100};
    var point = {width: size.width / 50, height: 0.1};
    var axis = {offset: 0, isDynamic: false, dynamicSpace: {top: 0, bottom: 0}};
    var style = {
        background: {color: "#FF0000"},
        grid: {thickness: 10, color: "#FFFFFF", width: 0, height: 200, dash: [1, 0], offset: 0},
        axisX:  {thickness: 2, color: "#000000"},
        chart: {
            lines: {thickness: 2, color: "#000000", dash: [1, 0], bounds: false},
            points:  {thickness: 2, radius: 2, lineColor: "#000000", fillColor: "#FFFFFF", bounds: false},
            fill: {type: "solid", color: "rgba(255,0,0,0.5)", bounds: true}
        }
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 325;
    chart.x = 25;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 700 + shift]);
        t += 0.50;
    }, 250);
    
    return chart;
}

/**
 * 
 * 
 */
function createChartC0(canvas) {
    var size = {width: canvas.width - 300, height: 200};
    var point = {width: 1, height: 1};
    var axis = {offset: 0, isDynamic: true, dynamicSpace: {top: 0, bottom: 100}};
    var style = {
        background: {color: "rgba(255,255,255,0)"},
        axisX:  {thickness: 1, color: "#00FF00"},
        chart: {
            lines: {thickness: 4, color: "rgba(102,214,102,1)", dash: [1, 0], bounds: false},
            points:  {thickness: 6, radius: 12, lineColor: "#FFFFFF", fillColor: "#00BB00", bounds: false},
            fill: {type: "solid", color: "rgba(102,214,102,1)", bounds: true}
        }
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 475;
    chart.x = 25;
    
    (function() {
        var req = new XMLHttpRequest();
        req.open("GET", "test.json", true);
        req.addEventListener("load", reqCompleteHandler, false);
        req.addEventListener("error", reqErrorHandler, false);
        req.send();
    })();
    
    function reqCompleteHandler(e) {
        var req = e.target;
        var data = JSON.parse(req.responseText);
        
        var pLength = 10;
        chart.setPoint(size.width / (pLength - 1), chart.getPoint().height);
        chart.redraw();
        chart.append(data.splice(0, pLength));
        
        var t = 0;
        var interval = setInterval(function() {
            if (t == data.length) {
                clearInterval(interval);
                return;
            }
            chart.append(data[t]);
            t ++;
        }, 1500);
        
        req.removeEventListener("load", reqCompleteHandler, false);
        req.removeEventListener("error", reqErrorHandler, false);
    }
    
    function reqErrorHandler(e) {
        alert(req.status + ": " + req.statusText);
        var req = e.target;
        req.removeEventListener("load", reqCompleteHandler, false);
        req.removeEventListener("error", reqErrorHandler, false);
    }
    
    return chart;
}
