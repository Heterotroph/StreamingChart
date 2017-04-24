var charts = {};

(function() {

    /**
     * Example of arguments:
     *  size = {width: 1000, height: 400}
     *  point = {width: 50, height: 1}
     *  axis = {offset: 0, dynamicSpace: {top: 10, bottom: 0}, isDynamic: false}
     *  style = {
     *      background: {color: "#000000", alpha: 0.5},
     *      axis: {thickness: 3, color: "#FF0000", alpha: 1},
     *      grid: {thickness: 1, color: "#00FFFF", alpha: 1, width: 1, height: 20, dash: [1, 0]},
     *      extreme: {thickness: 1, maxColor: "#FF0000", minColor: "#000000", alpha: 1},
     *      chart: {thickness: 3, radius: 4, color: "#000000", alpha: 0.8, bounds: "full"}
     * }
     */ 
    function StreamingChart(size, point, axis, style) {
        this.Container_constructor();
        
        //chart points data
        this._data = [];
        
        //configuration
        this._size = size;
        this._point = point;
        this._axis = axis;
        this._style = style;
        
        //dynamic values
        this._pointHeight = this._point.height;
        this._widthCapacity = Math.floor(this._size.width /  this._point.width);
        this._heightCapacity = Math.floor(this._size.height / this._pointHeight);
        this._pointsWidthCapacity = this._widthCapacity + 1;
        this._extremeMax = {value: Number.MIN_VALUE, age: this._widthCapacity};
        this._extremeMin = {value: Number.MAX_VALUE, age: this._widthCapacity};
        this._isDrawPoints = false;
        this._axisOffset = this._axis.offset;
        
        //views
        this._backgroundShape = this.addChild(new createjs.Shape());
        this._gridShape = this.addChild(new createjs.Shape());
        this._maxShape = this.addChild(new createjs.Shape());
        this._minShape = this.addChild(new createjs.Shape());
        this._axisShape = this.addChild(new createjs.Shape());
        this._chartShape = this.addChild(new createjs.Shape());
        this._pointShape = this.addChild(new createjs.Shape());
        
        //apply style configuration
        this.updateStyle();
    }
    
    var p = createjs.extend(StreamingChart, createjs.Container);
    
    //
    //  PUBLIC METHODS
    //
    
    p.append = function(data) {
        var totalData = this._data.concat(data);
        
        this._processExtreme(totalData, data.length);
        if (this._axis.isDynamic) {
            var fullRedraw = this._data.length < this._pointsWidthCapacity;
            fullRedraw = fullRedraw && this._calculateAxisOffset();
            var temp = this._calculatePointHeight();
            fullRedraw = fullRedraw || temp;
            if (fullRedraw) {
                this._data = [];
                this._clearChartAndPoints();
                this._updateGrid(this._style.grid);
            }
        }
        
        if (totalData.length > 2) this._moveExtreme();
        
        var offset = totalData.length > this._widthCapacity ? 0 : Math.max(this._data.length - 1, 0);
        var offsetX = offset * this._point.width;
        var lengthData = Math.min(totalData.length - offset, this._pointsWidthCapacity);
        data = totalData.slice(-lengthData);
        
        if (data.length == this._pointsWidthCapacity) this._clearChartAndPoints();
        this._drawChart(offsetX, this._point.width, data, this._style.chart);
        this._data = totalData.length >= this._pointsWidthCapacity ? totalData.slice(-this._widthCapacity) : totalData;
    };
    
    p.clear = function() {
        this._data = [];
        this._clearChartAndPoints();
        this._extremeMax = {value: Number.MIN_VALUE, age: this._widthCapacity};
        this._extremeMin = {value: Number.MAX_VALUE, age: this._widthCapacity};
        this._moveExtreme();
    };
    
    p.setStyle = function(style) {
        this._style = style;
        this.updateStyle();
    };
    
    p.updateStyle = function() {
        this._drawBackgroundShape(this._size, this._style.background);
        this._drawAxisShape(this._size, this._style.axis);
        this._updateGrid(this._style.grid);
        this._updateExtreme(this._style.extreme);
        
        var boundsKey = this._style.chart.bounds;
        this._isDrawPoints = boundsKey == "points" || boundsKey == "full";
        var isMaskDisplay = boundsKey != "chart" && boundsKey != "full";
        var maskOffset = this._style.axis.thickness / 2;
        if (!isMaskDisplay) return;
        this._drawMaskShape(maskOffset, 0, this._size.width - maskOffset, this._size.height - maskOffset);
    };
    
    //
    //  PRIVATE METHODS (VIEW)
    //
    
    p._drawChart = function(offsetX, stepX, data, style) {
        var mult = this._pointHeight;
        var aX, aY, bX, bY;
        aX = offsetX;
        aY = this._applyOffset(data[0]) * mult;
        if (!offsetX) this._drawPoint(0, aY, "standart", style);
        this._chartShape.graphics.setStrokeStyle(style.thickness);
        for (var i = 0; i < data.length - 1; i++) {
            bX = offsetX + stepX * (i + 1);
            bY = this._applyOffset(data[i + 1]) * mult;
            this._drawSegment(aX, aY, bX, bY, style);
            this._drawPoint(bX, bY, "standart", style);
            aX = bX;
            aY = bY;
        }
        this._chartShape.graphics.endStroke();
    };
    
    p._drawSegment = function(aX, aY, bX, bY, style) {
        var graphics = this._chartShape.graphics;
        
        graphics.beginStroke(style.color);
        graphics.moveTo(aX, this._size.height - aY).lineTo(bX, this._size.height - bY);
    };
    
    p._drawPoint = function(x, y, type, style) {
        var graphics = this._pointShape.graphics;
        if (!style.radius) return;
        if (!this._isDrawPoints && !this._isInsideBounds(x, y)) return;
        switch(type) {
        case "selected":
            graphics.setStrokeStyle(style.thickness, "round");
            graphics.beginStroke(style.color);
            graphics.drawCircle(x, this._size.height - y, style.radius);
            graphics.endStroke();
            break;
        case "standart":
            graphics.beginFill(style.color);
            graphics.drawCircle(x, this._size.height - y, style.radius);
            graphics.endFill();
            break;
        default:
            break;
        }
    };
    
    p._drawBackgroundShape = function(size, style) {
        var graphics = this._backgroundShape.graphics.clear();
        if (!style.alpha) return;
        graphics.beginFill(style.color);
        graphics.drawRoundRect(0, 0, size.width, size.height, 3);
        this._backgroundShape.alpha = style.alpha;
    };
    
    p._drawAxisShape = function(size, style) {
        var graphics = this._axisShape.graphics.clear();
        if (!style.alpha) return;
        graphics.setStrokeStyle(style.thickness, "butt").beginStroke(style.color);
        graphics.moveTo(0, 0).lineTo(0, size.height).lineTo(size.width, size.height);
        graphics.endStroke();
        this._axisShape.alpha = style.alpha;
    };
    
    p._updateGrid = function(style) {
        var stepX = this._point.width * this._style.grid.width;
        var stepY = this._pointHeight * this._style.grid.height;
        this._drawGridShape(stepX, stepY, style);
    };
    
    p._drawGridShape = function(stepX, stepY, style) {
        var graphics = this._gridShape.graphics.clear();
        if (!style.alpha) return;
        graphics.setStrokeDash(style.dash);
        graphics.setStrokeStyle(style.thickness, "butt").beginStroke(style.color);
        if (stepX !== 0) {
            for (var x = stepX; x < this._size.width; x += stepX) {
                graphics.moveTo(x, 0).lineTo(x, this._size.height);
            }
        }
        var gridOffset = (this._axisOffset * this._pointHeight) % stepY;
        gridOffset += stepY;
        if (stepY !== 0) {
            for (var y = this._size.height - gridOffset; y > 0; y -= stepY) {
                graphics.moveTo(0, y).lineTo(this._size.width, y);
            }
        }
        graphics.endStroke();
        this._gridShape.alpha = style.alpha;
    };
    
    p._drawLevelLine = function(shape, thickness, color) {
        var graphics = shape.graphics.clear();
        graphics.setStrokeStyle(thickness, "butt").beginStroke(color);
        graphics.moveTo(0, 0).lineTo(this._size.width, 0).endStroke();
    };
    
    p._drawMaskShape = function(x, y, width, height) {
        this._chartShape.mask = new createjs.Shape();
        this._chartShape.mask.graphics.beginFill("#000000");
        this._chartShape.mask.graphics.drawRect(x, y, width, height);
    };
    
    p._updateExtreme = function(style) {
        var extremeAlpha = style.alpha;
        var extremeThickness = style.thickness;
        if (extremeAlpha) {
            this._minShape.alpha = this._maxShape.alpha = extremeAlpha;
            this._drawLevelLine(this._maxShape, extremeThickness, style.maxColor);
            this._drawLevelLine(this._minShape, extremeThickness, style.minColor);
            this._moveExtreme();
        }
    };
    
    p._moveExtreme = function() {
        this._maxShape.y = this._size.height - this._applyOffset(this._extremeMax.value) * this._pointHeight;
        this._minShape.y = this._size.height - this._applyOffset(this._extremeMin.value) * this._pointHeight;
        this._maxShape.visible = this._isInsideBounds(0, this._maxShape.y);
        this._minShape.visible = this._isInsideBounds(0, this._minShape.y);
    };
    
    p._clearChartAndPoints = function() {
        this._chartShape.graphics.clear();
        this._pointShape.graphics.clear();
    };
    
    //
    //  PRIVATE METHODS (UTILS)
    //
    
    p._calculateAxisOffset = function() {
        var tempOffset = this._extremeMin.value - this._axis.dynamicSpace.bottom;
        tempOffset = Math.min(tempOffset, this._axis.offset);
        var result = this._axisOffset != tempOffset;
        this._axisOffset = tempOffset;
        return result;
    };
    
    p._calculatePointHeight = function() {
        var newPointHeight = this._pointHeight;
        newPointHeight *= this._heightCapacity / this._applyOffset(this._extremeMax.value + this._axis.dynamicSpace.bottom);
        newPointHeight = Math.min(newPointHeight, this._point.height);
        if (newPointHeight < this._point.height) {
            this._heightCapacity = Math.floor(this._size.height / newPointHeight);
        }
        var result = this._pointHeight != newPointHeight;
        this._pointHeight = newPointHeight;
        return result;
    };
    
    p._applyOffset = function(y) {
        return y - this._axisOffset;
    };
    
    p._isInsideBounds = function(x, y) {
        return x >= 0 && x <= this._size.width
            && y >= 0 && y <= this._size.height;
    };
    
    p._processExtreme = function(data, length) { //TODO: optimize!
        if (!data.length) return;
        this._extremeMax.value = Math.max.apply(Math, data);
        this._extremeMax.age = 0;
        this._extremeMin.value = Math.min.apply(Math, data);
        this._extremeMin.age = 0;
    };
    
    //  ---
    charts.StreamingChart = createjs.promote(StreamingChart, "Container");
}());