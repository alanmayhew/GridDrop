var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

var gameState = null;
var gridDim = -1;
var gridSize = -1;
var squareDim = -1;
var nextPiece = null;
var piecesContainer = null;
var interfaceContainer = null;
var score = 0;
var scoreText = null;
var hueList = [];
var clickLock = true;
var level = -1;
var moveCount = -1;

const TOPBAR_PERCENT = 0.15;
const MOVES_PER_LEVEL = 20;

// TODO: move the grid drawing code and such to its own function
//          (for the sake of responding to window resizes?)

function init(gridDimIn){
    piecesContainer = new createjs.Container();
    gridDim = gridDimIn;
    gameState = new Grid(gridDim, piecesContainer);
    level = 1;
    moveCount = 0;

    for (var i=0; i<gridDim;  ++i){
        hueList.push(Math.floor(360 / gridDim * i));
    }

    var canvasWidth = stage.canvas.width;
    var canvasHeight = stage.canvas.height;
    var gridOffset = canvasHeight * TOPBAR_PERCENT;
    gridSize = canvasHeight - gridOffset;

    squareDim = gridSize / gridDim;
    var rectWidth = squareDim;
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
    nextPiece = generateRandomPiece(rectWidth, 1, gridDim);
    // nextPiece = generateGrey(4, rectWidth);
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
    clickLock = false;
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
    console.log("dropping piece");
    clickLock = true;
    var col = event.target.col_id;
    var row = gameState.dropInColumn(col,nextPiece);
    if (row == -1){
        clickLock = false;
        return;
    }
    ++moveCount;
    var nx = nextPiece.x;
    var ny = nextPiece.y;
    stage.removeChild(nextPiece);
    nextPiece.x = col * squareDim;
    // nextPiece.y = (gridDim-row-1)*squareDim;
    piecesContainer.addChild(nextPiece);
    gameState.animateFall(nextPiece, {y:(gridDim-row-1)*squareDim}, 300);
    setTimeout(clearMatches, 300, 1);
    nextPiece = generateRandomPiece(squareDim, -1, 7);
    nextPiece.x = nx;
    nextPiece.y = ny;
    stage.addChild(nextPiece);
}

function clearMatches(mult){
    /*
     * we're done if:
     *  - nothing was removed
     *
     * if anything was removed:
     *  - if anything fell:
     *      - wait for falling animations, then call this fucntion again
     *  - if nothing fell:
     *      - just call this function again with no delay
     */
    console.log("clearing matches (mult=%d)", mult);
    var removed = gameState.findAndRemoveGroups(squareDim);
    score += removed * (mult++);
    if (removed == 0){
        checkAndAddRow();
        return;
    }
    var fell = gameState.updatePieceHeights(squareDim);
    var delay = 300;
    if (fell == 0){
        delay = 10;
    }
    setTimeout(clearMatches, delay, mult);
}

// TODO: check somewhere if we need to add a row of greys

function checkAndAddRow(){
    var delay = 0;
    if (moveCount % MOVES_PER_LEVEL == 0){
        if ( !(gameState.topRowIsEmpty()) ){
            // TODO: lose
            unlockClick();
            console.log("you lose");
            return;
        }
        gameState.addGreyRow(squareDim);
        delay = 300;
    }
    setTimeout(unlockClick, delay);
}

function unlockClick(){
    clickLock = false;
}

function handleKeyDown(event){
    var kc = event.keyCode;
    if (kc == 32){
        gameState.addGreyRow(gridSize/gridDim);
    }
}

function generateRandomPiece(squareDim, min, max){
    randomPieceNumber = Math.floor(Math.random() * max)+min;
    if (randomPieceNumber <= 0){
        if (randomPieceNumber == 0) --randomPieceNumber;
        return generateGrey(randomPieceNumber, squareDim);
    }
    return generatePiece(randomPieceNumber, squareDim);
}

function generateGrey(toughness, squareDim){
    if (toughness > 0){
        console.log("ERROR: GREY TOUGHNESS CANNOT BE POSITIVE");
        return;
    }
    var piece = new createjs.Container();
    piece.numberValue = toughness;
    var baseCircle = new createjs.Shape();
    var offset = squareDim / 2;
    var radius = offset * 0.9;
    var color = "#666";
    baseCircle.graphics.beginFill(color).drawCircle(0, 0, radius).endFill();
    baseCircle.x = offset;
    baseCircle.y = offset;
    piece.addChild(baseCircle);
    if (toughness < 0){
        var minR = 0.2 * radius;
        var maxR = 0.85 * radius;
        var dR = (maxR - minR) / toughness;
        for (var i=0; i<-toughness; ++i){
            var circle = new createjs.Shape();
            // var r = minR + i*dR;
            var r = maxR - i*dR;
            circle.graphics.setStrokeStyle(3).beginStroke("black").drawCircle(0, 0, r);
            circle.x = offset;
            circle.y = offset;
            piece.addChild(circle);
        }
    }
    return piece;
}

function generatePiece(number, squareDim){
    var newPiece = new createjs.Container();
    newPiece.numberValue = number;
    var circle = new createjs.Shape();
    var offset = squareDim / 2;
    var radius = offset * 0.9;
    var color = "hsl(" + hueList[number-1].toString() + ", 100%, 50%)";
    // circle.graphics.beginFill(color).drawCircle(0, 0, radius).endFill();
    var command = circle.graphics.beginFill(color).command;
    circle.graphics.drawCircle(0, 0, radius).endFill();
    newPiece.colorCommand = command;
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
