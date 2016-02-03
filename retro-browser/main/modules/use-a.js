rn.UseA = new (function UseA() {
	/* setup */
		// store for component constructors
			rn.components = {};
		// base prototype
			var UseAProto = Object.create(HTMLElement.prototype);

	/* definitions */
		var sep = "/";
		var fun_sep = "_";
		var function_base_name = "setup";
		var register_function_base_name = "register";
		var import_file_name = "layout.html";
		var code_file_name = "code.js";
		var base = "component";
		var attr_changed_function_base_name = "attr_changed";
	
	function create_elem ( elem_name, importer ) {
		//console.log("Use-a was Requested to create elem using import", importer);	
		var template = importer.import.querySelector('template');
		var new_elem_proto = Object.create(HTMLElement.prototype);
		// fill the prototype
			new_elem_proto.createdCallback = function () {
				/* add this custom element */
					var root = this.createShadowRoot();
					root.applyAuthorStyles = true;

				/* variables */
					this.attr_changed_tasks = new Map();
				
				/* decide if we run setup before templating or after */
				/* default is after, and we don't handle before yet */
					if( root.host.hasAttribute('setup-first') ) {
						//console.log("We don't handle running setup first yet");
					}

				/* append the rendered template to the root */
					root.appendChild(document.importNode(template.content,true));
				
				/* run this custom element's setup function, if any */
					rn.queue_event(base,elem_name,'setup',false,this,root);
					if(!window.loaded_so_far) {
						window.loaded_so_far = [];
					}
					window.loaded_so_far.push(+(new Date()));
			};
			new_elem_proto.attachedCallback = function() {
				//console.log("Attaching ", this);
				rn.queue_event(base,elem_name,'attached',false,this);
			}
			new_elem_proto.attributeChangedCallback = function( attr_name, old_val, new_val ) {
				//console.log(elem_name, attr_name, "changed from", old_val, "to", new_val );	
				/* 
				* This should be where we put code that checks
				* if the attribute changed was the 'instruction pointer' attribute
				* and if it was and if the number of other argument attributes is greater than 
				* the trip number for this op code then 
				* we place a call to the op attribute changed handling function
				* defined in its code file
				*/
				var fun_name = [attr_changed_function_base_name, elem_name.replace(/-/g,'_')].join(fun_sep);
				var real_this = this;
				if(attr_name == "ip" && old_val == null) {
					/* ip attribute added */
					//console.log("hand off started", this);
					if(!!this.execute && typeof this.execute == "function") {
						this.execute();
					}
					if(!this.hasAttribute('no-pass')) {
						setTimeout(this.hand_off.bind(this), 0);		
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
					rn.queue_event(base,elem_name,'attr_changed',false,this,attr_name,old_val,new_val);
				}
				/* execute tasks last */
				var task_list = this.attr_changed_tasks.get(attr_name);
				if(!!task_list) {
					//console.log("Executing attr changed tasks ", this, arguments);
					for(var task of task_list) {
						task(attr_name, old_val, new_val);
					}	
				}
			};
			new_elem_proto.hand_off =	function hand_off() {
				if(!!this.nextElementSibling) {
					this.nextElementSibling.setAttribute("ip","");	
				} else {
					//console.log("Element ", this, " has no more siblings.");
				}
				this.removeAttribute("ip");
			}
			new_elem_proto.execute = function () {
				//console.log("Default no op execution of", this);
			};
			new_elem_proto.register_attr_changed_task = function ( name, task ) {
				//console.log("register task called ", this, name, task );
				var task_list = this.attr_changed_tasks.get(name);
				if(!task_list) {
					task_list = [];
					this.attr_changed_tasks.set(name, task_list);
				}
				task_list.push( task );
			};

		// override getAttribute
			new_elem_proto._getAttribute = new_elem_proto.getAttribute;
			new_elem_proto.getAttribute = rn.template.attr;

		// try to register 
			var new_elem;
			try {
				new_elem = document.registerElement(elem_name, {
					prototype: new_elem_proto
				});
			} catch (e) {
				// If we have registered then return
				// console.log(e, e.stack);
				return;
			} finally {
				rn.queue_event(base,elem_name,'register',false,new_elem_proto);
			}

		if(!!new_elem) {
			// save the constructor
				new_elem_proto[elem_name] = new_elem;
				rn.components[rn.conversion.cc(elem_name)] = new_elem_proto;

			//console.log("Use-a created elem eg", rn.components[elem_name]);
			console.log(elem_name, "loaded.");
		}
	}

	UseAProto.createdCallback = function() {
		var elem_to_use = this.getAttribute('name');
		if(!!elem_to_use) {
			var base_override = this.getAttribute('base');
			var path_to_base_directory = [(base_override  || base), elem_to_use].join(sep);
			var path_to_import_file = [path_to_base_directory, import_file_name].join(sep);
			var importer = document.createElement('link');
			importer.rel = 'import';
			importer.href = path_to_import_file;
			importer.addEventListener('load',rn.selector.extract.bind(null,'target').then(create_elem.bind(null, elem_to_use)));
			(document.head || document.querySelector('head') || document.querySelector('body')).appendChild(importer);
			
			var path_to_code_file = [path_to_base_directory, code_file_name].join(sep);
			var executer = document.createElement('script');
			//executer.addEventListener('load',console.log.bind(console,"SCRIPT ADDED", elem_to_use));
			executer.src = path_to_code_file;	
			this.appendChild(executer);
		}
	};	

	this['use-a'] = document.registerElement('use-a', { 
		prototype: UseAProto
	});
});
