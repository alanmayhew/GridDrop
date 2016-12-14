var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

var gameState = null;
var gridDim = -1;
var gridSize = -1;
var nextPieceNumber = 1;
var piecesContainer = null;

const TOPBAR_PERCENT = 0.15;

// TODO: eventually grid graphics should probably go in a Container so that it
//  can be its own element with stuff above
//  for score, next piece to drop, etc...

function init(gridDimIn){
    gridDim = gridDimIn;
    gameState = new Grid(gridDim);

    var canvasWidth = stage.canvas.width;
    var canvasHeight = stage.canvas.height;
    var gridOffset = canvasHeight * TOPBAR_PERCENT;
    gridSize = canvasHeight - gridOffset;

    var rectWidth = gridSize / gridDim;
    var rectHeight = gridSize;

    var gridContainer = new createjs.Container();
    gridContainer.x = 0;
    gridContainer.y = gridOffset;
    piecesContainer = new createjs.Container();
    piecesContainer.x = 0;
    piecesContainer.y = gridOffset;
    var gridLines = new createjs.Shape();
    gridLines.x = 0;
    gridLines.y = 0;
    gridLines.graphics.setStrokeStyle(1);
    gridLines.graphics.beginStroke("black").drawRect(0,0, gridSize, gridSize);
    for (var i=0; i<gridDim; ++i){
        // columns
        var col = new createjs.Shape();
        col.baseColor = "#eee";
        col.overColor = "#ccc";
        col.clickColor = "#999";
        col.graphics.beginFill(col.baseColor).drawRect(0, 0, rectWidth, rectHeight).endFill();
        col.width = rectWidth;
        col.height = rectHeight;
        col.col_id = i;
        col.x = i*rectWidth;
        col.y = 0;
        col.addEventListener("mouseover", gridMouseOver);
        col.addEventListener("mouseout", gridMouseOut);
        col.addEventListener("click", gridClick);
        gridContainer.addChild(col);

        // borders
        if (i == 0) continue;
        var xval = i*rectWidth - 0.5;
        gridLines.graphics.moveTo(xval, -0.5).lineTo(xval, rectHeight+0.5);
        gridLines.graphics.moveTo(-0.5, xval).lineTo(rectHeight+0.5, xval);
    }
    gridLines.graphics.endStroke();
    gridContainer.addChild(gridLines);
    stage.addChild(gridContainer);
    stage.addChild(piecesContainer);
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
    var squareDim = gridSize / gridDim;
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
    newPiece.y = (gridDim-row-1)*squareDim;
    piecesContainer.addChild(newPiece);
}

function handleKeyDown(event){
    var kc = event.keyCode;
    if (kc == 71){ // g
        var removed = gameState.findAndRemoveGroups(piecesContainer);
        console.log("%d removed", removed);
    }
    // number keys 1-9
    var num = kc - 48;
    if (1 <= num && num <= 9 && num <= gridDim){
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
