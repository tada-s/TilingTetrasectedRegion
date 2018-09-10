/* 
 * Spanning Tree Mod 3
 */

function generateSpanningTree3(graph){
	return (new AlgorithmSpanningTree3(graph)).generate();
}

function AlgorithmSpanningTree3(graph){
	/* 'Global' Variables */
	this.g = graph;
	this.visited = [];
	this.parent = [];
	this.backEdge = [];

	/* Execution */
	this.generate = function(){
		this.init();
		this.spanTree(0);
		this.divide();

		return this.tree;
	}

	/* Initialization */
	this.init = function(){
		this.visited = [];
		this.parent = []
		for(var i = 0; i < this.g.length; i++){
			this.visited.push(false);
			this.parent.push(-1);
		}
		this.tree = new DynamicTree(this.g.length);
		this.cycleEdge = [];
	}
	
	/* Span the initial tree and store every back edge */
	this.spanTree = function(u){
		this.visited[u] = true;
		for(var i = 0; i < this.g[u].length; i++){
			var v = this.g[u][i];
			if(v != this.parent[u]){
				if(this.visited[v]){
					if(u > v){
						this.backEdge.push({u:u, v:v});
					}
				}else{
					this.parent[v] = u;
					this.tree.addEdge(u, v);
					this.spanTree(v);
				}
			}
		}
	}

	/* Main algorithm */
	this.divide = function(){
		// For each back edge (u, v),
		for(var cIndex = 0; cIndex < this.backEdge.length; cIndex++){
			var u = this.backEdge[cIndex].u;
			var v = this.backEdge[cIndex].v;

			// If adding an edge (u, v) complete a cycle,
			if(this.tree.areConnected(u, v)){
				// Get subtree size for each vertex in cycle (only 3 nodes is needed (+2 for division process)).
				var cycle = [];
				var subTreeSize = [];
				// (Attempt number 0 start reading from vertex u to reconstruct the cycle.)
				// (If is needed, try a second attempt (number 1) starting from vertex v.)
				var attemptNode = [u, v];
				for(var attemptNumber = 0; attemptNumber <= 1; attemptNumber++){
					var lastNode = -1;
					var node = attemptNode[attemptNumber];
					while(subTreeSize.length < 3){
						var nextNode = this.parent[node];

						// Isolate the subtree to get the size.
						if(lastNode != -1) this.tree.removeEdge(lastNode, node);
						if(nextNode != -1) this.tree.removeEdge(node, nextNode);
						var isLCA = (attemptNumber == 0 ? this.tree.areConnected(node, v) : this.tree.areConnected(node, u));
						var size = this.tree.size(node);
						if(lastNode != -1) this.tree.addEdge(lastNode, node);
						if(nextNode != -1) this.tree.addEdge(node, nextNode);

						// If node is the Lowest Common Ancestor between u and v, then break the loop.
						if(isLCA) break;

						// Store the label and subtree size.
						if(attemptNumber == 0){
							cycle.unshift(node);
							subTreeSize.unshift(size);
						}else{
							cycle.push(node);
							subTreeSize.push(size);
						}

						// Next cycle node.
						lastNode = node;
						node = this.parent[node];
					}
					// Append the last node to recover the edge.
					if(attemptNumber == 0){
						cycle.unshift(node);
					}else{
						cycle.push(node);
					}
				}

				// Find (rangeR, rangeL) to divide the cycle.
				var rangeR, rangeL;
				for(var i = 0; i < 3; i++){
					var sum = 0;
					for(var j = i; j < 3; j++){
						sum += subTreeSize[j];
						if(sum % 3 == 0){
							rangeL = i;
							rangeR = j;
							break;
						}
					}
					if(sum % 3 == 0) break;
				}

				// Align to cycle indices.
				rangeL++;
				rangeR++;

				// Divide into Tree 1 and Tree 2.
				if(cycle[rangeL] != v) this.tree.removeEdge(cycle[rangeL - 1], cycle[rangeL]);
				if(cycle[rangeR] != u) this.tree.removeEdge(cycle[rangeR], cycle[rangeR + 1]);
				if(cycle[rangeL] != v && cycle[rangeR] != u) this.tree.addEdge(u, v);

				// Re-root (fix) the parent pointer.
				if(cycle[rangeL] != v && cycle[rangeR] != u){
					// Tree 1.
					for(var i = 1; i < rangeL; i++){
						this.parent[cycle[i]] = cycle[i - 1];
					}
					for(var i = rangeR + 1; i < cycle.length - 1; i++){
						this.parent[cycle[i]] = cycle[i + 1];
					}
					// Tree 2.
					this.parent[cycle[rangeL]] = -1;
					for(var i = rangeL + 1; i <= rangeR; i++){
						this.parent[cycle[i]] = cycle[i - 1];
					}
				}
			}
		}

	}
	
	
}

