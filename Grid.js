/*
 
   Grid class
   
   representation of the game state

 +---+---+---+---+           [ 
 |   |   |   |   |         0  [ {3} ]
 +---+---+---+---+
 |   |   |   |   |         1  [ {1}, {4} ]
 +---+---+---+---+  ---->     
 |   | 4 |   |   |         2  [ ]
 +---+---+---+---+
 | 3 | 1 |   | 2 |         3  [ {2} ]
 +---+---+---+---+                         ]
 
- Grid.columns goes left (low index) to right (high).
- Columns are a stack of objects where lower index
    means lower row.

 */

function Grid(dim){
    this.dim = dim;
    this.columns = [];
    for (var i=0; i<dim; ++i){
        this.columns.push([]);
    }
}

// attempts to drop the piece in
// returns row it landed on (or -1 if it couldn't fit)
Grid.prototype.dropInColumn = function(col_num, piece){
    var col = this.columns[col_num];
    if (col.length >= this.dim) return -1;
    col.push(piece);
    return col.length-1;
}

// returns the number of groups removed
Grid.prototype.findAndRemoveGroups = function(piecesContainer, squareDim){
    var numRemoved = 0;
    var matchingCells = [];
    var cell = null;
    // a list of the column sizes, for checking for horizontal groups
    var lengthList = [];

    // check the columns, and also build a list of column lengths for later
    for (var c=0; c<this.dim; ++c){
        var col = this.columns[c];
        var len = col.length;
        lengthList.push(len);
        for (var r=0; r<len; ++r){
            cell = col[r];
            if (cell.numberValue == len){
                // matchingCells.push([c,r]);
                matchingCells.push(c*this.dim + r);
            }
        }
    }
    // row checking
    var topRow = Math.max.apply(Math, lengthList);
    for (var r=0; r<topRow; ++r){
        var groupVals = [];
        for (var c=0; c<this.dim; ++c){
            var col = this.columns[c];
            cell = null;
            if (lengthList[c] > r){
                cell = col[r];
                groupVals.push(cell.numberValue);
            }
            // if we just found the end of a group (or hit the end of the
            // board, check the group and flag for removal)
            if (cell == null || c == this.dim-1){
                var len = groupVals.length;
                for (var n=0; n<len; ++n){
                    if (groupVals[n] == len){
                        var nCol = c-len+n + (cell == null ? 0 : 1);
                        // matchingCells.push([nCol,r]);
                        matchingCells.push(nCol*this.dim + r);
                    }
                }
                groupVals = [];
            }
        }
    }
    // first, go through the matches and check their neighboring cells for
    // greys that need to get hit (BUT DON'T REMOVE THE MATCHED PIECES
    // YET BECAUSE IT CAN CAUSE WEIRD PROBLEMS)
    matchingCells.sort(function(a,b){return b-a});
    var prev = -1;
    for (var i=0; i<matchingCells.length; ++i){
        var val = matchingCells[i];
        if (val == prev) continue;
        prev = val;
        var col = Math.floor(val/this.dim);
        var row = val % this.dim;
        cell = this.columns[col][row];
        var neighbors = [val-1, val+1, val+this.dim, val-this.dim];
        for (var j=0; j<4; ++j){
            // debugger;
            var neighbor = neighbors[j];
            var ncol = Math.floor(neighbor/this.dim);
            var nrow = neighbor % this.dim;
            if (neighbor < 0 || neighbor >= this.dim * this.dim || (Math.abs(neighbor - val) > 1 && nrow != row)) continue;
            var neighborCell = this.columns[ncol][nrow];
            if (neighborCell == null) continue;
            var replacement = null;
            if (neighborCell.numberValue == 0){
                // debugger;
                replacement = generateRandomPiece(squareDim, 1, 7);
                ++numRemoved;
                console.log("grey destroyed by match of %d, replaced with %d", cell.numberValue, replacement.numberValue);
            } else if (neighborCell.numberValue < 0){
                // debugger;
                replacement = generateGrey(neighborCell.numberValue+1, squareDim);
                console.log("grey reduced by match of %d, new toughness value is %d", cell.numberValue, replacement.numberValue);
            }
            if (replacement != null){
                piecesContainer.removeChild(neighborCell);
                replacement.x = neighborCell.x;
                replacement.y = neighborCell.y;
                this.columns[ncol][nrow] = replacement;
                piecesContainer.addChild(replacement);
            }
        }
    }
    // now we actually use splice to get rid of the matches
    prev = -1;
    for (var i=0; i<matchingCells.length; ++i){
        var val = matchingCells[i];
        if (val == prev) continue;
        prev = val;
        var col = Math.floor(val/this.dim);
        var row = val % this.dim;
        cell = this.columns[col][row];
        // ================================================================================
        piecesContainer.removeChild(cell);
        this.columns[col].splice(row,1);
        ++numRemoved;
    }
    return numRemoved;
}

Grid.prototype.updatePieceHeights = function(squareDim){
    var numFell = 0;
    for (var c=0; c<this.dim; ++c){
        var col = this.columns[c];
        for (var r=0; r<col.length; ++r){
            var cell = col[r];
            // cell.y = squareDim * (this.dim - r - 1);
            var newY = squareDim * (this.dim - r - 1); 
            if (cell.y != newY){
                ++numFell;
            }
            // cell.y = newY;
            // createjs.Tween.get(cell).to({y: newY}, 300, createjs.Ease.getElasticOut(20,50));
            this.animateFall(cell, {y:newY}, 300);
        }
    }
    // console.log("%d fell", numFell);
    return numFell;
}

Grid.prototype.animateFall = function(piece, destObj, time){
    createjs.Tween.get(piece).to(destObj, time, createjs.Ease.getElasticOut(40, 100));
}

Grid.prototype.update = function(){
}
