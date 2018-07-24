/* 
 * This javascript handles the input from web browser events.
 */

window.onload = eventInitialize;

// Canvas
var elementCanvas;
// Mouse Corrdinates
var mouse = {
	x: 0,
	y: 0
};


/** Event Initialize **/

function eventInitialize(){
	elementCanvas = document.getElementById("canvasMain");
	elementCanvas.addEventListener("mousedown", eventMouseDown);
	elementCanvas.addEventListener("mouseup", eventMouseUp);
	elementCanvas.addEventListener("mousemove", eventMouseMove);

	var elementButton = document.getElementById("buttonSpanningTree");
	elementButton.addEventListener("click", eventButtonPress);
	
	initDraw();
	initBoard();

	draw();
}

/** Button Press **/
function eventButtonPress(evt){
	paintColor = !paintColor;
	draw();
	if(paintColor){
		this.innerHTML = "Hide spanning tree";
	}else{
		this.innerHTML = "Show spanning tree";
	}
}

/** Event Mouse Down **/

function eventMouseDown(evt){
	updateMouseCoord(evt);
	
	c = getCellIndex(mouse);
	if((0 < c.i && c.i < board.cellRow - 1) && (0 < c.j && c.j < board.cellColumn - 1)){
		if(board.cell[c.i][c.j] == CELL_NULL){
			board.cell[c.i][c.j] = CELL_EMPTY;
		}else{
			board.cell[c.i][c.j] = CELL_NULL;
		}
	}
	
	calculateTiling();
	
	draw();
}

/** Event Mouse Up **/

function eventMouseUp(evt){
	updateMouseCoord(evt);

	//draw();
}

/** Event Mouse Move **/

function eventMouseMove(evt){
	updateMouseCoord(evt);

	//draw();
}

/** Mouse **/

function updateMouseCoord(evt){
	var clientCanvasRect = elementCanvas.getBoundingClientRect();
	var m = {x:-1, y:-1};
	scaleX = canvas.width / clientCanvasRect.width,
	scaleY = canvas.height / clientCanvasRect.height;
	m.x = Math.round((evt.clientX - clientCanvasRect.left) * scaleX - coordBoardScreenOffX);
	m.y = -Math.round((evt.clientY - clientCanvasRect.top) * scaleY - coordBoardScreenOffY);

	mouse = m;
}

/** Cell and Position **/

function getCellIndex(position){
	var i1 = getCellI(position.x, position.y);
	var j1 = getCellJ(position.x, position.y);
	return {i: i1, j: j1};
}

