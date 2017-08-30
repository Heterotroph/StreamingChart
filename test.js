var canvas;
var stage;

var chartA0;
var chartB0;
var chartC0;
var fieldsContainer;

function init() {
    var canvasID = "c";
    
    canvas = document.getElementById(canvasID);
    window.context = canvas.getContext("2d");
    
    stage = new createjs.Stage(canvasID);
    createjs.Ticker.on("tick", function() {
        stage.update();
    });
    
    handleResizing();
    testComponents();
}

/**
 * 
 * 
 */
function handleResizing() {
    window.addEventListener("resize", resizeCanvas, false);
    resizeCanvas();
     
    function resizeCanvas(e) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (!chartA0) return;
        var width = canvas.width - 50;
        chartA0.setComplexSize(width, chartA0.getSize().height);
        chartB0.setComplexSize(width, chartB0.getSize().height);
        chartC0.setComplexSize(width - 250, chartC0.getSize().height);
        fieldsContainer.x = chartC0.x + chartC0.getSize().width + 25;
        fieldsContainer.y = chartC0.y;
    }
}

/**
 * 
 * 
 */
function testComponents() {
    chartA0 = stage.addChild(createChartA0());
    chartB0 = stage.addChild(createChartB0());
    chartC0 = stage.addChild(createChartC0());
    
    fieldsContainer = stage.addChild(new createjs.Container());
    fieldsContainer.x = chartC0.x + chartC0.getSize().width + 25;
    fieldsContainer.y = chartC0.y;
    
    var text0 = new createjs.Text("Last added: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text0);
    
    var text1 = new createjs.Text("Local max: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text1);
    text1.y = text1.y + text0.getBounds().height + 10;
    
    var text2 = new createjs.Text("Local min: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text2);
    text2.y = text1.y + text1.getBounds().height + 10;
    
    var text3 = new createjs.Text("[Coordinates]", "16px Courier", "#000000");
    fieldsContainer.addChild(text3);
    text3.y = text2.y + text2.getBounds().height + 10;
    
    var text4 = new createjs.Text("[Coord to points]", "16px Courier", "#000000");
    fieldsContainer.addChild(text4);
    text4.y = text3.y + text3.getBounds().height + 10;
    
    var text5 = new createjs.Text("Interpolated: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text5);
    text5.y = text4.y + text4.getBounds().height + 10;
    
    var text6 = new createjs.Text("[Top-Bottom values]: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text6);
    text6.y = text5.y + text5.getBounds().height + 10;
    
    var text7 = new createjs.Text("[Point size]: ", "16px Courier", "#000000");
    fieldsContainer.addChild(text7);
    text7.y = text6.y + text6.getBounds().height + 10;
    
    createjs.Ticker.on("tick", function() {
        text0.text = "Last added: " + chartC0.getData()[chartC0.getData().length - 1];
        
        var extreme = chartC0.getExtreme();
        text1.text = "Local max: " + extreme.max.value;
        text2.text = "Local min: " + extreme.min.value;
        
        var localPoint = chartC0.globalToLocal(stage.mouseX, stage.mouseY);
        text3.text = "LC [" + localPoint.x + ", " + localPoint.y + "]";
        text4.text = "LP [" + chartC0.getIndexByLocalX(localPoint.x).toFixed(2) + ", " + chartC0.getValueByLocalY(localPoint.y).toFixed(2) + "]";
        text5.text = "Interpolated: " + chartC0.getInterpolatedValueByLocalX(localPoint.x).toFixed(2);
        
        text6.text = "LV [" + chartC0.getValueByLocalY(0).toFixed(2) + ", " + chartC0.getValueByLocalY(chartC0.getSize().height).toFixed(2) + "]";
        
        var pointSize = chartC0.getPoint();
        text7.text = "PS [" + pointSize.width.toFixed(2) + ", " + pointSize.height.toFixed(2) + "]";
    });
}

/**
 * 
 * 
 */
function createChartA0() {
    var size = {width: canvas.width - 50, height: 250};
    var point = {width: size.width / 70, height: 0.20};
    var axis = {offset: 0, isDynamic: true, dynamicSpace: {top: 10, bottom: 10}};
    var style = {
        background: {color: "#00AAFF", alpha: 0.1},
        grid: {thickness: 0.5, color: "#00FFFF", alpha: 0.5, width: 5, height: 300, dash: [1, 0], offset: 0},
        axisX:  {thickness: 1, color: "#00FFFF", alpha: 0.75, offset: 0},
        chart: {
            lines: {thickness: 1, color: "#003333", alpha: 1, bounds: true},
            points:  {thickness: 0, radius: 0, lineColor: "#000000", fillColor: "#FF0000", alpha: 0, bounds: true}
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
        t += 0.050;
    }, 50);
    
    return chart;
}

/**
 * 
 * 
 */
function createChartB0() {
    var size = {width: canvas.width - 50, height: 100};
    var point = {width: size.width / 50, height: 0.1};
    var axis = {offset: 0, isDynamic: false, dynamicSpace: {top: 0, bottom: 0}};
    var style = {
        background: {color: "#FF0000", alpha: 0.1},
        grid: {thickness: 10, color: "#FFFFFF", alpha: 1, width: 0, height: 200, dash: [1, 0], offset: 0},
        axisX:  {thickness: 1, color: "#000000", alpha: 0, offset: 0},
        chart: {
            lines: {thickness: 2, color: "#000000", alpha: 0.8, bounds: false},
            points:  {thickness: 2, radius: 2, lineColor: "#000000", fillColor: "#FFFFFF", alpha: 1, bounds: false}
        }
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 300;
    chart.x = 25;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 600 + shift]);
        t += 0.50;
    }, 250);
    
    return chart;
}

/**
 * 
 * 
 */
function createChartC0() {
    var size = {width: canvas.width - 300, height: 200};
    var point = {width: 1, height: 1};
    var axis = {offset: 0, isDynamic: true, dynamicSpace: {top: 0, bottom: 100}};
    var style = {
        background: {color: "#00BB00", alpha: 0.6},
        grid: {thickness: 1, color: "#FFFFFF", alpha: 0.25, width: 1, height: 0, dash: [1, 0], offset: 0},
        axisX:  {thickness: 1, color: "#00FF00", alpha: 0.75, offset: 0},
        chart: {
            lines: {thickness: 5, color: "#FFFFFF", alpha: 0.75, bounds: true},
            points:  {thickness: 5, radius: 10, lineColor: "#FFFFFF", fillColor: "#00BB00", alpha: 1, bounds: true}
        }
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 425;
    chart.x = 25;
    
    var data;
    var req = new XMLHttpRequest();
    requestData();
    
    function requestData() {
        req.open("GET", "test.json", true);
        
        req.addEventListener("load", reqCompleteHandler, false);
        req.addEventListener("error", reqErrorHandler, false);
        
        req.send();
    }
    
    function reqCompleteHandler(e) {
        data = JSON.parse(req.responseText);
        
        var pLength = Math.ceil(Math.random() * 10 + 10);
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
        req.removeEventListener("load", reqCompleteHandler, false);
        req.removeEventListener("error", reqErrorHandler, false);
    }
    
    return chart;
}
