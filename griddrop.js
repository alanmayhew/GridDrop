var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

var gameState = null;

function init(gridsize){
    // gameState = new Grid(gridsize);
    var width = stage.canvas.width / gridsize;
    var height = stage.canvas.height;
    var gridLines = new createjs.Shape();
    gridLines.x = 0;
    gridLines.y = 0;
    gridLines.graphics.setStrokeStyle(1);
    gridLines.graphics.beginStroke("black").drawRect(0,0,stage.canvas.width, height);
    for (var i=0; i<gridsize; ++i){
        // columns
        var col = new createjs.Shape();
        col.baseColor = "#eee";
        col.overColor = "#ccc";
        col.clickColor = "#999";
        col.graphics.beginFill(col.baseColor).drawRect(0, 0, width, height).endFill();
        col.width = width;
        col.height = height;
        col.col_id = i;
        col.x = i*width;
        col.y = 0;
        col.addEventListener("mouseover", gridMouseOver);
        col.addEventListener("mouseout", gridMouseOut);
        col.addEventListener("click", gridClick);
        stage.addChild(col);

        // borders
        if (i == 0) continue;
        var xval = i*width - 0.5;
        gridLines.graphics.moveTo(xval, -0.5).lineTo(xval, height+0.5);
        gridLines.graphics.moveTo(-0.5, xval).lineTo(height+0.5, xval);
    }
    gridLines.graphics.endStroke();
    stage.addChild(gridLines);
}

function canClick(){
    // return true if the user can click on stuff
    // (eventually check the state of the Grid object)
    return true;
}

function gridMouseOver(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.overColor).drawRect(0, 0, target.width, target.height).endFill();
}

function gridMouseOut(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.baseColor).drawRect(0, 0, target.width, target.height).endFill();
}

function gridClick(event){
    if (!canClick()) return;
    var target = event.target;
    console.log("clicked column:",target.col_id);
}

createjs.Ticker.setFPS(30);
createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(event){
    stage.update();
}
