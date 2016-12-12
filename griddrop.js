var stage = new createjs.Stage("mainCanvas");
var cols = [];
function init(gridsize){
    var width = stage.canvas.width / gridsize;
    var height = stage.canvas.height;
    for (var i=0; i<gridsize; ++i){
        var col = new createjs.Shape();
        col.graphics.beginFill("rgba(130,130,130,0.5)").drawRect(0, 0, width, height);
        col.x = i*width;
        console.log(col.x);
        col.y = 0;
        cols.push(col);
        stage.addChild(col);
    }
    stage.update();

    document.onkeydown = handleKeyDown;
    document.onkeyup = handleKeyUp;
    document.onmousedown = handleKeyDown;
    document.onmouseup = handleKeyUp;
}

function handleKeyDown(e){

}

function handleKeyUp(e){

}

// createjs.Ticker.setFPS(30);
// createjs.Ticker.addEventListener("tick", handleTick);
// function handleTick(e){
//     stage.update();
// }
