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
      			
    stage.addChild(createChartA());
    stage.addChild(createChartB());
      			
    createjs.Ticker.on("tick", function() {
        stage.update();
    });
}

function createChartA() {
    var size = {width: 1000, height: 400};
  	var point = {width: 25, height: 0.5};
  	var style = {
        background: {color: "#00AAFF", alpha: 0.1},
        axis: {thickness: 3, color: "#00FFFF", alpha: 0.8},
        grid: {thickness: 0.5, color: "#00FFFF", alpha: 0.5, width: 2, height: 100},
        chart: {thickness: 4, radius: 4, color: "#003333", alpha: 0.75}
        //chart: {thickness: 5, radius: 6, color: "#006666", alpha: 0.5}
    };
    
    var chart = new tgc.StreamingChart(size, point, style);
    chart.y = 20;
    chart.x = 20;
    chart.append([700, 600, 200, 0, 100, 150, 0, 50, 400]);
    
    setInterval(function() {
        chart.append([Math.ceil(Math.random() * 700 + 50)]);
    }, 400);
    
    return chart;
}

function createChartB() {
    var size = {width: 1000, height: 100};
  	var point = {width: 10, height: 0.1};
  	var style = {
        background: {color: "#FF0000", alpha: 0.1},
        axis: {thickness: 2, color: "#FF0000", alpha: 0.8},
        grid: {thickness: 0.1, color: "#FF0000", alpha: 0.5, width: 2, height: 200},
        chart: {thickness: 2, radius: 2, color: "#000000", alpha: 0.8}
    };
    
    var chart = new tgc.StreamingChart(size, point, style);
    chart.y = 450;
    chart.x = 20;
    
    var t = 0;
    var shift = size.height / point.height / 2;
    setInterval(function() {
        chart.append([Math.cos(t) * 200 + shift]);
        t += 0.33;
    }, 50);
    
    return chart;
}