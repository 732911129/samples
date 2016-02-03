rn.UseOp = new (function UseOp() {
	/* setup */
		// store for op constructors
			rn.ops = {};
		// base prototype 
			var UseOpProto = Object.create(HTMLElement.prototype);

	/* definitions */
 		var state = {};
		var sep = "/";
		var fun_sep = "_";
		var elem_name_sep = "-";
		var setup_function_base_name = "setup";
		var register_function_base_name = "register";
		var attr_changed_function_base_name = "attr_changed";
		var code_file_name = "code.js";
		var base = "op";

	// OPS SHOULD DEFINE THEIR FLOW THEMSELVES
	// Flow map
		var flow_op_map = new Map([
			// Instructions 
				["mv", "instruction_flow"],
				["create","instruction_flow"],
				["del","instruction_flow"],
				["insert","instruction_flow"],
				["remove","instruction_flow"],
				["restyle","instruction_flow"],
				["set","instruction_flow"],
				// Unimplemented
				["compute","instruction_flow"],
				// Unimplemented
				["compare","instruction_flow"],

			// Control Flow 
				["loop","child_loop_flow"],
				// Unimplemented
				["switch","child_switch_flow"],
				["if","child_switch_flow"],
				["then","method_flow"],
				["else","method_flow"],
				// can change with continue attribute
				["fun", "method_flow"],
				// can change with parallel attribute 
				["call","synchronous_call_flow"],

			// Interrupts 
				["int","method_flow"]
		]);

	// standard tasks
		// execute after setup
			function do_execute() {
				if(this.hasAttribute('debug')) {
					console.log("Executing ", this );
				}
				if(!this.hasAttribute("wait-result")) {
					this.set_result(this.execute());
				} else {
					this.execute(); /* execute must call lead to call of set_result */
					//console.log("STOPPED : waiting result", this, this.execute);
				}
				this.executed_times = (this.executed_times || 0) + 1;
			}
			function do_execute_wrapped() {
				this.removeAttribute('setup-execute');
				do_execute.apply(this,arguments);
			}
			function notify_setup() {
				this.setup_already = true;
			}
			rn.create_task('op','*','setup',do_execute_wrapped,'[setup-execute]');
			rn.create_task('op','*','setup',do_execute_wrapped,'[immediate]');
			rn.create_task('op','*','setup',notify_setup);

	function create_op( op_code ) {
		var new_op_proto = Object.create(HTMLElement.prototype);
		// prototype methods
			new_op_proto.createdCallback = function() {
				//console.log(op_code, "created");	
				/* insert op's created code here */
				/* run this custom element's setup function, if any */
				var fun_name = [setup_function_base_name, base, op_code.replace(/-/g,'_')].join(fun_sep);
				/* variables */
				this.attr_changed_tasks = new Map();	
				this.flow_topology = flow_op_map.get(op_code);
				this.flow_machine = new machine(this, this.flow_topology);
				//console.log("Setup", op_code, "fun name", fun_name);
				// execute any setup tasks
				rn.queue_event(base,op_code,'setup',false,this);
				if(!window.loaded_so_far) {
			 		window.loaded_so_far = [];
				}
			 	window.loaded_so_far.push(+(new Date()));
			};
			new_op_proto.attachedCallback = function() {
				//console.log("Attaching ", this);
				rn.queue_event(base,op_code,'attached',false,this);
			}
			new_op_proto.call_complete = function () {
				if(this.hasAttribute('debug')) {
					console.log("call now complete", this);
				}
				var complete_target = rn.selector.get("[call-complete]",null,this);
				if(!!complete_target && !!complete_target.complete_called) {
					if(this.hasAttribute('debug')) {
						console.log("Found a complete target", complete_target, this);
					}
					complete_target.complete_called(this);	
				}
			};
			new_op_proto.apply_bases = function (map) {
				if(this.hasAttribute('bases')) {
					if(this.hasAttribute('debug')) {
						console.log("bases before", rn.conversion.list_(map.entries()));
					}
					var bases = this.getAttribute('bases').split(/\s+/g);
					for(var base of bases) {
						var map_value = map.get(base)+"";
						//console.log(base, this, map);
						var unit = (map_value.match(/[^\d]+$/) || [""])[0];
						map_value = parseInt(map_value);
						var map_value_base = parseInt(map.get(base+'-base'));
						map_value -= map_value_base;
						map.set(base,map_value+unit);
					}
					if(this.hasAttribute('debug')) {
						console.log("bases after", rn.conversion.list_(map.entries()));
					}
				}
			}
			new_op_proto.hand_off =	function hand_off() {
				if(this.hasAttribute('debug')) {
					console.log("Hand off ", this );
				}
				if(!!this.nextElementSibling) {
					//console.log("Moving IP to next sibling", this);
					this.nextElementSibling.setAttribute("ip","");	
				} else {
					//console.log("Element ", this, " has no more siblings.");
					this.call_complete();
				}
				this.removeAttribute("ip");
			};
			new_op_proto.attributeChangedCallback = function( attr_name, old_val, new_val ) {
				if(this.hasAttribute('debug')) {
					console.log(this, op_code, attr_name, "changed from", old_val, "to", new_val );	
				}
				/* 
				* This should be where we put code that checks
				* if the attribute changed was the 'instruction pointer' attribute
				* and if it was and if the number of other argument attributes is greater than 
				* the trip number for this op code then 
				* we place a call to the op attribute changed handling function
				* defined in its code file
				*/
				var fun_name = [attr_changed_function_base_name, base, op_code.replace(/-/g,'_')].join(fun_sep);
				//console.log("Attr changed", op_code, "fun name", fun_name);
				var real_this = this;
				if(attr_name == "ip" && old_val == null) {
					/* ip attribute added */
					//console.log("hand off started", this);
					if(!!this.execute && typeof this.execute == "function") {
						if(this.hasAttribute('once') && !!this.executed_times) {
						} else {
							if(!!this.setup_already) {
								do_execute.apply(this);
							} else {
								this.setAttribute('setup-execute','');
							}	
						}
					}
				} else if (attr_name == "ip" && old_val == "") {
					/* ip attribute removed */
					//console.log("hand off complete", this);
				} else if (attr_name == "execute" && !!new_val) {
					var executable = rn.selector.get(null, new_val, real_this); 
					//console.log("Executing", executable, real_this, new_val);
					if(!!executable) {
						executable.setAttribute('ip','');		
					}
				}	else {
					//console.log("attribute changed ", attr_name, old_val, new_val);
					// execute any attr changed tasks
					rn.queue_event(base,op_code,'attr_changed',false,this,attr_name,old_val,new_val);
				}
				/* execute tasks last */
				var task_list = this.attr_changed_tasks.get(attr_name);
				if(!!task_list) {
					console.log("Executing attr changed tasks ", this, arguments);
					for(var task of task_list) {
						task(attr_name, old_val, new_val);
					}	
				}
			};
			new_op_proto.set_result = function (result) {
				this.setAttribute('result', result);
				if(!this.hasAttribute('no-pass')) {
					setTimeout(this.hand_off.bind(this), 0);		
				}
			};
			new_op_proto.execute = function () {
				//console.log("Default no op execution of", this);
			};
			new_op_proto.register_attr_changed_task = function ( name, task ) {
				var task_list = this.attr_changed_tasks.get(name);
				if(!task_list) {
					task_list = [];
					this.attr_changed_tasks.set(name, task_list);
				}
				task_list.push( task );
			};
			/* over write get Attribute */
			new_op_proto._getAttribute = new_op_proto.getAttribute;
			new_op_proto.getAttribute = rn.template.attr;

		// try to register
			var op_elem_name = [base, op_code].join(elem_name_sep);
			var new_op;
			try { 
				new_op = document.registerElement( op_elem_name, {
					prototype: new_op_proto
				});
			} catch (e) {
				// If we have registered then return
				console.log(e, e.stack);
				return;
			} finally {
				rn.queue_event(base,op_code,'register',false,new_op_proto);
			}

		if(!!new_op) {
			// save the prototype and constructor
				new_op_proto[op_elem_name] = new_op;
				rn.ops[rn.conversion.cc(op_elem_name)] = new_op_proto;

			//console.log("Use-op created op eg", rn.ops[op_elem_name]);
			console.log(op_elem_name, "loaded.");
		}
	}

	UseOpProto.createdCallback = function() {
		var op_code = this.getAttribute('code');
		if(!!op_code) {
			var base_override = this.getAttribute('base');
			var path_to_base_directory = [(base_override  || base), op_code].join(sep);
			var path_to_code_file = [path_to_base_directory, code_file_name].join(sep);
			/* insert ops code file */
			var executer = document.createElement('script');
			//executer.addEventListener('load',console.log.bind(console,"SCRIPT ADDED", op_code));
			executer.src = path_to_code_file;	
			this.appendChild(executer);
			create_op( op_code );		
		}
	};

	this['use-op'] = document.registerElement('use-op', {
		prototype: UseOpProto
	});
});


