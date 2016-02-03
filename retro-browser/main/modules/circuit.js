/* make input a map so everything has an addressable name */
function gate(name, type) {
	var input_list = Array.prototype.slice.call(arguments,2);
	this.name = name;
	this.type = type;	
	this.parent = null;
	this.evaluate = function () {
		if(this.type == "leaf") {
			return this.leaf();
		} else {
			var evaluation = undefined, input_nodes = this.inputs.values();
			for(var input of input_nodes) {
				if(evaluation == undefined) {
					switch(this.type) {
						case "and":
						case "or":
						case "xor":
							evaluation = input.evaluate();
							break;
						case "nand":
						case "nor":
						case "xnor":
							evaluation = !input.evaluate();
							break;
					}
				} else {
					switch(this.type) {
						case "and":
							evaluation = evaluation && input.evaluate();
							break;
						case "or":
							evaluation = evaluation || input.evaluate();
							break;
						case "nand":
							evaluation = evaluation || !input.evaluate();
							break;
						case "nor":
							evaluation = evaluation && !input.evaluate();
							break;
						case "xor":
							evaluation = !!(evaluation ^ input.evaluate());
							break;
						case "xnor":
							evaluation = !(evaluation ^ input.evaluate());
							break;
					}
				}
			}
			return evaluation;
		}
	};
	this.add = function ( node, address ) {
		if(this.type == "leaf") {
			console.log("Lead node can't add ", this, node );
			throw "Leaf node can't add " + this.name + "," + node.name ;
		} else {
			var location = this.get(address);
			if(!location.inputs) {
				location.inputs = new Map();
			}
			if(node.__proto__ !== this.__proto__) {
				node = cnode(node);
			}
			node.parent = this;
			location.inputs.set( node.name, node );
		}
	};
	this.add_all = function ( node_list ) {
		for ( var node of node_list ) {
			this.add( node );
		}
	};
	this.get = function ( address ) {
		if (this.type == "leaf") {
			return this.leaf;
		} else if (!address || address.length == 0) {
			return this;
		} else {
			if (typeof address == "string") {
				address = address.split('.');
			}	
			var next_hop = address.shift();
			if(this.inputs.has(next_hop)) {
				return this.inputs.get(next_hop).get(address);
			} else {
				console.log("Invalid address ", next_hop, address, this);
				throw "Invalid address " + next_hop + address.join('.');
			}
		}
	};
	this.remove = function ( address ) {
		if(!address || address.length == 0) {
			if(!this.parent) {
				console.log("Error can't remove as has no parent ", this );
				throw "Can't remove as has no parent " + this.name;
			}
			this.parent.remove( this.name );
		} else {
			var location = this.get ( address );
			location.remove();
		}
	};
	if(this.type == "leaf") {
		this.leaf = input_list[0];
	} else {
		this.add_all(input_list);
	}
}

function cnode() {
	var type = arguments[0];
	if(!!type) {
		if(type.__proto__ == gate) {
			return type;
		} else if(typeof type === "function") {
			return new gate(type.name, "leaf", type);
		} else if (typeof type === "string") {
			arguments = Array.prototype.slice.call(arguments);
	 		arguments.unshift(this);
			return new (gate.bind.apply(gate,arguments));
		} else {
			console.log("Invalid node constructor ", arguments );
			throw "Invalid node constructor"; 
	 	} 
	}
}

function and( a, b ) {
	if(!b) {
		b = a;
	}
	return  cnode(["and",a.name,b.name].join('.'),"and",a,b);
}

function or( a, b ) {
	return  cnode(["or",a.name,b.name].join('.'),"or",a,b);
}

function nand( a, b ) {
	return  cnode(["nand",a.name,b.name].join('.'),"nand",a,b);
}

function nor( a, b ) {
	return  cnode(["nor",a.name,b.name].join('.'),"nor",a,b);
}

function xor( a, b ) {
	return  cnode(["xor",a.name,b.name].join('.'),"xor",a,b);
}

function xnor( a, b ) {
	return  cnode(["xnor",a.name,b.name].join('.'),"xnor",a,b);
}

function t() { return true; }
function f() { return false; }

function test() {
	var a = cnode("and-ttt", "and", t, t, t);
	var b = cnode("nand-fff", "nand", f, f, f);
	var c = cnode("and-ab", "and", a, b);
	var d = cnode("or-cf", "or", c, f);
	var e = cnode("and-df", "and", d, f);

	var tests = [
		[["a:and-ttt", "and", t, t, t], true],	
		[["b:nand-fff", "nand", f, f, f], true],	
		[["c:and-ab", "and", a, b], true],	
		[["d:or-cf", "or", c, f, b], true],	
		[["e:and-df", "and", d, f, c], false],
		[["f:or-et", "or", e, t, d], true],
		[["a:nand-ttt", "nand", t, t, t], false],	
		[["b:and-fff", "and", f, f, f], false],	
		[["c:nand-ab", "nand", a, b, d], false],	
		[["d:nor-cf", "nor", c, f, t], false],	
		[["e:nand-df", "nand", d, f, t], true],
		[["f:nor-et", "nor", e, f, f], true],
	];
	var test_map = new Map(tests);
	return test_map;
}

function run_test_map(map, make, fun) {
	var pass = 0;
	var total = map.size;
	for(var entry of map) {
		var condition = (entry[1] == make.apply(this,entry[0])[fun]());
		if(!!condition) {
			pass++;
		}
		console.log("Test result : ", entry[0], condition ? "pass" : "fail" );
	}	
	console.log("Tests passed " + pass + " out of " + total);
	return pass*100.0/total + "%";
}

//run_test_map(test(), cnode, 'evaluate');

