"use strict";
self.EditSensor = class EditSensor {
	constructor(properties) {
		const API = this;

		// initialize some properties required for below
			function initialize_on_element() {
				var el;
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
			function is_el(node) {
				if(node instanceof Element) {
					return true;
				}	else {
					return false;
				}
			}

			var emitter = new Emitter(EVENT_SCOPE, API.on);

			var responder = (new class Responder {
				constructor(target) {
					var API = this;
					API.target = target;	
					API.last_selection = null;
					this.send_start();
					return API;
				}

				send_start() {
					emitter.send('start',{state:this.target.innerText||''});
				}
				send_select() {
					var selection = selections.measure_selection(this.target);
					if(!!this.last_selection && 
						selection.start == this.last_selection.start &&
						selection.end == this.last_selection.end) {
						return;
					} else {
						this.last_selection = selection;
					}
					emitter.send('select',{selection:selection});
				}
				send_delete() {
					emitter.send('delete');
				}
				send_insert(text) {
					if(!!text && text.length > 0) {
						emitter.send('insert',{text:text});
					}
				}

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

		// initialize
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

