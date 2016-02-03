var rn = new (function radon() {
	/* privates */
		var tasks = new Map();

	/* classes */
		function lifecycle_event( name, target, args, await_processing ) {
			this.wait = await_processing;
			this.event_name = name;
			this.call_this = target;
			this.call_args = args;
		}

		function lifecycle_task( name, task_function, filter, process_once ) {
			this.once = process_once;
			this.event_name = name;	
			this.code = task_function;
			this.filter = filter;
		}

		function _event_task_profile ( task_list, event_queue ) {
			this.task_list = task_list || [];
			this.event_queue = event_queue || [];
		}

	/* functions */
		// profiles
			// helpers
				function get_wildcard_profiles(base,type,event_name) {
					var wildcard_profiles = [];
					wildcard_profiles.push(get_event_profile(base,type,'*'));
					wildcard_profiles.push(get_event_profile(base,'*',event_name));
					wildcard_profiles.push(get_event_profile(base,'*','*'));
					wildcard_profiles.push(get_event_profile('*',type,event_name));
					wildcard_profiles.push(get_event_profile('*',type,'*'));
					wildcard_profiles.push(get_event_profile('*','*',event_name));
					wildcard_profiles.push(get_event_profile('*','*','*'));
					return wildcard_profiles;
				}
				function get_event_profile(base,type,event_name) {
					// get or create base entry -- op, component, ... , or *
						var base_profile = tasks.get(base);
						if(!base_profile) {
							base_profile = new Map();
							tasks.set(base,base_profile);
						}
					// get or create type entry -- if, call, main-app, ... , or *
						var type_profile = base_profile.get(type);
						if(!type_profile) {
							type_profile = new Map();	
							base_profile.set(type, type_profile);
						}
					// get or create event name entry -- setup, register, ... , or *
						var event_task_profile = type_profile.get(event_name);
						if(!event_task_profile) {
							event_task_profile = new _event_task_profile();
							type_profile.set(event_name, event_task_profile);
						}
					return event_task_profile;
				}
			function get_profiles(base,type,event_name) {
				// setup
					var profiles = [], total_tasks = 0;
					var wildcard_profiles = get_wildcard_profiles(base,type,event_name);
					var event_profile = get_event_profile(base,type,event_name);		
				// add the event profile
					profiles.push(event_profile);
					total_tasks += event_profile.task_list.length;
				// add wildcard profiles if they have any tasks
					for(var wildcard_profile of wildcard_profiles) {
						if(wildcard_profile.task_list.length > 0) {
							profiles.push(wildcard_profile);
							total_tasks += wildcard_profile.task_list.length;
						}
					}
				return { profiles : profiles, total_tasks : total_tasks };
			}
	
		// task and event
			// helper to find index of task 
				function find_task_index(event_task_list, task_fun, filter) {
					var task_index = -1;
					for(var i = 0; i < event_task_list.length; i++) {
						if(task_fun === event_task_list[i].code
							&& filter === event_task_list[i].filter) {
							task_index = i;
							break;
						}
					}
					return task_index;
				}

			function create_task(base,type,event_name,task_fun,filter,process_once) {
				// setup
					var event_task_profile = get_event_profile(base,type,event_name);
					var event_task_list = event_task_profile.task_list;
				// create task 
					if(-1 == find_task_index(event_task_list, task_fun, filter)) {
						process_once = process_once || false;
						event_task_list.push(new lifecycle_task(event_name,task_fun,filter,process_once));
					}	
				// execute any tasks for this event if there are any queued events
					if(event_task_profile.event_queue.length > 0) {
						execute_tasks(base,type,event_name);
					}
			}

			function queue_event(base,type,event_name,await_processing,call_this) {
				// setup 
					var args = rn.conversion.arrify(arguments);
					var call_args = args.slice(5);
					var event_task_profile = get_event_profile(base,type,event_name);
					var task_event_queue = event_task_profile.event_queue;
				// queue event
					await_processing = await_processing || false;
					task_event_queue.push( new lifecycle_event(event_name, call_this, call_args, await_processing ));
				// execute any tasks for this event if there are any non wildcard tasks
					if(event_task_profile.task_list.length > 0) {	
						execute_tasks(base,type,event_name);
					}
			}

		// execution 
			// helpers
				// helper to apply a task 
					function apply_matching_task(event, task) {
						var task_applies = false;
						// determine if task applies
							if(!!task.filter && !!event.call_this.matches) {
								if(event.call_this.matches(task.filter)) {
									task_applies = true;
								}
							} else {
								task_applies = true;
							}
						if(!!task_applies) {
							task.code.apply(event.call_this,event.call_args);
						}
						return task_applies;
					}
				// helper to process a matching event against a list of tasks
					function apply_matching_tasks(event, task_list) {
						var onetime_tasks = [], event_matches = false;
						task_list.forEach( function each_task(task, task_index) {
							var task_applied = apply_matching_task(event, task);
							// note a onetime task
								if(!!task_applied && !!task.once) {
									onetime_tasks.push(task_index);
								}
							event_matches = event_matches || task_applied;
						});
						// remove onetime tasks
							while(onetime_tasks.length > 0) {
								task_list.splice(onetime_tasks.pop(),1);
							}
						return event_matches;
					}
				// execute queue
					// Details
						// execute can handle specific and wildcard events
						// for wildcard profiles, the specific events are passed in as the substitute queue
						// processing by a wildcard task can not remove or cause to wait a specific event
						// processing by a specific task can remove or cause to wait a specific event
						// wildcard events do not occur
						// if there is no substitute queue the event queue contains specific events
					function execute_queue(event_profile) {
						// don't deque any events unless we have some tasks
							if(event_profile.task_list.length == 0) {
								return;
							}
						// setup
							var q = event_profile.event_queue, waitq = [], tasks = event_profile.task_list;
						// process all events in the queue from the first inserted
							while(q.length > 0) {
								var event = q.shift(), event_matches = apply_matching_tasks(event, tasks);
								// note waiting event
									if(!event_matches && !!event.wait) {
										waitq.push(event);
									}
							}
						// requeue any waiting events
							while(waitq.length > 0) {
								q.push(waitq.pop());
							}
					}
				// execute list
					function execute_list(task_list, event_list) {
						// setup
							if(task_list.length == 0 || event_list.length == 0) {
								return;
							}
						for(var event of event_list) {
							apply_matching_tasks( event, task_list);
						}
					}

			// execute tasks
				function execute_tasks(base,type,event_name) {
					// setup
						var profiles = get_profiles(base,type,event_name);
						var event_profile = profiles.profiles[0];
						var wildcard_profiles = profiles.profiles.slice(1);
					// save the event queue so we can pass it to the wildcard profiles
						var event_list = rn.conversion.arrify(event_profile.event_queue);
					// execute the event profile and deplete its event queue
						execute_queue(event_profile);
					// execute the wildcard profiles using the event list
						for(var profile of wildcard_profiles) {
							execute_list(profile.task_list, event_list);
						}
				}

	/* api */
		this.create_task = create_task;
		this.queue_event = queue_event;
		this.noop = function noop() {};
		Object.defineProperty(this,'tasks',{
			get : function () { 
				return tasks;
			}
		});
});
