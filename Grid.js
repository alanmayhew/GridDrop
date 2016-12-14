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
Grid.prototype.findAndRemoveGroups = function(piecesContainer){
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
            if (cell.numberVal == len){
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
                groupVals.push(cell.numberVal);
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
    // to actually remove the cells, first we sort it in descending order with
    // column taking priority over row (some div/mod shenanigans to make it
    // easy) and then we can safely remove things from the column lists without
    // causing issues with subsequent indices not pointing to the correct spot
    matchingCells.sort(function(a,b){return b-a});
    var prev = -1;
    for (var i=0; i<matchingCells.length; ++i){
        var val = matchingCells[i];
        if (val == prev) continue;
        prev = val;
        var col = Math.floor(val/this.dim);
        var row = val % this.dim;
        cell = this.columns[col][row];
        piecesContainer.removeChild(cell);
        this.columns[col].splice(row,1);
        ++numRemoved;
    }
    return numRemoved;
}

Grid.prototype.gravity = function(){
}

Grid.prototype.update = function(){
}
