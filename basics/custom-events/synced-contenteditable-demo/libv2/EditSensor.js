"use strict";
self.EditSensor = class EditSensor {
	constructor(properties) {
		// constants
			const API = this;
			const EVENT_SCOPE = 'edit';

		// initialize some properties required for below
			// initialize the element we are sensing on
				function initialize_on_element() {
					var el;

					// are we calling with class(element) or class(properties)
						if(is_el(properties)) {
							el = properties;	
						} else if (!!properties && is_el(properties.el)) {
							el = properties.el;
						} else {
							el = document.body;
						}

					API.on = el;
				}
				initialize_on_element();

		// private helpers: validation, ranges, selections, event responder, event emitter
			// validate the element 
				function is_el(node) {
					if(node instanceof Element) {
						return true;
					}	else {
						return false;
					}
				}

			// event emitter (linked to Event scope)
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
								API.on.dispatchEvent(event);
						}
				}(EVENT_SCOPE));

			// event responder (linked to API.on)
				var responder = (new class Responder {
					// initialize
						constructor(target) {
							var API = this;
							API.target = target;	
							API.last_selection = null;
							this.send_start();
							return API;
						}

					// event send helpers
						// send the start state
							send_start() {
								emitter.send('start',{state:this.target.innerText||''});
							}
						// send a snapshot of the selection [optimized]
								// details: 
									// we remove duplicate selection events
							send_select() {
								var selection = selections.measure_selection(this.target);
								if(!!this.last_selection && 
									selection.start == this.last_selection.start &&
									selection.end == this.last_selection.end) {
									return;
								} else {
									this.last_selection = selection;
								}
								// capture this event to update cursor
								emitter.send('select',{selection:selection});
							}
						// send a delete command
							send_delete() {
								emitter.send('delete');
							}
						// send an insert command [optimized]
								// details:
									// we decline to send inserts where text is empty
							send_insert(text) {
								if(!!text && text.length > 0) {
									emitter.send('insert',{text:text});
								}
							}

					// event responders and emitters
						get textInput() {
							var my = this;
							return function(e) {
								my.send_select();
								my.send_insert(e.data);
							};
						}
						get keydown() {
							var my = this;
							return function (e) {
								my.send_select();
								if(e.keyCode == 8) my.send_delete();
							};
						}
						get beforecut() {
							var my = this;
							return function(e) {
								my.send_select();
								my.send_delete();
							};
						}
						get paste() {
							var my = this;
							return function(e) {
								my.send_select();
								my.send_insert(e.clipboardData.getData('text/plain'));
							};
						}
				}(API.on)); 

		// initialize events
			// listen for the events
				function initialize_event_listeners() {
					API.on.addEventListener('textInput', responder.textInput);
					API.on.addEventListener('keydown', responder.keydown);
					API.on.addEventListener('beforecut', responder.beforecut);
					API.on.addEventListener('paste', responder.paste);
				}
				initialize_event_listeners();	

		return API;
	}	
}

