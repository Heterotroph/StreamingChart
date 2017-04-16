(function() {

    /**
     * size: {width: 500, height: 400}
     * segments: {countX: 10, minCountY: 10}
     * style: {
     *  background: {color: "#000000", alpha: 0.5},
     *  axis: {thickness: 3, color: "#FF0000", alpha: 1}
     * }
     */ 
    function Chart(size, segments, style) {
        this.Container_constructor();
        
        this.size = size;
        this.segments = segments;
        this.style = style;
        
        this.backgroundShape = new createjs.Shape();
        this.axisShape = new createjs.Shape();
        this.gridShape = new createjs.Shape();
        this.chartShape = new createjs.Shape();
        
        this._setup();
    }
    
    var p = createjs.extend(Chart, createjs.Container);
    
    //PUBLIC METHODS
    
    p.append = function(data) {
        
    };
    
    p.setStyle = function(style) {
        this.style = style;
        //_updateBackgroundStyle();
        //_updateAxisStyle();
    };
    
    //PRIVATE METHODS
    
    p._setup = function(size, segments) {
        this._updateBackgroundStyle(this.size, this.style.background);
        this.addChild(this.backgroundShape);
        this._updateAxisStyle(this.size, this.style.axis);
        this.addChild(this.axisShape);
    };
    
    p._updateBackgroundStyle = function(size, style) {
        var graphics = this.backgroundShape.graphics.clear();
        graphics.beginFill(style.color);
        graphics.drawRoundRect(0, 0, size.width, size.height, 3);
        this.backgroundShape.alpha = style.alpha;
    };
    
    p._updateAxisStyle = function(size, style) {
        var graphics = this.axisShape.graphics.clear();
        graphics.setStrokeStyle(style.thickness, "butt").beginStroke(style.color);
        graphics.moveTo(0,0).lineTo(0, size.height).lineTo(size.width, size.height);
        graphics.endStroke();
        this.axisShape.alpha = style.alpha;
    };
    
    // ---
    
    window.Chart = createjs.promote(Chart, "Container");
}());