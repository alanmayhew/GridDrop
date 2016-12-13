/*
 
   Grid class
   
   representation of the game state

 +---+---+---+---+           [ 
 |   |   |   |   |         0  [ null, null, null, {obj} ]
 +---+---+---+---+
 |   |   |   |   |         1  [ null, null, {obj}, {obj} ]
 +---+---+---+---+  ---->     
 |   | o |   |   |         2  [ null, null, null, null ]
 +---+---+---+---+
 | o | o |   | o |         3  [ null, null, null, {obj} ]
 +---+---+---+---+              ]
 
                            Grid.columns goes left (low index) to right (high)
                            Columns go top (low index) to bottom (high)
 */

function Grid(dim){
    this.columns = [];
    for (var i=0; i<dim; ++i){
        var a = new Array(dim);
        a.fill(null);
        columns.push(a);
    }
    // this.tops = new Array(dim);
    // this.tops.fill(0);
}

Grid.prototype.dropInColumn = function(col_num){
    // drop it
    // call update
}

Grid.prototype.update = function(){
}
