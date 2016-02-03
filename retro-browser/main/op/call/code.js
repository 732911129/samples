(function () {
	function register_op_call() {
		//console.log("Registering op call", this);
		// this value is prototype
		// op specific functions 
			function get_arglist( target_fun, fun_name ) {
				var fun = target_fun;
				var fun_def = fun.toString();
				/* the below regex extracts the arguments from the function definition */
				/* it breaks if the function definition contains comments */
				var arglist = fun_def.match(/\([^()]*\)/)[0].slice(1,-1).split(',').map(function(v){return v.replace(/\s+/g,"").replace(/_/g,"-")});
				return arglist;
			}
			function resolve_arglist( target_fun, api_element ) {
				var arglist = get_arglist( target_fun );
				var resolved_arglist = [];
				arglist.forEach( function ( arg_name ) {
						if(api_element.hasAttribute('debug')) {
							console.log("Arg ", arg_name, api_element.getAttribute( arg_name ) );
						}
						var arg_value = api_element.getAttribute(arg_name);
						if(!(api_element.hasAttribute('clear-null') 
								&& (arg_value == null || arg_value == undefined))) {
							resolved_arglist.push( arg_value );
						}
				});	
				return resolved_arglist;
			}
			function execute_function( target, fun_name, api_element ) {
				var target_fun;
				// Find the function 
					if(!!target[fun_name] && typeof target[fun_name] === "function") {
						// We found the function on a target
						target_fun = target[fun_name];
					} else if(typeof fun_name === "function") {
						// It was found through templated attribute variable
						target_fun = fun_name;
					}
				if(!!target_fun) {
					var fun_this = api_element;
					var resolved_arglist = resolve_arglist( target_fun, api_element);
					if(api_element.hasAttribute('debug')) {
						console.log("Applying ", fun_name, " from ", target, " to ", resolved_arglist );
					}
					if(api_element.hasAttribute('target-this')) {
						fun_this = target;	
					}
					var result;
					if((resolved_arglist.indexOf(null) !== -1 || resolved_arglist.indexOf(undefined) !== -1) && this.hasAttribute('abort-null')) {
						result = "abort-null";
					} else {
						result = target_fun.apply(fun_this, resolved_arglist );		
					}
					/* note this does not handle async functions yet */
					api_element.set_result(result);
				} else {
					console.log("No function found ", fun_name, this );
				}
			}
			// currently unused
			function register_op_code( op_code, path_to_code_file ) {
				/* this is where we register the op_code 
				* and its code with the web worker 
				*/
				//console.log("registering op code", op_code, path_to_code_file );
				function try_register_op_code() {
					if(!!worker_state.OpCall) {
						worker_state.OpCall.postMessage(path_to_code_file);
						return true;
					}
					return false;
				}
				go(retry( "worker_state.OpCall.postMessage", try_register_op_code, 5 ));
			} 
		// api 
			this.get_arglist = get_arglist;
			this.resolve_arglist = resolve_arglist;
			this.execute_function = execute_function;
		// op versions of standard functions migrated from setup
			this.execute = function() {
				//console.log("OP CALL EXECUTION", this.attributes);
				if(this.hasAttribute("app-callchain")) {
					rn.comms.send({type:"app-callchain",content:this.getAttribute("app-callchain")});
				} else if (this.hasAttribute('function')) {
					//console.log("EXECUTING FUNCTION");
					var target;
					var target_parent_selector = this.getAttribute('target-parent');
					var target_selector = this.getAttribute('target');	
					if(this.matches('[_property~="target"]')) {
						target = target_selector;	
						if(this.hasAttribute('debug')) {
							console.log("We have a target property ", target, this );
						}
					} else {
						target = rn.selector.get(target_parent_selector, target_selector, this);
						if(this.hasAttribute('debug')) {
							console.log("We have a regular target ", target, this);
						}
					}
					/* if there is no target we use the global scope */
					target = target || self;
					//console.log("Op call function target ", target);
					this.execute_function.bind(this)(target,this.getAttribute('function'),this);
				}
			};
	}

	rn.create_task('op','call','register', register_op_call);
	rn.create_task('op','call','setup', rn.noop);
}());

