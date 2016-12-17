var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

var gameState = null;
var gridDim = -1;
var gridSize = -1;
var nextPiece = null;
var piecesContainer = null;
var interfaceContainer = null;
var score = 0;
var scoreText = null;
var hueList = [];
var clickLock = false;

const TOPBAR_PERCENT = 0.15;

function init(gridDimIn){
    gridDim = gridDimIn;
    gameState = new Grid(gridDim);

    for (var i=0; i<gridDim;  ++i){
        hueList.push(Math.floor(360 / gridDim * i));
    }

    var canvasWidth = stage.canvas.width;
    var canvasHeight = stage.canvas.height;
    var gridOffset = canvasHeight * TOPBAR_PERCENT;
    gridSize = canvasHeight - gridOffset;

    var rectWidth = gridSize / gridDim;
    var rectHeight = gridSize;

    var interfaceContainer = new createjs.Container();
    interfaceContainer.x = 0;
    interfaceContainer.y = 0;
    // TODO: dynamic font size
    scoreText = new createjs.Text("Score: ","20px Arial", "#000");
    scoreText.x = 0;
    scoreText.y = 0;
    interfaceContainer.addChild(scoreText);
    var numOffset = scoreText.getBounds().width;
    scoreText = new createjs.Text("","20px Arial", "#000");
    scoreText.x = numOffset;
    scoreText.y = 0;
    interfaceContainer.addChild(scoreText);
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
    nextPiece = generateRandomPiece(rectWidth);
    nextPiece.x = rectWidth * (gridDim - 1);
    nextPiece.y = 0;
    gridContainer.addChild(gridLines);
    stage.addChild(gridContainer);
    stage.addChild(interfaceContainer);
    stage.addChild(nextPiece);
    stage.addChild(piecesContainer);
    document.addEventListener("keydown", handleKeyDown);
    createjs.Ticker.setFPS(30);
    createjs.Ticker.addEventListener("tick", handleTick);
}

function canClick(){
    // return true if the user can click on stuff
    return !clickLock;
}

function gridMouseOver(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.overColor).drawRect(0, 0, target.width, target.height).endFill();
    if (nextPiece != null){
        var col = target.col_id;
        nextPiece.x = col * gridSize / gridDim;
    }
}

function gridMouseOut(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.baseColor).drawRect(0, 0, target.width, target.height).endFill();
}

function gridClick(event){
    if (!canClick()) return;
    clickLock = true;
    var col = event.target.col_id;
    var row = gameState.dropInColumn(col,nextPiece);
    if (row == -1){
        clickLock = false;
        return;
    }
    var squareDim = gridSize / gridDim;
    var nx = nextPiece.x;
    var ny = nextPiece.y;
    stage.removeChild(nextPiece);
    nextPiece.x = col * squareDim;
    // nextPiece.y = (gridDim-row-1)*squareDim;
    piecesContainer.addChild(nextPiece);
    gameState.animateFall(nextPiece, {y:(gridDim-row-1)*squareDim}, 300);
    setTimeout(clearMatches, 300, 1);
    // nextPiece = null;
    // var removed = 1;
    // var mult = 1;
    // while (removed != 0){
    //     removed = gameState.findAndRemoveGroups(piecesContainer);
    //     score += removed * (mult++);
    // }
    // gameState.updatePieceHeights(squareDim);
    nextPiece = generateRandomPiece(squareDim);
    nextPiece.x = nx;
    nextPiece.y = ny;
    stage.addChild(nextPiece);
    // clickLock = false;
}

/*
 * we're done if:
 *  - nothing was removed
 *  - something was removed but nothing fell
 *
 * if we're not done: (i.e. if something fell)
 *  - call a delayed version of this function again
 */
function clearMatches(mult){
    var removed = gameState.findAndRemoveGroups(piecesContainer);
    score += removed * (mult++);
    if (removed == 0){
        clickLock = false;
        return;
    }
    var fell = gameState.updatePieceHeights(gridSize/gridDim);
    if (fell == 0){
        clickLock = false;
        return;
    } else {
        // give the pieces time to fall, and then do this again
        setTimeout(clearMatches, 300, mult);
    }
}

function handleKeyDown(event){
    var kc = event.keyCode;
}

function generateRandomPiece(squareDim){
    randomPieceNumber = Math.floor(Math.random() * gridDim)+1;
    return generatePiece(randomPieceNumber, squareDim);
}

function generatePiece(number, squareDim){
    var newPiece = new createjs.Container();
    newPiece.numberValue = number;
    var circle = new createjs.Shape();
    var offset = squareDim / 2;
    var radius = offset * 0.9;
    var color = "hsl(" + hueList[number-1].toString() + ", 100%, 50%)";
    circle.graphics.beginFill(color).drawCircle(0, 0, radius).endFill();
    circle.x = offset;
    circle.y = offset;
    // TODO dynamic font size
    var text = new createjs.Text(number.toString(),"40px Arial", "#fff");
    var b = text.getBounds();
    text.x = offset - b.width/2;
    text.y = offset - b.height/2;
    newPiece.addChild(circle, text);
    return newPiece;
}

function handleTick(event){
    scoreText.text = score.toString();
    stage.update();
}
