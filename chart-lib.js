/**
 * @author R.Akhtyamov
 * StreamingChart
 */

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
     *      axisX:  {thickness: 1, color: "#000000", alpha: 1, offset: 0},
     *      chart: {
     *          lines: {thickness: 3, color: "#000000", alpha: 0.8, bounds: true},
     *          points:  {thickness: 3, radius: 2, lineColor: "#0000FF", fillColor: "#FF0000", alpha: 0.8, bounds: true}
     *      }
     *  }
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
        this._widthCapacity = 0;
        this._heightCapacity = 0;
        this._extremeMax = {value: -Number.MAX_VALUE, age: Number.MAX_VALUE};
        this._extremeMin = {value: Number.MAX_VALUE, age: Number.MAX_VALUE};
        
        //views
        this._backgroundShape = this.addChild(new createjs.Shape());
        this._gridShape = this.addChild(new createjs.Shape());
        this._axisXShape = this.addChild(new createjs.Shape());
        this._chartShape = this.addChild(new createjs.Shape());
        this._pointShape = this.addChild(new createjs.Shape());
        
        //apply style configuration
        this.redraw();
    }
    
    var p = createjs.extend(StreamingChart, createjs.Container);
    
    //
    //  PUBLIC METHODS
    //
    
    p.append = function(data) {
        if (data.length === 0) return;
        var totalData = this._data.concat(data);
        this._data = totalData.slice(-this._widthCapacity);
        
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
        this._moveAxisX(this._style.axisX.offset);
    };
    
    p.setStyle = function(style) {
        this._style = style;
        this.redraw();
    };
    
    p.redraw = function() {
        this._calculateCapacity();
        this._drawBackgroundShape(this._size, this._style.background);
        this._updateGrid(this._style.grid);
        this._drawAxisX(this._style.axisX);
        this._updateMask(this._style.chart.lines.bounds, this._size.width, this._size.height);
        this.append(this._data.splice(0, this._data.length));
    };
    
    p.setPoint = function(width, height) {
        this._point.width = width;
        this._point.height = height;
    };
    
    p.getPoint = function() {
        return {width: this._point.width, height: this._point.height};
    };
    
    p.setComplexSize = function(width, height) {
        var floatWidthCapacity = this._size.width /  this._point.width;
        var floatHeightCapacity = this._size.height / this._point.height;
        this.setSize(width, height);
        this.setPoint(this._size.width / floatWidthCapacity, this._size.height / floatHeightCapacity);
    };
    
    p.setSize = function(width, height) {
        this._size.width = width;
        this._size.height = height;
    };
    
    p.getSize = function() {
        return {width: this._size.width, height: this._size.height};
    };
    
    p.getData = function() {
        return this._data.slice();
    };
    
    p.getInterpolatedValue = function(index) {
        index = Math.round(index * 100) / 100;
        index = Math.min(index, this._data.length - 1);
        index = Math.max(index, 0);
        var intIndex = Math.floor(index);
        if (intIndex == index) return this._data[index];
        var delta = this._data[intIndex + 1] - this._data[intIndex];
        return this._data[intIndex] + delta * (index - intIndex);
    };
    
    p.getInterpolatedValueByLocalX = function(localX) {
        var index = this.getIndexByLocalX(localX);
        return this.getInterpolatedValue(index);
    };
    
    p.getExtreme = function() {
        var indexCapacity = Math.min(this._data.length, this._widthCapacity) - 1;
        var min = {
            value: this._extremeMin.value,
            index: indexCapacity - this._extremeMin.age
        };
        var max = {
            value: this._extremeMax.value,
            index: indexCapacity - this._extremeMax.age
        };
        return {min: min, max: max};
    };
    
    p.getIndexByLocalX = function(localX) {
        return localX / this._point.width;
    };
    
    p.getLocalXByIndex = function(index) {
        var localX = index * this._point.width;
        return Math.round(localX);
    };
    
    p.getValueByLocalY = function(localY) {
        return (this._size.height - localY) / this._point.height + this._axis.offset;
    };
    
    p.getLocalYByValue = function(value) {
        var localY = this._size.height - (this._applyOffset(value) * this._point.height);
        return Math.round(localY);
    };
    
    //
    //  PRIVATE METHODS (VIEW)
    //
    
    p._drawChart = function(offsetX, stepX, data, style) {
        var aX, aY, bX, bY;
        aX = offsetX;
        aY = this._applyOffset(data[0]) * this._point.height;
        this._chartShape.graphics.setStrokeStyle(style.lines.thickness).beginStroke(style.lines.color);
        this._pointShape.graphics.setStrokeStyle(style.points.thickness).beginStroke(style.points.lineColor);
        if (offsetX === 0) this._drawPoint(0, Math.round(aY), style.points);
        for (var i = 0; i < data.length - 1; i++) {
            bX = Math.round(offsetX + stepX * (i + 1));
            bY = Math.round(this._applyOffset(data[i + 1]) * this._point.height);
            this._drawSegment(aX, aY, bX, bY, style.lines);
            this._drawPoint(bX, bY, style.points);
            aX = bX;
            aY = bY;
        }
        this._chartShape.graphics.endStroke();
        this._pointShape.graphics.endStroke();
    };
    
    p._drawSegment = function(aX, aY, bX, bY, style) {
        var graphics = this._chartShape.graphics;
        graphics.moveTo(aX, this._size.height - aY).lineTo(bX, this._size.height - bY);
    };
    
    p._drawPoint = function(x, y, style) {
        var graphics = this._pointShape.graphics;
        if (style.radius === 0) return;
        if (style.bounds && !this._isInsideBounds(x, y)) return;
        graphics.beginFill(style.fillColor);
        graphics.drawCircle(x, this._size.height - y, style.radius);
        graphics.endFill();
    };
    
    p._drawBackgroundShape = function(size, style) {
        var graphics = this._backgroundShape.graphics.clear();
        if (style.alpha === 0) return;
        graphics.beginFill(style.color);
        graphics.drawRoundRect(0, 0, size.width, size.height, 3);
        this._backgroundShape.alpha = style.alpha;
    };
    
    p._updateGrid = function(style) {
        var stepX = this._point.width * this._style.grid.width;
        var stepY = this._point.height * this._style.grid.height;
        this._drawGridShape(stepX, stepY, style);
    };
    
    p._drawGridShape = function(stepX, stepY, style) {
        var graphics = this._gridShape.graphics.clear();
        if (style.alpha === 0) return;
        graphics.setStrokeDash(style.dash);
        graphics.setStrokeStyle(style.thickness).beginStroke(style.color);
        if (stepX) {
            for (var x = stepX; x < this._size.width; x += stepX) {
                graphics.moveTo(x, 0).lineTo(x, this._size.height);
            }
        }
        var gridOffset = (-this._axis.offset * this._point.height) % stepY;
        gridOffset = gridOffset < 0 ? gridOffset + stepY : gridOffset;
        if (stepY) {
            for (var y = this._size.height - gridOffset; y >= 0; y -= stepY) {
                graphics.moveTo(0, y).lineTo(this._size.width, y);
            }
        }
        graphics.endStroke();
        this._gridShape.alpha = style.alpha;
    };
    
    p._updateMask = function(bounds, width, height) {
        if (bounds) {
            this._drawMaskShape(0, 0, width, height);
        } else {
            this._chartShape.mask = null;
        }
    };
    
    p._drawMaskShape = function(x, y, width, height) {
        this._chartShape.mask = new createjs.Shape();
        this._chartShape.mask.graphics.beginFill("#000000");
        this._chartShape.mask.graphics.drawRect(x, y, width, height);
    };
    
    p._drawLevelLine = function(shape, thickness, color) {
        var graphics = shape.graphics.clear();
        graphics.setStrokeStyle(thickness).beginStroke(color);
        graphics.moveTo(0, 0).lineTo(this._size.width, 0).endStroke();
    };
    
    p._drawAxisX = function(style) {
        if (style.alpha === 0) return;
        this._axisXShape.alpha = style.alpha;
        this._drawLevelLine(this._axisXShape, style.thickness, style.color);
        this._moveAxisX(style.offset);
    };
    
    p._moveAxisX = function(offset) {
        this._axisXShape.y = this._size.height - this._applyOffset(offset) * this._point.height;
        this._axisXShape.visible = this._isInsideBounds(0, this._axisXShape.y);
    };
    
    p._processExtreme = function() {
        if (!this._axis.isDynamic) return;
        var isAxisOffsetChanged = this._calculateAxisOffset();
        var isPointHeightChanged = this._calculatePointHeight();
        if (!isAxisOffsetChanged && !isPointHeightChanged) return;
        this._updateGrid(this._style.grid);
        this._moveAxisX(this._style.axisX.offset);
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
        var result = this._axis.offset != tempOffset;
        this._axis.offset = tempOffset;
        return result;
    };
    
    p._calculatePointHeight = function() {
        var newPointHeight = this._point.height;
        newPointHeight = this._size.height / this._applyOffset(this._extremeMax.value + this._axis.dynamicSpace.top);
        newPointHeight = Math.min(newPointHeight, this._size.height);
        var result = this._point.height != newPointHeight;
        this._point.height = newPointHeight;
        this._calculateCapacity();
        return result;
    };
    
    p._calculateCapacity = function() {
        this._widthCapacity = Math.floor(this._size.width /  this._point.width) + 1;
        this._heightCapacity = Math.floor(this._size.height / this._point.height) + 1;
    };
    
    p._applyOffset = function(y) {
        return y - this._axis.offset;
    };
    
    p._isInsideBounds = function(x, y) {
        return x >= 0 && x <= this._size.width
            && y >= 0 && y <= this._size.height;
    };
    
    p._searchExtreme = function(data) {
        var newExtreme;
        this._extremeMax.age += data.length;
        this._extremeMin.age += data.length;
        var isOld = this._extremeMax.age >= this._widthCapacity;
        isOld = isOld || this._extremeMin.age >= this._widthCapacity;
        if (isOld || !data.length) {
            newExtreme = this._getExtreme(Number.MAX_VALUE, -Number.MAX_VALUE, this._data);
        } else {
            newExtreme = this._getExtreme(this._extremeMin.value, this._extremeMax.value, data);
        }
        this._extremeMin = newExtreme.min;
        this._extremeMax = newExtreme.max;
    };
    
    p._getExtreme = function(min, max, data) {
        var currentMax = {value: max, age: this._widthCapacity};
        var currentMin = {value: min, age: this._widthCapacity};
        for (var i = 0; i < data.length; i++) {
            currentMax.value = Math.max(currentMax.value, data[i]);
            if (currentMax.value == data[i]) currentMax.age = data.length - i - 1;
            currentMin.value = Math.min(currentMin.value, data[i]);
            if (currentMin.value == data[i]) currentMin.age = data.length - i - 1;
        }
        return {min: currentMin, max: currentMax};
    };
    
    //  ---
    charts.StreamingChart = createjs.promote(StreamingChart, "Container");
}());