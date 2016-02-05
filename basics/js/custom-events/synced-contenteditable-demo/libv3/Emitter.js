"use strict";
self.EVENT_SCOPE = 'edit';
self.Emitter = class Emitter {
	constructor(event_scope,source) {
		var API = this;
		API.source = source;
		API.event_scope = event_scope || '';
		return API;
	}	

	send(name,data) {
		var event_name = this.event_scope + '.' + name;
		var event_detail = { detail : data, bubbles : true, cancelable: true };
		var event = new CustomEvent(event_name, event_detail);
		this.source.dispatchEvent(event);
	}
}
