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
      			
    var size = {width: 1000, height: 400};
  	var segments = {multiplier: 0.2, countX: 100, minCountY: 10, maxCountShift: 1};
  	var style = {
        background: {color: "#00AAFF", alpha: 0.1},
        axis: {thickness: 2, color: "#00FFFF", alpha: 0.8},
        grid: {thickness: 0.5, color: "#00FFFF", alpha: 0.5},
        chart: {thickness: 3, radius: 4, color: "#000000", alpha: 0.8}
    };
    var chart = stage.addChild(new tgc.Chart(size, segments, style));
    chart.y = 50;
    chart.x = 50;
    chart.append([900, 300, 800, 1000]);
    chart.append([500]);
      			
    createjs.Ticker.on("tick", function() {
        stage.update();
    });
    
    setInterval(function() {
        chart.append([Math.random() * 1200 + 100]);
    }, 100);
}