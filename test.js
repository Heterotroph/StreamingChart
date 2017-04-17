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
  	var point = {width: 50, height: 1};
  	var style = {
        background: {color: "#00AAFF", alpha: 0.1},
        axis: {thickness: 2, color: "#00FFFF", alpha: 0.8},
        grid: {thickness: 0.5, color: "#00FFFF", alpha: 0.5, width: 2, height: 100},
        chart: {thickness: 3, radius: 4, color: "#000000", alpha: 0.8}
    };
    var chart = stage.addChild(new tgc.StreamingChart(size, point, style));
    chart.y = 50;
    chart.x = 50;
    chart.append([300, 390, 370, 200, 220, 100, 0, 50, 300]);
      			
    createjs.Ticker.on("tick", function() {
        stage.update();
    });
    
    setInterval(function() {
        chart.append([Math.ceil(Math.random() * 300 + 50)]);
    }, 300);
}