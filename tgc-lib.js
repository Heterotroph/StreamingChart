var tgc = {};

(function() {

    /**
     * size: {width: 500, height: 400}
     * segments: {multiplier: 0.1, countX: 10, minCountY: 10}
     * style: {
     *  background: {color: "#000000", alpha: 0.5},
     *  axis: {thickness: 3, color: "#FF0000", alpha: 1},
     *  grid: {thickness: 1, color: "#00FFFF", alpha: 1},
     *  chart: {thickness: 3, radius: 4, color: "#000000", alpha: 0.8}
     * }
     */ 
    function Chart(size, segments, style) {
        this.Container_constructor();
        
        this.size = size;
        this.segments = segments;
        this.style = style;
        
        this.data = [];
        this.maxCountY = 0;
        
        this.backgroundShape = this.addChild(new createjs.Shape());
        this.axisShape = this.addChild(new createjs.Shape());
        this.gridShape = this.addChild(new createjs.Shape());
        this.chartShape = this.addChild(new createjs.Shape());
        
        this.updateStyle();
    }
    
    var p = createjs.extend(Chart, createjs.Container);
    
    //
    // PUBLIC METHODS
    //
    
    p.append = function(data) {
        var totalData = this.data.concat(data);
        var stepX = this.size.width / this.segments.countX;
        
        var offset = totalData.length > this.segments.countX ? 0 : Math.max(this.data.length - 1, 0);
        var offsetX = offset * stepX;
        var lengthData = Math.min(totalData.length - offset, this.segments.countX + 1);
        
        if (!offset) this.chartShape.graphics.clear();
        console.log("offset " + offset + "; data " + totalData.slice(-lengthData));
        
        this._drawChart(offsetX, stepX, totalData.slice(-lengthData), this.style.chart);
        this.data = totalData;
    };
    
    p.clear = function() {
        this.segments = [];
        this.chartShape.graphics.clear();
    };
    
    p.updateStyle = function() {
        this._drawBackgroundShape(this.size, this.style.background);
        this._drawAxisShape(this.size, this.style.axis);
        this._drawGridShape(this.segments.countX, Math.max(this.segments.minCountY, this.maxCountY), this.style.grid);
    };
    
    //
    // PRIVATE METHODS
    //
    
    p._drawChart = function(offsetX, stepX, data, style) {
        var mult = this.segments.multiplier;
        var aX, aY, bX, bY;
        aX = offsetX;
        aY = data[0] * mult;
        if (!offsetX) this._drawPoint(0, aY, "standart", style);
        for (var i = 0; i < data.length - 1; i++) {
            bX = offsetX + stepX * (i + 1);
            bY = data[i + 1] * mult;
            this._drawSegment(aX, aY, bX, bY, style);
            aX = bX;
            aY = bY;
        }
    };
    
    p._drawSegment = function(aX, aY, bX, bY, style) {
        var graphics = this.chartShape.graphics;
        
        graphics.setStrokeStyle(style.thickness, "round");
        graphics.beginStroke(style.color);
        graphics.moveTo(aX, this.size.height - aY).lineTo(bX, this.size.height - bY);
        graphics.endStroke();
        
        this._drawPoint(bX, bY, "standart", style);
    };
    
    p._drawPoint = function(x, y, type, style) {
        var graphics = this.chartShape.graphics;
        switch(type) {
        case "selected":
            graphics.setStrokeStyle(style.thickness, "round");
            graphics.beginStroke(style.color);
            graphics.drawCircle(x, this.size.height - y, style.radius);
            graphics.endStroke();
            break;
        case "standart":
            graphics.beginFill(style.color);
            graphics.drawCircle(x, this.size.height - y, style.radius);
            graphics.endFill();
            break;
        default:
            break;
        }
    };
    
    p._drawBackgroundShape = function(size, style) {
        var graphics = this.backgroundShape.graphics.clear();
        graphics.beginFill(style.color);
        graphics.drawRoundRect(0, 0, size.width, size.height, 3);
        this.backgroundShape.alpha = style.alpha;
    };
    
    p._drawAxisShape = function(size, style) {
        var graphics = this.axisShape.graphics.clear();
        graphics.setStrokeStyle(style.thickness, "butt").beginStroke(style.color);
        graphics.moveTo(0, 0).lineTo(0, size.height).lineTo(size.width, size.height);
        graphics.endStroke();
        this.axisShape.alpha = style.alpha;
    };
    
    p._drawGridShape = function(countX, countY, style) {
        var stepX = this.size.width / countX;
        var stepY = this.size.height / countY;
        
        var graphics = this.gridShape.graphics.clear();
        graphics.setStrokeDash([3, 5]);
        graphics.setStrokeStyle(style.thickness, "butt").beginStroke(style.color);
        for (var x = stepX; x < this.size.width; x += stepX) {
            graphics.moveTo(x, 0);
            graphics.lineTo(x, this.size.height);
        }
        for (var y = stepY; y < this.size.height; y += stepY) {
            graphics.moveTo(0, y);
            graphics.lineTo(this.size.width, y);
        }
        graphics.endStroke();
        this.gridShape.alpha = style.alpha;
    };
    
    // ---
    
    tgc.Chart = createjs.promote(Chart, "Container");
}());