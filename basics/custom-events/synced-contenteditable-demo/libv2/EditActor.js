"use strict";
self.EditActor = class EditActor {
	constructor(properties) {
		// constants
			const API = this;
			const EVENT_SCOPE = 'edit';

		// variables
			API.edit_script = null; // set after responder loads

		// initialize some properties required for below
			// initialize the element we are sensing on
				function initialize_source_element() {
					var source;

					// are we calling with class(element) or class(properties)
						if (!!properties && is_el(properties.source)) {
							source = properties.source;
						} else {
							source = document.body;
						}

					API.source = source;
				}
				initialize_source_element();

			// initialize target element
				function initialize_page_element() {
					var page;

					// are we calling with class(element) or class(properties)
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
				initialize_page_element();

		// private helpers
			// validate the element 
				function is_el(node) {
					if(node instanceof Element) {
						return true;
					}	else {
						return false;
					}
				}

				var emitter = (new class Emitter {
					// constructor
						constructor(event_scope) {
							var API = this;
							// save the given event scope
								API.event_scope = event_scope || '';
							return API;
						}	

					// send a custom event that includes the given data
						send(name,data) {
							var event_name = this.event_scope + '.' + name;
							// create and fire custom event
								var event_detail = { detail : data, bubbles : true, cancelable: true };
								var event = new CustomEvent(event_name, event_detail);
								API.page.dispatchEvent(event);
						}
				}(EVENT_SCOPE));

			// event responder (linked to API.on)
				var responder = (new class Responder {
					// initialize
						constructor(target) {
							var API = this;
							API.target = target;	
							API.saver = new EditScript();
							API.last_selection = null;
							return API;
						}

					// event send helpers
						// send the start state
							send_start(state) {
								var r = ranges.save();
								this.target.innerText = "";
								this.target.focus();
								document.execCommand('insertText', null, state);
								ranges.load(r);
							}
						// send a snapshot of the selection
							send_select(measure) {
								var r = ranges.save();
								this.last_selection = measure;
								selections.set_selection(this.target,measure);	
								// update cursor here
								emitter.send('select',{selection:measure});
								ranges.load(r);
							}
						// send a delete command
							send_delete() {
								var r = ranges.save();
								if(!!this.last_selection) {
									selections.set_selection(this.target,this.last_selection);	
								}
								this.last_selection = null;
								document.execCommand('delete');
								ranges.load(r);
							}
						// send an insert command
							send_insert(text) {
								var r = ranges.save();
								if(!!this.last_selection) {
									selections.set_selection(this.target,this.last_selection);	
								}
								this.last_selection = null;
								document.execCommand('insertText',null,text);
								ranges.load(r);
							}

					// event responders and emitters
						get start() {
							var my = this;
							return function(e) {
								my.send_start(e.detail.state);
							};
						}
						get select() {
							var my = this;
							return function(e) {
								my.send_select(e.detail.selection);
							};
						}
						get remove() {
							var my = this;
							return function(e) {
								my.send_delete();
							};
						}
						get insert() {
							var my = this;
							return function(e) {
								my.send_insert(e.detail.text);
							};
						}

					// saver
						get save() {
							var my = this;
							return function(e) {
								my.saver.save(e);
							};
						}
				}(API.page)); 
			API.edit_script = responder.saver;

			// public methods using privates 
				// play the edit script
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
							// TODO: enhancement and refactor
								// we can expose some more public methods
								// (like sequene item getters or iterators with yield)
								// on edit script to avoid exposing the internals
							if(index < API.edit_script.store.length) {
								var next = API.edit_script.store[index];
								var deploy_in = next.since_last;
								if(deploy_in == 'first') {
									deploy_in = 0;
								}
								deploy_in *= speed_up;
								index++;
								//console.log("Next action in ", deploy_in);
								setTimeout(deploy.bind(null,next,play_next),deploy_in);
							} else {
								console.log("Sequence ends.");
							}
						}
						play_next();
					};

		// initialize events
			// listen for the events
				function initialize_event_listeners() {
					API.source.addEventListener(EVENT_SCOPE+'.'+'start', responder.start);
					API.source.addEventListener(EVENT_SCOPE+'.'+'insert', responder.insert);
					API.source.addEventListener(EVENT_SCOPE+'.'+'select', responder.select);
					API.source.addEventListener(EVENT_SCOPE+'.'+'delete', responder.remove);
				}
				initialize_event_listeners();	
				function initialize_event_saver() {
					API.source.addEventListener(EVENT_SCOPE+'.'+'start', responder.save);
					API.source.addEventListener(EVENT_SCOPE+'.'+'insert', responder.save);
					API.source.addEventListener(EVENT_SCOPE+'.'+'select', responder.save);
					API.source.addEventListener(EVENT_SCOPE+'.'+'delete', responder.save);
				}
				initialize_event_saver();

		return API;
	}
} 
