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
Grid.prototype.dropInColumn = function(col_num, dot){
    // find the slot
    var col = this.columns[col_num];
    var cell = col[0];
    var i = 0;
    while (cell == null && i < this.dim){
        cell = col[++i];
    }
    if (i >= this.dim){
        return false;
    }
    // drop it
    this.columns[col_num][i] = dot;
    return true;
}

// returns the number of groups removed
Grid.prototype.findAndRemoveGroups = function(){
    var groupVals = [];
    var cell = null;
    var row = 0;
    var col = 0;
    var matchingCells = [];
    // loop through rows and columns
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
}

Grid.prototype.gravity = function(){
}

Grid.prototype.update = function(){
}
