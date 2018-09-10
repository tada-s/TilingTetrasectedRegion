/* 
 * This javascript renders in canvas.
 */

var canvas, ctx;
var paintColor;

/** Initialization **/

function initDraw(){
	canvas = document.getElementById("canvasMain");
	ctx = canvas.getContext("2d");
	paintColor = false;
}

/** Main draw **/

function draw(){ 
	clearCanvas();
	drawBoard();
	drawTrominoes();
	if(paintColor){
		fillCells();
	}

}

/** Main draw methods **/

/** Clear Canvas **/

function clearCanvas(){
	ctx.fillStyle = "rgba(255, 255, 255, 1)";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}

/** Draw grids **/

function drawBoard(){
	// Background Grid
	ctx.strokeStyle = "rgba(0, 0, 0, 0.02)";
	ctx.lineWidth = 2;

	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			var x = getCellX(i, j);
			var y = getCellY(i, j);
			drawCell(x, y, sizeBoardCell);
		}
	}

	// Tetrasected cell
	ctx.strokeStyle = "rgba(150, 150, 150, 1)";
	ctx.lineWidth = 2;

	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			if(board.cell[i][j] != 0){
				var x = getCellX(i, j);
				var y = getCellY(i, j);
				drawInnerGrid(x, y, sizeBoardCell);
				drawCell(x, y, sizeBoardCell);
			}
		}
	}
}

/** Draw Trominoes **/

function drawTrominoes(){
	ctx.fillStyle = "rgba(50, 50, 50, 1)";

	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			var x = getCellX(i, j);
			var y = getCellY(i, j);

			// Cardinal Direction
			var edx = 1, edy = 0;
			var wdx = -1, wdy = 0;
			var ndx = 0, ndy = 1;
			var sdx = 0, sdy = -1;
			if(board.flip[i][j] < 0){
				edx = -edx;
				wdx = -wdx;
				ndx = -ndx;
				sdx = -sdx;
			}
			for(var r = 1; r <= board.rotation[i][j]; r++){
				[edx, edy] = [-edy, edx];
				[wdx, wdy] = [-wdy, wdx];
				[ndx, ndy] = [-ndy, ndx];
				[sdx, sdy] = [-sdy, sdx];
			}

			var t = 0;
			var tx = [];
			var ty = [];
			var tr = [];
			switch(board.cell[i][j]){
			case CELL_LEAF:
				// Leaf type cell
				if(board.cell[i + sdx][j + sdy] != CELL_L && board.cell[i + sdx][j + sdy] != CELL_ASYMMETRIC_X){
					t++;
					tx.push(+ 0.25 * sizeBoardCell);
					ty.push(- 3 * 0.25 * sizeBoardCell);
					tr.push(1);
				}
				t++;
				tx.push(- 0.25 * sizeBoardCell);
				ty.push(+ 0.25 * sizeBoardCell);
				tr.push(3);
				break;
			case CELL_SYMMETRIC_X:
				// Symmetric X type cell
				t++;
				tx.push(- 3 * 0.25 * sizeBoardCell);
				ty.push(+ 0.25 * sizeBoardCell);
				tr.push(3);
				t++;
				tx.push(+ 0.25 * sizeBoardCell);
				ty.push(+ 3 * 0.25 * sizeBoardCell);
				tr.push(2);
				t++;
				tx.push(+ 3 * 0.25 * sizeBoardCell);
				ty.push(- 0.25 * sizeBoardCell);
				tr.push(1);
				t++;
				tx.push(- 0.25 * sizeBoardCell);
				ty.push(- 3 * 0.25 * sizeBoardCell);
				tr.push(0);
				break;
			case CELL_SYMMETRIC_T:
				// Symmetric T type cell
				if(board.cell[i + wdx][j + wdy] != 9){
					t++;
					tx.push(- 3 * 0.25 * sizeBoardCell);
					ty.push(+ 0.25 * sizeBoardCell);
					tr.push(3);
				}
				if(board.cell[i + edx][j + edy] != 9){
					t++;
					tx.push(+ 3 * 0.25 * sizeBoardCell);
					ty.push(+ 0.25 * sizeBoardCell);
					tr.push(2);
				}
				break;
			case CELL_ASYMMETRIC_T:
				// Asymmetric T type cell
				if(board.cell[i + wdx][j + wdy] != 9){
					t++;
					tx.push(- 3 * 0.25 * sizeBoardCell);
					ty.push(+ 0.25 * sizeBoardCell);
					tr.push(3);
				}
				t++;
				tx.push(- 0.25 * sizeBoardCell);
				ty.push(- 3 * 0.25 * sizeBoardCell);
				tr.push(0);
				break;
			case CELL_ASYMMETRIC_X:
				// Asymmetric X type cell
				t++;
				tx.push(- 0.25 * sizeBoardCell);
				ty.push(+ 0.25 * sizeBoardCell);
				tr.push(2);
				t++;
				tx.push(+ 0.25 * sizeBoardCell);
				ty.push(+ 0.25 * sizeBoardCell);
				tr.push(0);
				t++;
				tx.push(+ 0.25 * sizeBoardCell);
				ty.push(- 3 * 0.25 * sizeBoardCell);
				tr.push(1);
				break;
			case CELL_I:
				// I type cell
				break;
			case CELL_L:
				// L type cell
				t++;
				tx.push(- 0.25 * sizeBoardCell);
				ty.push(- 0.25 * sizeBoardCell);
				tr.push(0);
				t++;
				tx.push(+ 0.25 * sizeBoardCell);
				ty.push(+ 0.25 * sizeBoardCell);
				tr.push(0);
				break;
			}

			// Rotate coordinates and draw trominoes
			for(var k = 0; k < t; k++){
				if(board.flip[i][j] < 0){
					tx[k] = -tx[k];
					tr[k] = tr[k] + 1 - 2 * (tr[k] % 2);
				}
				for(var r = 1; r <= board.rotation[i][j]; r++){
					[tx[k], ty[k]] = [-ty[k], tx[k]];
					tr[k] = (tr[k] + 1 + 4) % 4;
				}
				drawTromino(x + tx[k], y + ty[k], tr[k]);
			}

		}
	}
}

/** Paint cells to show trees **/

function fillCells(){
	for(var i = 0; i < board.cellRow; i++){
		for(var j = 0; j < board.cellColumn; j++){
			if(board.cell[i][j] > 1){
				var x = getCellX(i, j);
				var y = getCellY(i, j);
				var color = board.color[i][j];
				// Just random rgb
				var r = (3 * color * color + 2) % 255;
				var g = (13 * color * color * color + 3) % 255;
				var b = (59 * color * color * color * color + 4) % 255;
				ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", .7)";
				fillCell(x, y, sizeBoardCell);
			}
		}
	}
}

/** Auxiliar drawing methods **/

/** Draw a single tromino **/

function drawTromino(x, y, rotation){
	var delta = 3; // Padding parameter
	// Polygon coordinates of tromino in vx, vy
	var vx = [
		- 1 * 0.25 * sizeBoardCell + delta,
		+ 3 * 0.25 * sizeBoardCell - delta,
		+ 3 * 0.25 * sizeBoardCell - delta,
		+ 1 * 0.25 * sizeBoardCell - delta,
		+ 1 * 0.25 * sizeBoardCell - delta,
		- 1 * 0.25 * sizeBoardCell + delta,
		- 1 * 0.25 * sizeBoardCell + delta
	];
	var vy = [
		- 1 * 0.25 * sizeBoardCell + delta,
		- 1 * 0.25 * sizeBoardCell + delta,
		+ 1 * 0.25 * sizeBoardCell - delta,
		+ 1 * 0.25 * sizeBoardCell - delta,
		+ 3 * 0.25 * sizeBoardCell - delta,
		+ 3 * 0.25 * sizeBoardCell - delta,
		- 1 * 0.25 * sizeBoardCell + delta
	];
	// Rotate 
	for(var r = 0; r < rotation; r++){
		for(var i = 0; i < 7; i++){
			var temp = vx[i];
			vx[i] = -vy[i];
			vy[i] = temp;
		}
	}
	
	
	ctx.beginPath();
	ctx.moveTo(x + vx[0] + coordBoardScreenOffX, -(y + vy[0]) + coordBoardScreenOffY);
	for(var i = 1; i < 7; i++){
		ctx.lineTo(x + vx[i] + coordBoardScreenOffX, -(y + vy[i]) + coordBoardScreenOffY);
	}
	ctx.closePath();
	ctx.fill();
}

/** Draw a tetrasected cell **/

function drawInnerGrid(x, y, size){
	ctx.beginPath();
	ctx.moveTo(x - 0.5 * size + coordBoardScreenOffX, -y + coordBoardScreenOffY);
	ctx.lineTo(x + 0.5 * size + coordBoardScreenOffX, -y + coordBoardScreenOffY);
	ctx.closePath();
	ctx.stroke();
	
	ctx.beginPath();
	ctx.moveTo(x + coordBoardScreenOffX, -(y - 0.5 * size) + coordBoardScreenOffY);
	ctx.lineTo(x + coordBoardScreenOffX, -(y + 0.5 * size) + coordBoardScreenOffY);
	ctx.closePath();
	ctx.stroke();
}

/** Draw a single cell **/

function drawCell(x, y, size){
	var n = coordCellX.length;
	ctx.beginPath();
	ctx.moveTo(x + coordCellX[n - 1] * size + coordBoardScreenOffX, -(y + coordCellY[n - 1] * size) + coordBoardScreenOffY);
	for(var i = 0; i < n; i++){
		ctx.lineTo(x + coordCellX[i] * size + coordBoardScreenOffX, -(y + coordCellY[i] * size) + coordBoardScreenOffY);
	}
	ctx.closePath();
	ctx.stroke();
}

/** Fill a single cell **/

function fillCell(x, y, size){
	var n = coordCellX.length;
	ctx.beginPath();
	ctx.moveTo(x + coordCellX[n - 1] * size + coordBoardScreenOffX, -(y + coordCellY[n - 1] * size) + coordBoardScreenOffY);
	for(var i = 0; i < n; i++){
		ctx.lineTo(x + coordCellX[i] * size + coordBoardScreenOffX, -(y + coordCellY[i] * size) + coordBoardScreenOffY);
	}
	ctx.closePath();
	ctx.fill();
}


