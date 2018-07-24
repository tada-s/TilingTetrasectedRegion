/* 
 * This javascript implements the game rules.
 */

var board = {
	cell: [],
	rotation: [],
	flip: [],
	color: [],
	cellRow: 100,
	cellColumn: 100
};

const LABEL_UNDEF = -1;

const CELL_NULL = 0;
const CELL_EMPTY = 1;
const CELL_LEAF = 3;
const CELL_SYMMETRIC_X = 4;
const CELL_SYMMETRIC_T = 5;
const CELL_ASYMMETRIC_T = 6;
const CELL_ASYMMETRIC_X = 7;
const CELL_I = 8;
const CELL_L = 9;

var tileType = [];
tileType[CELL_LEAF] = [0, 0, 0, 2];
tileType[CELL_SYMMETRIC_X] = [2, 2, 2, 2];
tileType[CELL_SYMMETRIC_T] = [2, 0, 2, 1];
tileType[CELL_ASYMMETRIC_T] = [1, 0, 2, 2];
tileType[CELL_ASYMMETRIC_X] = [1, 1, 1, 2];
tileType[CELL_I] = [0, 1, 0, 1];
tileType[CELL_L] = [1, 1, 0, 0];

var adjI = [1, 0, -1, 0];
var adjJ = [0, 1, 0, -1];

var cell_label = [];
var label_cell = [];

var dfsCut = [];
var dfsCycle = [];
var dfsCycleStart = LABEL_UNDEF;
var dfsCycleEnd = LABEL_UNDEF;

var g = [];
var g_visited = [];

var colorCounter = 100;


/** Initialization **/

function initBoard(){
	board.cell = [];
	board.rotation = [];
	board.flip = [];
	board.color = [];
	cell_label = [];
	for(var i = 0; i < board.cellRow; i++){
		board.cell.push([]);
		board.rotation.push([]);
		board.flip.push([]);
		board.color.push([]);
		cell_label.push([]);
		for(var j = 0; j < board.cellColumn; j++){
			board.cell[i].push(CELL_NULL);
			board.rotation[i].push(0);
			board.flip[i].push(1);
			board.color[i].push(0);
			cell_label[i].push(LABEL_UNDEF);
		}
	}
}

/** Main Tiling Algorithm **/

function calculateTiling(){
	// Initialize variables
	g = [];
	label_cell = [];
	dfsCut = [];
	dfsCycle = [];
	dfsCycleStart = LABEL_UNDEF;
	dfsCycleEnd = LABEL_UNDEF;
	g_visited = [];
	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			if(board.cell[i][j] != CELL_NULL){
				board.cell[i][j] = CELL_EMPTY;
				cell_label[i][j] = LABEL_UNDEF;
			}
		}
	}
	
	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			if(board.cell[i][j] == CELL_EMPTY && cell_label[i][j] == LABEL_UNDEF){
				// Transform a polyomino to graph
				makeGraph(i, j);
				// Divide the graph into trees and tile
				spawnTrees(cell_label[i][j]);
			}
		}
	}

	// A Leaf type cell flip correction
	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			if(board.cell[i][j] == CELL_LEAF){
				// Connected cell coordinate (i2, j2)
				var i2 = i + adjI[(board.rotation[i][j] + 3) % 4];
				var j2 = j + adjJ[(board.rotation[i][j] + 3) % 4];
				// Relative direction of connected cell
				var r = (board.rotation[i2][j2] - board.rotation[i][j] + 4) % 4;
				switch(board.cell[i2][j2]){
				case CELL_ASYMMETRIC_X:
				case CELL_L:
					if(r == 1){
						// Flip sign
						board.flip[i][j] = -1;
					}
					break;
				}
			}
		}
	}
}

/** DFS for labeling every cell (to make graph 'g') **/

function makeGraph(i, j){
	// Label the new vertex
	cell_label[i][j] = g.length;
	label_cell.push({i:i, j:j});

	// Resizes g and g_visited to make space for the new vertex
	g.push([]);
	g_visited.push(false);

	// Call recursively every unlabeled adjacent cell (i2, j2)
	for(var k = 0; k < 4; k++){
		var i2 = i + adjI[k];
		var j2 = j + adjJ[k];
		if(board.cell[i2][j2] == CELL_EMPTY){
			if(cell_label[i2][j2] == LABEL_UNDEF){
				makeGraph(i2, j2);
			}
			// Add edge from (i,j) to (i2, j2)
			g[cell_label[i][j]].push(cell_label[i2][j2]);
		}
	}
}

/** Manage the cycle and split the graph **/

function spawnTrees(u){
	floodValue(u, false);
	if(graphSize(u) % 3 == 0){
		// Spawn Tree, Cut Edges and Get Cycle
		floodValue(u, false);
		dfsCycleStart = LABEL_UNDEF;
		dfsCycleEnd = LABEL_UNDEF;
		getCycle(u, LABEL_UNDEF);

		if(dfsCycle.length == 0){
			// The graph is a tree. Calculate tilings.
			floodValue(u, false);
			generateTiling(u);
			colorCounter++;
		}else{
			// There exists a cycle.
			// Get the size of each spanning tree.
			var s = [];
			for(var i = 0; i < dfsCycle.length; i++){
				floodValue(dfsCycle[i], false);
				s.push(graphSize(dfsCycle[i], LABEL_UNDEF));
			}
			
			// Partitionate in two set: A, B.
			var vertexA = LABEL_UNDEF;
			var vertexB = LABEL_UNDEF;
			for(var i = 0; i < 3; i++){
				var sum = 0;
				for(var j = i; j < 3; j++){
					sum += s[j];
					if(sum % 3 == 0){
						// Label of set B is false
						for(var k = 0; k < dfsCycle.length; k++){
							floodValue(dfsCycle[k], false);
						}
						// Label of set A is true
						for(var k = i; k <= j; k++){
							floodValue(dfsCycle[k], true);
						}
						vertexA = dfsCycle[j];
						vertexB = dfsCycle[(j + 1) % dfsCycle.length];
						break;
					}
				}
				if(vertexB != LABEL_UNDEF){
					break;
				}
			}

			// Reconnect Edges
			for(var i = 0; i < dfsCut.length; i++){
				var c = dfsCut[i];
				if(g_visited[c.u] == g_visited[c.v]){
					g[c.u].push(c.v);
				}
			}
			
			dfsCut = [];
			dfsCycle = [];
			
			// Recursive call
			spawnTrees(vertexA);
			spawnTrees(vertexB);
		}
	}
}

/** DFS to make a spanning tree and detect a cycle **/

function getCycle(u, parent){
	// If a cycle is detected, the information is stored in 'dfsCycleStart', 'dfsCycleEnd' and 'dfsCycle' variables.
	// Every nontree deges will be stored in 'dfsCut' variable.
	
	var k_parent = -1;
	
	g_visited[u] = true;
	for(var k = 0; k < g[u].length; k++){
		var v = g[u][k];
		if(v == parent){
			k_parent = k;
		}else{
			if(g_visited[v]){
				// Nontree Edge detected
				if(dfsCycleStart == LABEL_UNDEF){
					// First nontree edge is in a cycle.
					dfsCycleStart = u;
					dfsCycleEnd = v;
					dfsCycle.push(u);
				}

				// Remove edge (u, v) from the graph and add to dfsCut
				dfsCut.push({u:u, v:v});
				[g[u][k], g[u][g[u].length - 1]] = [g[u][g[u].length - 1], g[u][k]];
				g[u].pop();
				k--;
			}else{
				getCycle(v, u);

				if(dfsCycle.length > 0 && dfsCycle[dfsCycle.length - 1] == v && dfsCycle[dfsCycle.length - 1] != dfsCycleEnd){
					// The edge (u, v) is in a cycle.
					dfsCycle.push(u);

					// Remove edge (u, v) from the graph and add to dfsCut
					dfsCut.push({u:u, v:v});
					[g[u][k], g[u][g[u].length - 1]] = [g[u][g[u].length - 1], g[u][k]];
					g[u].pop();
					k--;
				}
			}
		}
	}
	
	if(k_parent != -1){
		var v = g[u][k_parent];
		// if "u (current node) is part of a cycle" and "u is not the end of the cycle", then: the edge (u, parent) is in a cycle
		if(v == parent && dfsCycle.length > 0 && dfsCycle[dfsCycle.length - 1] == u && u != dfsCycleEnd){
			// Remove edge (u, parent) from the graph and add to dfsCut
			dfsCut.push({u:u, v:v});
			[g[u][k_parent], g[u][g[u].length - 1]] = [g[u][g[u].length - 1], g[u][k_parent]];
			g[u].pop();
		}
	}
}

/** A DFS to get a number of connected vertices from u **/

function graphSize(u){
	var s = 1;
	g_visited[u] = true;
	for(var k = 0; k < g[u].length; k++){
		var v = g[u][k];
		if(!g_visited[v]){
			s += graphSize(v);
		}
	}
	return s;
}

/** A DFS to flood boolean value **/

function floodValue(u, value){
	g_visited[u] = value;
	for(var k = 0; k < g[u].length; k++){
		var v = g[u][k];
		if(g_visited[v] != value){
			floodValue(v, value);
		}
	}
}

/** A DFS to get a number of connected vertices from u, only for tree **/

function treeSize(u, parent){
	var sum = 1;
	for(var k = 0; k < g[u].length; k++){
		var v = g[u][k];
		if(v != parent){
			sum += treeSize(v, u);
		}
	}
	return sum;
}

/** Calculate the cell type for each vertices in O(n) **/

function generateTiling(u){
	var i = label_cell[u].i;
	var j = label_cell[u].j;
	
	g_visited[u] = true;
	board.color[i][j] = colorCounter;

	// Get subtree size (in mod 3)
	var tSize = [0, 0, 0, 0];
	for(var k = 0; k < g[u].length; k++){
		var v = g[u][k];
		var i2 = label_cell[v].i;
		var j2 = label_cell[v].j;
		
		var di = i2 - i;
		var dj = j2 - j;
		for(var r = 0; r < 4; r++){
			if(di == adjI[r] && dj == adjJ[r]){
				tSize[r] = treeSize(v, u) % 3;
			}
		}
		if(!g_visited[v]){
			generateTiling(v);
		}
	}
	
	// Compare the subtrees sizes tSize with tileType
	for(var sgn = 1; sgn >= -1; sgn = sgn - 2){
		for(var r = 0; r < 4; r++){
			for(var type = CELL_LEAF; type <= CELL_L; type++){
				var equals = true;
				for(var k = 0; k < 4; k++){
					if(tSize[(sgn * k + r + 8 + (1 - sgn)) % 4] != tileType[type][k]){
						equals = false;
						break;
					}
				}
				// If matches tSize and tileType:
				if(equals){
					// save the information: sgn, r, type
					board.cell[i][j] = type;
					board.rotation[i][j] = r;
					board.flip[i][j] = sgn;
					return;
				}
			}
		}
	}
}


