function init() {
    handleResizing();
    testComponents();
}

function handleResizing() {
    var
    canvas = document.getElementById("c"),
    context = canvas.getContext("2d");
                
    initialize();
                
    function initialize() {
        window.addEventListener("resize", resizeCanvas, false);
        resizeCanvas();
    }
            
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
}

function testComponents() {
    var stage = new createjs.Stage("c");
    stage.enableMouseOver();
    
    var text = new createjs.Text("...", "20px Courier");
    text.x = 25;
    text.y = 25;
    stage.addChild(text);
    			
    stage.addChild(createChartA0(text));
    //stage.addChild(createChartB0());
    //stage.addChild(createChartB1());
    //stage.addChild(createChartB2());
    
    createjs.Ticker.on("tick", function() {
        stage.update();
    });
}

function createChartA0(text) {
    var size = {width: window.innerWidth - 50, height: 300};
    var point = {width: size.width / 35, height: 0.20};
    var axis = {offset: 50, isDynamic: true, dynamicSpace: {top: 50, bottom: 0}};
    var style = {
        background: {color: "#00AAFF", alpha: 0.1},
        axis: {thickness: 3, color: "#00FFFF", alpha: 0.75},
        grid: {thickness: 0.5, color: "#00FFFF", alpha: 0.5, width: 5, height: 300, dash: [1, 0]},
        extreme: {thickness: 1, maxColor: "#FF0000", minColor: "#000000", alpha: 0},
        zero:  {thickness: 1, color: "#00FFFF", alpha: 0.75},
        chart: {thickness: 1, radius: 0, color: "#003333", alpha: 0.75, bounds: "full"}
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 50;
    chart.x = 25;
    
    var t = 0;
    setInterval(function() {
        chart.append([Math.sin(t) * Math.abs(Math.sin(t)) * 2500]);
        t += 0.100;
        text.text = chart._getAxisOffset().toFixed(3) + " " + chart._getPointHeight().toFixed(3);
    }, 50);
    
    return chart;
}

function createChartB0() {
    var size = {width: (window.innerWidth - 100) / 3, height: 100};
    var point = {width: 10, height: 0.1};
    var axis = {offset: 50, isDynamic: false, dynamicSpace: {top: 0, bottom: 0}};
    var style = {
        background: {color: "#FF0000", alpha: 0.1},
        axis: {thickness: 1, color: "#FF0000", alpha: 0.8},
        grid: {thickness: 10, color: "#FF0000", alpha: 0.5, width: 0, height: 200, dash: [1, 0]},
        extreme: {thickness: 1, maxColor: "#FF0000", minColor: "#000000", alpha: 0},
        zero:  {thickness: 1, color: "#000000", alpha: 0},
        chart: {thickness: 2, radius: 0, color: "#000000", alpha: 0.8, bounds: "none"}
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 450;
    chart.x = 25;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 420 + shift]);
        t += 0.20;
    }, 100);
    
    return chart;
}

function createChartB1() {
    var size = {width: (window.innerWidth - 100) / 3, height: 100};
    var point = {width: 10, height: 0.1};
    var axis = {offset: 0, isDynamic: false, dynamicSpace: {top: 0, bottom: 0}};
    var style = {
        background: {color: "#FF0000", alpha: 0.1},
        axis: {thickness: 4, color: "#FF0000", alpha: 0.8},
        grid: {thickness: 0.1, color: "#FF0000", alpha: 0.5, width: 2, height: 500, dash: [1, 0]},
        extreme: {thickness: 1, maxColor: "#FF0000", minColor: "#000000", alpha: 0},
        zero:  {thickness: 1, color: "#000000", alpha: 0},
        chart: {thickness: 2, radius: 2, color: "#000000", alpha: 0.8, bounds: "points"}
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 450;
    chart.x = 50 + (window.innerWidth - 100) / 3;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 600 + shift]);
        t += 0.33;
    }, 100);
    
    return chart;
}

function createChartB2() {
    var size = {width: (window.innerWidth - 100) / 3, height: 100};
    var point = {width: 10, height: 0.1};
    var axis = {offset: 0, isDynamic: false, dynamicSpace: {top: 0, bottom: 0}};
    var style = {
        background: {color: "#FF0000", alpha: 0.1},
        axis: {thickness: 4, color: "#FF0000", alpha: 0.8},
        grid: {thickness: 0.1, color: "#FF0000", alpha: 0.5, width: 5, height: 500, dash: [1, 0]},
        extreme: {thickness: 1, maxColor: "#FF0000", minColor: "#000000", alpha: 0},
        zero:  {thickness: 1, color: "#000000", alpha: 0},
        chart: {thickness: 2, radius: 2, color: "#000000", alpha: 0.8, bounds: "full"}
    };
    
    var chart = new charts.StreamingChart(size, point, axis, style);
    chart.y = 450;
    chart.x = 75 + (window.innerWidth - 100) / 3 * 2;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 600 + shift]);
        t += 0.33;
    }, 100);
    
    return chart;
}
