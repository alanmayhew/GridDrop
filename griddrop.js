var stage = new createjs.Stage("mainCanvas");
createjs.Touch.enable(stage);
stage.enableMouseOver(20);

function init(gridsize){
    var width = stage.canvas.width / gridsize;
    var height = stage.canvas.height;
    for (var i=0; i<gridsize; ++i){
        var col = new createjs.Shape();
        col.baseColor = "#eee";
        col.overColor = "#ccc";
        col.clickColor = "#999";
        col.graphics.beginFill(col.baseColor).drawRect(0, 0, width, height).endFill();
        col.width = width;
        col.height = height;
        col.x = i*width;
        col.y = 0;
        // col.onMouseOver = gridMouseOver;
        // col.onMouseOut = gridMouseOut;
        col.addEventListener("mouseover", gridMouseOver);
        col.addEventListener("mouseout", gridMouseOut);
        col.addEventListener("click", gridMouseClick);
        console.log(col);
        stage.addChild(col);
    }
    stage.update();

    // document.onkeydown = handleKeyDown;
    // document.onkeyup = handleKeyUp;
}


function gridMouseOver(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.overColor).drawRect(0, 0, target.width, target.height).endFill();
}

function gridMouseOut(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.baseColor).drawRect(0, 0, target.width, target.height).endFill();
}

function gridMouseClick(event){
    var target = event.target;
    target.graphics.clear().beginFill(target.clickColor).drawRect(0, 0, target.width, target.height).endFill();
}

// function handleKeyDown(event){
// 
// }
// 
// function handleKeyUp(event){
// 
// }

createjs.Ticker.setFPS(30);
createjs.Ticker.addEventListener("tick", handleTick);
function handleTick(event){
    stage.update();
}
