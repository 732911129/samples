(function() {
	// tasks 
		function register_op_int(root) {
			//console.log("register", this);
			// op specific version of standard functions migrated from setup 
				this.hand_off = function hand_off()	{
					if(!!this.firstElementChild) {
						this.firstElementChild.setAttribute("ip","");
					} else {
						this.call_complete();
					}
					this.removeAttribute("ip");
				}
				this.complete_called = function (optional_caller) {
					if(this.hasAttribute('debug')) {
						console.log("Call complete called", this);
						if(!!optional_caller) {
							console.log("Called by", optional_caller);
						}
					}
					if(this.matches('[exports~="event-object"]') || this.matches('[event-object="~attached"]')) {
						/* discard the previous event */
						this.event_queue.shift();
						var next_event = this.event_queue[0];
						if(!!next_event) {
							if(this.hasAttribute('debug')) {
								console.log("We just completed and so are executing the next event", next_event, "still", this.event_queue.length, "in the queue.");
							}
							this[rn.conversion.prop_name('event-object')] = next_event;
							this.setAttribute('ip','');
						} else {
							if(this.hasAttribute('debug')) {
								console.log("No next events to execute ", this);
							}
						}				
					}
				};
		}

		function setup_op_int() {
			//console.log("op int setup", this);
			//console.log("op_int", this, arguments);
			var interrupt_name = this.getAttribute('on');
			var attr_changed_name = this.getAttribute('on-attr');
			this.event_queue = [];
			// functions required by code executed on creation
				this.try_attach = function try_attach(times) {
					if(this.hasAttribute('attach-wait')) {
						console.log("Waiting to attach to event",this);
					} else {
						var attach_selector = this.getAttribute('attach');
						var attach_parent = this.getAttribute('attach-parent');
						var attach_points = rn.selector.get_all(attach_parent, attach_selector, this);
						var attach_point, maxlen = attach_points.length;
						if(maxlen == 0) {
							if(times > 0) {
								//console.log("Retrying attach waiting for attach point", attach_parent, attach_selector, attr_changed_name, interrupt_name, this);
								setTimeout( this.try_attach.bind(this,times-1), 50 );	
							} else {
								console.error("No parent element!", this, attach_selector, attach_parent);
							}
						} else {
							if(!this.hasAttribute('multiple')) {
								maxlen = 1;	
							}
							for(var i = 0; i < maxlen; i++) {
								attach_point = attach_points[i];				
								if(!!attach_point) {
									if(!!interrupt_name) {
										if(this.hasAttribute('debug')) {
											console.log("Attaching ", interrupt_name, this);
										}
										attach_point.addEventListener(interrupt_name, this.begin_execution.bind(this) );	
									}
									if(!!attr_changed_name) {
										if(this.hasAttribute('debug')) {
											console.log("Attaching ", attr_changed_name, this, attach_point);
										}
										attach_point.register_attr_changed_task( attr_changed_name, this.begin_execution.bind(this) );
									}
								}
							}
						}
					}
				}
				this.soft_execute = function soft_execute() {
					//console.log("OP INT EXECUTION showing attributes", this.attributes);		
					if(this.hasAttribute('debug')) {
						console.log("Execute called ", rn.conversion.list(this.attributes));
					}
				}
				this.begin_execution = function begin_execution(event_object) {
					//console.log("interrupt ", this);
					if(this.hasAttribute('no-default')) {
						event_object.preventDefault();
					}
					if(this.hasAttribute('no-default-if-event-true')) {
						var true_conditions = this.getAttribute('no-default-if-event-true');
						if(!!true_conditions) {
							true_conditions = true_conditions.split(/\s+/g);
							for(var test of true_conditions) {
								if(!!event_object[test]) {
									event_object.preventDefault();
									break;
								}	
							}
						}
					}
					if(this.hasAttribute('prevent-bubble')) {
						event_object.stopPropagation();
					}
					if(this.matches('[exports~="event-object"]') || this.matches('[event-object="~attached"]')) {
						if(this.hasAttribute('debug')) {
							console.log("We are queueing event object", this, event_object);
						}
						if(this.event_queue.length == 0) {
							this.event_queue.push( event_object );
							if(this.hasAttribute('debug')) {
								console.log("We can execute immediately since there are no executing instruction paths.");
							}
							this[rn.conversion.prop_name('event-object')] = event_object;
							this.setAttribute('ip','');
						} else {
							this.event_queue.push( event_object );
						}
					} else {
						if(this.hasAttribute('debug')) {
							console.log("We do not export properties so we are not worryinb about event queues.", this, "and instead are executing immediately.");
						}
						this.setAttribute('ip','');
					}
				}
			// code to be execute on creation
				if(!this.hasAttribute('attach-execute')) {
					this.try_attach(50);	
					this.execute = this.soft_execute;
				} else {
					this.execute = function () {
						this.try_attach(5);
						this.execute = this.soft_execute;
						if(!!this.nextElementSibling) {
							this.nextElementSibling.execute();
						}
					};
				}
		}

	rn.create_task('op','int','register', register_op_int);
	rn.create_task('op','int','setup', setup_op_int);
}());
