/* 
 * This javascript contains game coordinate information.
 */

const sizeBoardCell = 40;

const coordCellX = [-0.5, 0.5, 0.5, -0.5];
const coordCellY = [0.5, 0.5, -0.5, -0.5];

const coordBoardScreenOffX = -50;
const coordBoardScreenOffY = 768 + 300;
const coordMessage = {
	x: 20,
	y: 30
};

// Coordinates calculated during the execution

function getCellI(x, y){
	return Math.round(x / sizeBoardCell);
}

function getCellJ(x, y){
	return Math.round(y / sizeBoardCell);
}

function getCellX(i, j){
	return i * sizeBoardCell;
}

function getCellY(i, j){
	return j * sizeBoardCell;
}

