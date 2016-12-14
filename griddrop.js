var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

var gameState = null;
var gridSize = -1;
var nextPieceNumber = 1;

// TODO: eventually grid graphics should probably go in a Container so that it
//  can be its own element with stuff above
//  for score, next piece to drop, etc...

function init(gridSizeIn){
    gridSize = gridSizeIn;
    gameState = new Grid(gridSize);
    var width = stage.canvas.width / gridSize;
    var height = stage.canvas.height;
    var gridLines = new createjs.Shape();
    gridLines.x = 0;
    gridLines.y = 0;
    gridLines.graphics.setStrokeStyle(1);
    gridLines.graphics.beginStroke("black").drawRect(0,0,stage.canvas.width, height);
    for (var i=0; i<gridSize; ++i){
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
    document.addEventListener("keydown", handleKeyDown);
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
    var col = event.target.col_id;
    var newPiece = generatePiece(nextPieceNumber);
    var row = gameState.dropInColumn(col,newPiece);
    if (row == -1){
        return;
    }
    var squareDim = stage.canvas.width / gridSize;
    var circle = new createjs.Shape();
    var offset = squareDim / 2;
    var radius = offset * 0.9;
    circle.graphics.beginFill("#f00").drawCircle(0, 0, radius).endFill();
    circle.x = offset;
    circle.y = offset;
    // TODO dynamic font size
    var text = new createjs.Text(newPiece.numberVal.toString(),"40px Arial", "#fff");
    var b = text.getBounds();
    text.x = offset - b.width/2;
    text.y = offset - b.height/2;
    newPiece.addChild(circle, text);
    newPiece.x = col*squareDim;
    newPiece.y = (gridSize-row-1)*squareDim;
    stage.addChild(newPiece);
}

function handleKeyDown(event){
    var kc = event.keyCode;
    if (kc == 71){ // g
        var removed = gameState.findAndRemoveGroups(stage);
        console.log("%d removed", removed);
    }
    // number keys 1-9
    var num = kc - 48;
    if (1 <= num && num <= 9 && num <= gridSize){
        nextPieceNumber = num;
    }
}

function generatePiece(number){
    var piece = new createjs.Container();
    piece.numberVal = number;
    return piece;
}

createjs.Ticker.setFPS(30);
createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(event){
    stage.update();
}
