/* 
 * Fully Dynamic Connectivity Tree Data Structure
 * 
 * - addEdge(u, v)
 *     Add an edge connecting the vertex u and vertex v.
 *     (Actual implementation: O(1))
 * - removeEdge(u, v)
 *     Remove a connected edge between the vertex u and vertex v.
 *     (Actual implementation: O(deg(u)))
 * - areConnected(u, v)
 *     Return TRUE if the vertex u and vertex v are connected, else return FALSE.
 *     (Actual implementation: O(|V|))
 * - size(u)
 *     Return the size of the tree containing the vertex u.
 *     (Actual implementation: O(|V|))
 * 
 */

function DynamicTree(size){
	this.g = [];
	for(var i = 0; i < size; i++){
		this.g.push([]);
	}
}

DynamicTree.prototype.addEdge = function(u, v) {
    this.g[u].push(v);
    this.g[v].push(u);
};

DynamicTree.prototype.removeEdge = function(u, v) {
	for(var i = 0; i < this.g[u].length; i++){
		if(this.g[u][i] == v){
			this.g[u][i] = this.g[u][this.g[u].length - 1];
			this.g[u].pop();
			break;
		}
	}
	for(var i = 0; i < this.g[v].length; i++){
		if(this.g[v][i] == u){
			this.g[v][i] = this.g[v][this.g[v].length - 1];
			this.g[v].pop();
			break;
		}
	}
};

DynamicTree.prototype.areConnected = function(u, v) {
    return this.dfsConnected(u, -1, v);
};

DynamicTree.prototype.dfsConnected = function(actualNode, parentNode, findNode) {
	if(actualNode == findNode){
		return true;
	}else{
		for(var i = 0; i < this.g[actualNode].length; i++){
			if(this.g[actualNode][i] != parentNode){
				if(this.dfsConnected(this.g[actualNode][i], actualNode, findNode)){
					return true;
				}
			}
		}
		return false;
	}
};

DynamicTree.prototype.size = function(v) {
    return this.dfsSize(v, -1);
};

DynamicTree.prototype.dfsSize = function(actualNode, parentNode) {
	var sum = 1;
	for(var i = 0; i < this.g[actualNode].length; i++){
		if(this.g[actualNode][i] != parentNode){
			sum += this.dfsSize(this.g[actualNode][i], actualNode);
		}
	}

	return sum;
};

