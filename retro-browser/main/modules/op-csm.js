var DEBUG = true;

/* cpsm -- call path state machine */
	/* helpers and data */
		/* functions */
			/* standard functions for any op */
				/* helpers */
					function get_selectors(name) {
						return { 
							target : this.getAttribute(name), 
							parent : this.getAttribute(name+'-parent')
						};
					}
					function get_matching(name) {
						var selectors = get_selectors.call(this,name);
						return rn.selector.get(selectors.parent, selectors.target, this);
					}
				/* convenience methods */					
					var standard_functions = {
						get_matching_child : function get_matching_child() {
							return get_matching.call(this,'child');
						},
						get_matching_sibling : function get_matching_sibling() {
							return get_matching.call(this,'sibling');
						},
						get_matching_far : function get_matching_far() {
							return get_matching.call(this,'far');
						},
						get_matching_parallel : function get_matching_parallel() {
							return get_matching.call(this,'parallel');
						},
					};	

			/* standard function for specific ops */
				/* op-switch */
					function op_switch_get_matching_child() {
						// Details:
							// this function is redundant as we always set get matching child
						return get_matching_child.call(this);
					}
				/* op-if */
					function op_if_get_matching_child() {
						var result = new Boolean(this.getAttribute('standard-if-condition'));
						if(!!result) {
							this.setAttribute('matching-child','op-then');
						} else {
							this.setAttribute('matching-child','op-else');
						}
						return get_matching_child.call(this);	
					}
				/* op-compare */
					function compare() {
						//Details:
							// We define the if condition as
							// op-if true-by=<compare> lhs=< ... > rhs=< ... > ... op-then ... op-else ]
							// With compare one of :
								// true
								// false
								// eq
								// z
								// nz
								// lt
								// gt
								// lte
								// gte
								// and
								// nand
								// or 
								// nor
								// xor
								// xnor
						// Setup
							var lhs = this.getAttribute('lhs');
							var rhs = this.getAttribute('rhs');
							var type = this.getAttribute('as') || "string";
						// Determine type 
							switch(type) {
								// We could include custom type comparators here 
								case "number":
									lhs = parseInt(lhs); 
									rhs = parseInt(rhs);
									break;
								default:
									break;
							}		
						// Compare 
								// If compare_by is unspecified
									// And rhs is unspecified
										// We assess lhs for true
									// Otherwise we assess lhs and rhs for equality
							var compare_by = this.getAttribute('true-by');
							if(!compare_by) {
								if(!rhs) {
									compare_by = "true";
								} else {
									compare_by = "eq";
								}
							}
							// If compare_by is t or f or z or nz we only check lhs
							switch(compare_by) {
								case "eq":
									result = lhs === rhs;
									break;
								case "t":
									result = !!lhs;
									break;	
								case "f":
									result = !lhs;
									break;
								case "lt":
									result = lhs < rhs;
									break;
								case "lte":
									result = lhs <= rhs;
									break;
								case "gt":
									result = lhs > rhs;
									break;
								case "gte":
									result = lhs >= rhs;
									break;	
								case "z":
									result = lhs === 0;
									break;
								case "nz":
									result = lhs !== 0;
									break;
								case "and":
									result = !!rhs && !!lhs;
									break;
								case "nand":
									result = !(!!rhs && !!lhs);
									break;
								case "or":
									result = !!rhs || !!lhs;
									break;
								case "nor":
									result = !(!!rhs || !!lhs);
									break;
								case "xor":
									result = !!rhs ^ !!lhs;
									break;
								case "nxor":
									result = !(!!rhs ^ !!lhs);
									break;
							}		
						return result;
					}
				/* op-compute */
					function compute() {
						//Details:
							// We define the if condition as
							// op-if result-by=<compute> lhs=< ... > rhs=< ... > ... op-then ... op-else ]
							// With compute one of
								// add
								// sub
								// div
								// mul
								// inc 
								// dec 
								// shl
								// shr
								// rol
								// ror
								// neg
								// not
								// and
								// or
								// xor
								// mod
								// pow 
								// log
						// Setup
							var lhs = this.getAttribute('lhs');
							var rhs = this.getAttribute('rhs');
							var type = this.getAttribute('as') || "string";
						// Determine type 
							switch(type) {
								// This is arithmetic so the default is number
								case "number":
								default:
									lhs = parseInt(lhs); 
									rhs = parseInt(rhs);
									break;
							}		
						// Compute 
							// Details:
								// If compute_by is neg, not, inc or dec we only check lhs
								// If compute_by is shl, shr, rol, ror or not we convert to unsigned int 
							var compute_by = this.getAttribute('result-by');
							switch(compute_by) {
								case "add":
									result = lhs + rhs;
									break;
								case "sub":
									result = lhs - rhs;
									break;	
								case "div":
									result = lhs / rhs;
									break;
								case "mul":
									result = lhs * rhs;
									break;
								case "mod":
									result = lhs % rhs;
									break;
								case "pow":
									result = Math.pow(lhs,rhs);
									break;
								case "log":
									result = Math.log(lhs)/Math.log(rhs);
									break;
								case "inc":
									result = lhs++;
									break;
								case "dec":
									result = lhs--;
									break;
								case "shl":
									result = (lhs << rhs) >>> 0;
									break;	
								case "shr":
									result = (lhs >> rhs) >>> 0;
									break;
								case "rol":
									var bit_width = (~1 >>> 0).toString(2).length;
									rhs = rhs % bit_width;
									result = lhs << rhs | lhs >> (bit_width - rhs);
									result = result >>> 0;
									break;
								case "ror":
									var bit_width = (~1 >>> 0).toString(2).length;
									rhs = rhs % bit_width;
									result = lhs >> rhs | lhs << (bit_width - rhs);
									result = result >>> 0;
									break;
								case "neg":
									result = -lhs;
									break;
								case "not":
									result = parseInt((~lhs >>> 0).toString(2),2);
									break;
								case "and":
									result = lhs & rhs;
									break;
								case "or":
									result = lhs | rhs;
									break;
								case "xor":
									result = lhs ^ rhs;
									break;
							}		
						return result;
					}

		/* conditions */
				/* Note -- condition functions are executed in the context of the executing element to 
				 * which they are attached. Which means their this value is set to that element.
				 */
			/* standard conditions for any op */
				/* helpers */
					function has_matching(name) {
						return !!get_matching(name);
					}
				var standard_conditions = {
					/* element matching */
						/* convenience methods -- child, sibling, far, parallel */
								has_matching_child : function has_matching_child() {
									return has_matching.call(this,'child');
								},
								has_matching_sibling : function has_matching_sibling() {
									return has_matching.call(this,'sibling');
								},
								has_matching_far : function has_matching_far() {
									return has_matching.call(this,'far');
								},
								has_matching_parallel : function has_matching_parallel() {
									return has_matching.call(this,'parallel');
								},
					/*  call queue related */
						has_waiting_calls : function has_waiting_calls() {
							var val = parseInt(this.getAttribute('waiting-calls'));
							return !isNaN(val) && val > 0;
						}
				};

			/* standard conditions for specific ops */
				/* note -- these will be moved to the op definitions referenced */
					/* op-loop */
					 	function standard_loop_condition_is_valid() {
							// Details:
								// This supports keyed loops via 
								// current-key and a list of break-keys on which the loop breaks
								// It also supports indexed loops with positive and negative index steps
								// Via index-step, current-index and after-last-index
								// With after-last-index being defined as the index immediately following, 
								// When stepping by the magnitude and direction indicated by index step
								// The last index on which it is intended that the loop be run. 	
							if(this.hasAttribute('keyed')) {
								var current_key = this.getAttribute('current-key');
								var loop_break = this.matches('[break-keys~="' + current_key + '"]');
								return !loop_break;
							} else {
								// Details:
									// We can provide some of these as defaults right?
									// Such as start index is auto 0
									// index step is auto 1
									// and after last index is the length of the collection being iterated
									// These defaults can exist via scope set by the op-loop or 
									// in what is perhaps more declarative and transparent
									// Set on the element at the execution time.
									// The loop condition can become invalid dynamically if we change any of the
									// the following attribute values : start-index, current-index, 
									// after-last-index and index-step.
								var start_index = parseInt(this.getAttribute('start-index'));
								var current_index = parseInt(this.getAttribute('current-index'));
								var after_last_index = parseInt(this.getAttribute('after-last-index'));
								var index_step_direction = Math.sign(parseInt(this.getAttribute('index-step')));
								return (Math.sign(after_last_index - current_index) === index_step_direction) &&
												(Math.sign(start_index - current_index) === -index_step_direction);
							}
						}  
					/* op-switch */
						// Details:
							// Note this function is redundant because we simply perform 
							// Has matching child and get matching child to branch
							// And every switch has its matching child attribute set to
							// this.setAttribute('matching-child','[when="{{on}}"]');
						function standard_switch_condition_is_valid() {
							//Details:
								// We define the switch condition as
								// op-switch on=<condition> ... op-branch when=<value> ... op-divert
							this.setAttribute('matching-child','[when="{{on}}"]');
							var result = has_matching_child();		
							this.setAttribute('standard-switch-condition', result);
							return result;
						}
					/* op-if */
						function standard_if_condition_is_valid() {
							return compare.call(this);
						}

	/* types -- machine, state and transition */
		/* machine */
			function setup_machine(machina, template) {
				for(var args of template) {
					for(var tail of args[1]) {
						machina.set_transition.apply(machina, args.slice(0,1).concat(tail));
					}
				}	
			}

			function machine(elem, flow_topology) {
				/* defaults and checks */
					flow_topology = flow_topology || "total_flow";

				/* properties */
					this.topology = flow_topology;
					this.owner_element = elem;
					this.states = new Map();
					this.current_state = undefined;
					this.conditions = new Map();

				/* method */
					/* transitions -- execute and a set convenience */
						/* execute transition */
							this.execute_transition = function(destination_name) {
								if(this.current_state !== undefined) {
									this.current_state.egress();
								}
								this.current_state = this.states.get(destination_name);
								this.current_state.enter();
							};
							this.transition_function = function () {
								var executed = false;
								for(var transition_pair of this.current_state.transitions) {
									var destination_name = transition_pair[0], transition = transition_pair[1];
									if(transition.condition_function.call(this.owner_element)) {
										this.execute_transition(destination_name);
										executed = true;
										break;
									}
								}
								if(!executed) {
									if(DEBUG) {
										console.log("No transition executed ", this);
									}
								}
							};

						/* set transition convenience */
							/* also will create the states if they don't exist */
							/* also will set the transition condition of an existing transition */
							this.set_transition = function ( source_state_name, 
									destination_state_name,
									condition_function ) {
								var source_state = this.states.get(source_state_name),
										destination_state = this.states.get(destination_state_name);
								if(!source_state) {
									source_state = get_state(source_state_name);
									this.states.set(source_state_name, source_state);
								}
								if(!destination_state) {
									destination_state = get_state(destination_state_name);
									this.states.set(destination_state_name, destination_state);
								}
								source_state.set_transition( destination_state_name, condition_function );	
							};	

					/* standard conditions */
					 	this.set_standard_condition = function(condition_function) {
							this.conditions.set(condition_function.name, condition_function);
					 	};

				/* setup -- initial state, some transitions if debug and any standard conditions */
					/* add some transitions from an instruction flow template */
						setup_machine(this, standard_topologies.get(flow_topology));

					/* add some standard conditions */
						for(var name of Object.keys(standard_conditions)) {
							this.set_standard_condition( standard_conditions[name] );
						}	

					/* put the machine into the start state */
						this.execute_transition('start');
			}

		/* state and transition */
			/* state */
				function state(name) {
					/* properties */
						this.is_current = false;
						this.name = name;
						this.tasks = new Map();
						this.tasks.set('entry',[]);
						this.tasks.set('call',[]);
						this.tasks.set('response',[]);
						this.tasks.set('egress',[]);
						this.transitions = new Map();

					/* methods -- entry, egress, set transition, add task and perform tasks */
			 			/* entry and egress */ 
							this.enter = function () {
								if(DEBUG) {
									//console.log(">>", this.name);
								}
								this.is_current = true;
							};
							this.egress = function () {
								if(DEBUG) {
									//console.log("<<", this.name);
								}
								this.is_current = false;
							}

						/* transitions */
							this.set_transition = function( destination_state_name, condition_function ) {
								var target_transition = this.transitions.get(destination_state_name);
								if(!target_transition) {
									target_transition = new transition( destination_state_name );
									this.transitions.set(destination_state_name, target_transition );
								}
								if(!!condition_function) {
									target_transition.condition_function = condition_function;
								}
							};
				
						/* tasks */
							this.add_task = function (event_name, task) {
								this.get_tasks(event_name).push(task);
							};
							this.perform_tasks = function (event_name) {
								return this.get_tasks(event_name).map( function (task) { task(); } );
							}; 

					/* setup -- nothing */
						if(DEBUG) {
						}
				}

				/* get state helpers -- create a state, get all state names, create a map of all states */
					function get_state(name) {
						return new state(name);
					}

					function get_state_names() {
						return ['start','self','far','parallel','child','sibling','response'];
					}

					function get_states() {
						return new Map(get_state_names().map( function (x) { return [x, get_state(x)] } ));
					}

			/* transition */
				function transition(destination_state_name, condition_function) {
					this.destination_state_name = destination_state_name;
					this.condition_function = condition_function;
					if(!this.condition_function) {
						if(DEBUG) {
							/* test function */
							this.condition_function = make_random_condition();
						}
					}
				}

				/* transition helpers -- make a random transition function */
					function make_random_condition() {
						var state_share = 1.0/get_state_names().length;
						return function () {
							if(Math.random() <= state_share) {
								return true;
							}
							return false;
						};
					}

		/* map of standard transitions */
			var standard_topologies = new Map([
				["no_op_flow", new Map([
						["start", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["instruction_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["method_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["child"],
							["response"]
						]],
						["child", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["instruction_method_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["child"],
							["sibling"]
							["response"]
						]],
						["child", [
							["sibling"]
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["any_call_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["far"],
							["parallel"],
							["sibling"],
							["response"]
						]],
						["far", [
							["sibling"],
							["response"]
						]],
						["parallel", [
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]] 
					])
				],
				["synchronous_call_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["far"],
							["sibling"],
							["response"]
						]],
						["far", [
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]] 
					])
				],
				["asynchronous_call_flow", new Map([
						["start", [
							["self"]	
						]],
						["self", [
							["parallel"],
							["sibling"],
							["response"]
						]],
						["parallel", [
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["child_loop_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["child"],
							["sibling"],
							["response"]
						]],
						["child", [
							["child"],
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["child_switch_flow", new Map([
						["start", [
							["self"]
						]],
						["self", [
							["child"],
							["sibling"],
							["response"]
						]],
						["child", [
							["sibling"],
							["response"]
						]],
						["sibling", [
							["response"]
						]],
						["response", [
							["start"]
						]]
					])
				],
				["total_flow", new Map([
						["start", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["self", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["far", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["parallel", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["child", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["sibling", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]],
						["response", [
							["start"],
							["self"],
							["far"],
							["parallel"],
							["child"],
							["sibling"],
							["response"]
						]]
					])
				]
			]); 

	/* test -- test the machine through setup and then n transitions */
		function test_machine(n,elem) {
			n = n || 10;
			elem = elem || document.body;
			var m = new machine(elem);
			//console.log("Testing machine", m);
			for(var i = 0; i < n; i++) {
				m.transition_function();
			}
			return m;
		}

		//test_machine(17);
