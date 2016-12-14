/*
 
   Grid class
   
   representation of the game state

 +---+---+---+---+           [ 
 |   |   |   |   |         0  [ null, null, null, {obj}  ]
 +---+---+---+---+
 |   |   |   |   |         1  [ null, null, {obj}, {obj} ]
 +---+---+---+---+  ---->     
 |   | o |   |   |         2  [ null, null, null, null   ]
 +---+---+---+---+
 | o | o |   | o |         3  [ null, null, null, {obj}  ]
 +---+---+---+---+                                        ]
 
                            Grid.columns goes left (low index) to right (high)
                            Columns go top (low index) to bottom (high)
 */

function Grid(dim){
    this.columns = [];
    this.dim = dim;
    for (var i=0; i<dim; ++i){
        var a = new Array(dim);
        a.fill(null);
        columns.push(a);
    }
    // this.tops = new Array(dim);
    // this.tops.fill(0);
}

// attempts to drop the piece in
// returns whether or not the piece could be successfully dropped
Grid.prototype.dropInColumn = function(col_num, piece){
    // find the slot
    var col = this.columns[col_num];
    var cell = col[0];
    var i = this.dim-1;
    while (cell != null && i >= 0){
        cell = col[--i];
    }
    if (i < 0){
        return false;
    }
    // drop it
    this.columns[col_num][i] = piece;
    return true;
}

// returns the number of groups removed
Grid.prototype.findAndRemoveGroups = function(stage){
    var groupVals = [];
    var cell = null;
    var row = 0;
    var col = 0;
    var matchingCells = [];
    var numRemoved = 0;
    // loop through rows and columns (horizontally and vertically)
    for (var direction=0; direction<2; ++direction){
        for (var i=0; i<this.dim; ++i){
            groupVals = [];
            for (var j=0; j<this.dim; ++j){
                if (direction == 0){
                    row = i;
                    col = j;
                } else {
                    row = j;
                    col = i;
                }
                cell = this.columns[col][row];
                // if there's a piece there update the group, otherwise check
                // for matches and reset the group (if the group wasn't empty)
                if (cell != null){
                    groupVals.push(cell.numberVal);
                    continue;
                } else {
                    var len = groupVals.length;
                    if (len == 0) continue;
                    for (var n=0; n<len; ++n){
                        if (groupVals[n] == len){
                            matchingCells.push([col-len+1,row]);
                        }
                    }
                    groupVals = [];
                }
            }
        } 
    }
    // TODO: make sure cell isn't null before clearing it (cells can
    // potentially be "marked" twice)
    for (var i=0; i<matchingCells.length; ++i){
        var col = matchingCells[i][0];
        var row = matchingCells[i][1];
        cell = this.columns[col][row];
        if (cell == null) continue;
        stage.removeChild(cell);
        ++numRemoved;
    }
    return numRemoved;
}

Grid.prototype.gravity = function(){
}

Grid.prototype.update = function(){
}
