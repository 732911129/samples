"use strict";
self.EditActor = class EditActor {
	constructor(properties) {
		const API = this;
		const EVENT_SCOPE = 'edit';

		API.edit_script = null; // set after responder loads

		// setup instance
			function is_el(node) {
				if(node instanceof Element) {
					return true;
				}	else {
					return false;
				}
			}

			function initialize_source_element() {
				var source;
				if (!!properties && is_el(properties.source)) {
					source = properties.source;
				} else {
					source = document.body;
				}
				API.source = source;
			}

			function initialize_page_element() {
				var page;
				if (is_el(properties)) {
					page = properties;
				} else if (!!properties && is_el(properties.page)) {
					page = properties.page;
				} else {
					page = document.createElement('div');
					page.contentEditable = true;
					document.body.appendChild(page);
				}
				API.page = page;
			}

		initialize_source_element();
		initialize_page_element();

		// privates 
			var emitter = new Emitter(EVENT_SCOPE, API.page); 

			var responder = (new class Responder {
				constructor(target) {
					var API = this;
					API.target = target;	
					API.saver = new EditScript();
					API.last_selection = null;
					return API;
				}

				get start() {
					var my = this;
					return function(e) {
						var r = ranges.save();
						my.target.innerText = "";
						my.target.focus();
						document.execCommand('insertText', null, e.detail.state);
						ranges.load(r);
					};
				}
				get select() {
					var my = this;
					return function(e) {
						var r = ranges.save();
						my.last_selection = e.detail.selection;
						selections.set_selection(my.target,my.last_selection);	
						emitter.send('select',{selection:my.last_selection});
						ranges.load(r);
					};
				}
				get remove() {
					var my = this;
					return function(e) {
						var r = ranges.save();
						if(!!my.last_selection) {
							selections.set_selection(my.target,my.last_selection);	
						}
						my.last_selection = null;
						document.execCommand('delete');
						ranges.load(r);
					};
				}
				get insert() {
					var my = this;
					return function(e) {
						var r = ranges.save();
						if(!!my.last_selection) {
							selections.set_selection(my.target,my.last_selection);	
						}
						my.last_selection = null;
						document.execCommand('insertText',null,e.detail.text);
						ranges.load(r);
					};
				}

				get save() {
					var my = this;
					return function(e) {
						my.saver.save(e);
					};
				}
			}(API.page)); 

		// API publics
			API.edit_script = responder.saver;

			API.play = function play(speed_up) {
				speed_up = speed_up || 1;
				var start = responder.start, remove = responder.remove, 
					insert = responder.insert, select = responder.select,
					index = 0;
				function deploy(edit,next) {
					switch(edit.type) {
						case EVENT_SCOPE+'.'+"start":
							start(edit);	
							break;
						case EVENT_SCOPE+'.'+"select":
							select(edit);
							break;
						case EVENT_SCOPE+'.'+"delete":
							remove(edit);
							break;
						case EVENT_SCOPE+'.'+"insert":
							insert(edit);
							break;
					}
					if(!!next) {
						next();
					}
				}
				function play_next() {
					if(index == 0) {
						console.log("Sequence begins");
					}
					if(index < API.edit_script.store.length) {
						var next = API.edit_script.store[index];
						var deploy_in = next.since_last;
						if(deploy_in == 'first') {
							deploy_in = 0;
						}
						deploy_in *= speed_up;
						index++;
						console.log("Next action in ", deploy_in);
						setTimeout(deploy.bind(null,next,play_next),deploy_in);
					} else {
						console.log("Sequence ends.");
					}
				}
				play_next();
			};

		// listeners
			function initialize_event_listeners() {
				API.source.addEventListener(EVENT_SCOPE+'.'+'start', responder.start);
				API.source.addEventListener(EVENT_SCOPE+'.'+'insert', responder.insert);
				API.source.addEventListener(EVENT_SCOPE+'.'+'select', responder.select);
				API.source.addEventListener(EVENT_SCOPE+'.'+'delete', responder.remove);
			}
			function initialize_event_saver() {
				API.source.addEventListener(EVENT_SCOPE+'.'+'start', responder.save);
				API.source.addEventListener(EVENT_SCOPE+'.'+'insert', responder.save);
				API.source.addEventListener(EVENT_SCOPE+'.'+'select', responder.save);
				API.source.addEventListener(EVENT_SCOPE+'.'+'delete', responder.save);
			}

		initialize_event_saver();
		initialize_event_listeners();	

		return API;
	}
} 
