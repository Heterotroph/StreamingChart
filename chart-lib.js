var charts = {};

(function() {

    /**
     * Example of arguments:
     *  size = {width: 1000, height: 400}
     *  point = {width: 50, height: 1}
     *  axis = {offset: 0, dynamicSpace: {top: 10, bottom: 0}, isDynamic: false}
     *  style = {
     *      background: {color: "#000000", alpha: 0.5},
     *      grid: {thickness: 1, color: "#00FFFF", alpha: 1, width: 1, height: 20, dash: [1, 0]},
     *      zero:  {thickness: 1, color: "#000000", alpha: 1},
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
        this._axisOffset = this._axis.offset;
        this._extremeMax = {value: -Number.MAX_VALUE, age: this._widthCapacity};
        this._extremeMin = {value: Number.MAX_VALUE, age: this._widthCapacity};
        this._isDrawPoints = false;
        
        //views
        this._backgroundShape = this.addChild(new createjs.Shape());
        this._gridShape = this.addChild(new createjs.Shape());
        this._zeroShape = this.addChild(new createjs.Shape());
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
        this._data = totalData.slice(-this._pointsWidthCapacity);
        
        this._searchExtreme(data);
        this._processExtreme();
        
        this._clearChartAndPoints();
        this._drawChart(0, this._point.width, this._data, this._style.chart);
    };
    
    p.clear = function() {
        this._data = [];
        this._clearChartAndPoints();
        this._extremeMax = {value: -Number.MAX_VALUE, age: this._widthCapacity};
        this._extremeMin = {value: Number.MAX_VALUE, age: this._widthCapacity};
        this._moveZero();
    };
    
    p.setStyle = function(style) {
        this._style = style;
        this.updateStyle();
    };
    
    p.updateStyle = function() {
        this._drawBackgroundShape(this._size, this._style.background);
        this._updateGrid(this._style.grid);
        this._drawZero(this._style.zero);
        
        var boundsKey = this._style.chart.bounds;
        this._isDrawPoints = boundsKey == "points" || boundsKey == "full";
        var isMaskDisplay = boundsKey != "chart" && boundsKey != "full";
        if (!isMaskDisplay) return;
        this._drawMaskShape(0, 0, this._size.width, this._size.height);
    };
    
    //
    //  PRIVATE METHODS (VIEW)
    //
    
    p._drawChart = function(offsetX, stepX, data, style) {
        var aX, aY, bX, bY;
        aX = offsetX;
        aY = this._applyOffset(data[0]) * this._pointHeight;
        if (!offsetX) this._drawPoint(0, aY, style);
        this._chartShape.graphics.setStrokeStyle(style.thickness).beginStroke(style.color);
        for (var i = 0; i < data.length - 1; i++) {
            bX = offsetX + stepX * (i + 1);
            bY = this._applyOffset(data[i + 1]) * this._pointHeight;
            this._drawSegment(aX, aY, bX, bY, style);
            this._drawPoint(bX, bY, style);
            aX = bX;
            aY = bY;
        }
        this._chartShape.graphics.endStroke();
    };
    
    p._drawSegment = function(aX, aY, bX, bY, style) {
        var graphics = this._chartShape.graphics;
        graphics.moveTo(aX, this._size.height - aY).lineTo(bX, this._size.height - bY);
    };
    
    p._drawPoint = function(x, y, style) {
        var graphics = this._pointShape.graphics;
        if (!style.radius) return;
        if (!this._isDrawPoints && !this._isInsideBounds(x, y)) return;
        graphics.beginFill(style.color);
        graphics.drawCircle(x, this._size.height - y, style.radius);
        graphics.endFill();
    };
    
    p._drawBackgroundShape = function(size, style) {
        var graphics = this._backgroundShape.graphics.clear();
        if (!style.alpha) return;
        graphics.beginFill(style.color);
        graphics.drawRoundRect(0, 0, size.width, size.height, 3);
        this._backgroundShape.alpha = style.alpha;
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
        if (stepX) {
            for (var x = stepX; x < this._size.width; x += stepX) {
                graphics.moveTo(x, 0).lineTo(x, this._size.height);
            }
        }
        var gridOffset = (-this._axisOffset * this._pointHeight) % stepY;
        gridOffset = gridOffset < 0 ? gridOffset + stepY : gridOffset;
        if (stepY) {
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
    
    p._drawZero = function(style) {
        if (!style.alpha) return;
        this._zeroShape.alpha = style.alpha;
        this._drawLevelLine(this._zeroShape, style.thickness, style.color);
        this._moveZero();
    };
    
    p._moveZero = function() {
        this._zeroShape.y = this._size.height - this._applyOffset(0) * this._pointHeight;
        this._zeroShape.visible = this._isInsideBounds(0, this._zeroShape.y);
    };
    
    p._processExtreme = function() {
        if (!this._axis.isDynamic) return;
        var isAxisOffsetChanged = this._calculateAxisOffset();
        var isPointHeightChanged = this._calculatePointHeight();
        if (!isAxisOffsetChanged && !isPointHeightChanged) return;
        this._updateGrid(this._style.grid);
        this._moveZero();
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
        var result = this._axisOffset != tempOffset;
        this._axisOffset = tempOffset;
        return result;
    };
    
    p._calculatePointHeight = function() {
        var newPointHeight = this._pointHeight;
        newPointHeight = this._size.height / this._applyOffset(this._extremeMax.value + this._axis.dynamicSpace.top);
        newPointHeight = Math.min(newPointHeight, this._size.height);
        this._heightCapacity = Math.floor(this._size.height / newPointHeight);
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
    
    p._searchExtreme = function(data) { //TODO: optimize!
        var newExtreme;
        this._extremeMax.age += data.length;
        this._extremeMin.age += data.length;
        var isOld = this._extremeMax.age >= this._pointsWidthCapacity;
        isOld = isOld || this._extremeMin.age >= this._pointsWidthCapacity;
        if (isOld || !data.length) {
            newExtreme = this._getExtreme(Number.MAX_VALUE, -Number.MAX_VALUE, this._data);
        } else {
            newExtreme = this._getExtreme(this._extremeMin.value, this._extremeMax.value, data);
        }
        this._extremeMin = newExtreme[0];
        this._extremeMax = newExtreme[1];
    };
    
    p._getExtreme = function(min, max, data) {
        var currentMax = {value: max, age: this._pointsWidthCapacity};
        var currentMin = {value: min, age: this._pointsWidthCapacity};
        for (var i = 0; i < data.length; i++) {
            currentMax.value = Math.max(currentMax.value, data[i]);
            if (currentMax.value == data[i]) currentMax.age = data.length - i - 1;
            currentMin.value = Math.min(currentMin.value, data[i]);
            if (currentMin.value == data[i]) currentMin.age = data.length - i - 1;
        }
        return [currentMin, currentMax];
    };
    
    //  ---
    charts.StreamingChart = createjs.promote(StreamingChart, "Container");
}());