(function() {

    function Chart(color) {
        this.Container_constructor();

        this.color = color;

        this.setup();
    }
    var p = createjs.extend(Chart, createjs.Container);


    p.setup = function() {
        var background = new createjs.Shape();
        background.graphics.beginFill(this.color).drawRoundRect(0, 0, 200, 100, 10);
        this.addChild(background);
    };

    window.Chart = createjs.promote(Chart, "Container");
}());