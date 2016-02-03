var stack = [];	
function execute_callchain( chain ) {
	console.log("Executing call chain", chain);	
	var target = self;
	var token = "";
	var old_target;
	var arglist = [];
	var result;
	function apply(t,p) {
		var nt = t[p];
		if(!nt) {
			console.log("Broken target at ", p, "going up.");
			return undefined;
		} else {
			console.log("Successful resolve ", t, p, nt );
		}
		return nt;
	}
	function execute( fun, args ) {
		console.log("executing", fun, args);
		while(args.length > 0) {
			fun.bind(args.shift());
		}
		return fun();
	}
	function plex( cc ) {
		for(var i = 0; cc.length > 0; i++ ) {
			var c = cc.shift();
			console.log(c, cc,i);
			switch( c ) {
				case "(":
					console.log("token", token);
					old_target = target;
					target = apply( target, token );
					stack.push(target.bind(old_target));
					token = "";
					console.log("left bracket => going down");
					arglist.push(execute_callchain( cc ));
					break;
				case ")":
					console.log("token", token);
					target = apply( target, token );
					arglist.push(target);
					token = "";
					arglist.push(execute( stack.pop(), arglist )); 
					console.log("right bracket => going up");
					return arglist;
					break;
				case ".":
					console.log("token", token);
					target = apply(target, token);
					token = "";
					console.log("dot => applying");
					break;
				case ",":
					console.log("token", token);
					token = "";
					console.log("comma");
					break;
				default:
					if( /\s/.test(c) ) {
						console.log("token", token);
						console.log("space");
						break;
					}	else {
						token += c;
					}
					break;
			}
		}
		console.log("token", token);
		return arglist;
	}
	var result = plex( chain );
	return result;
}
