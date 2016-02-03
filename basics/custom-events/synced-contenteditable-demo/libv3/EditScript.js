"use strict";
// TODO: enhancement and refactor
	// we can expose some more public methods
	// (like sequene item getters or iterators with yield)
	// on edit script to avoid exposing the internals
self.EditScript = class EditScript {
	constructor(id,start_state) {
		var API = this;
		API.id = id || ID.mint();
		API.start_state = start_state || '';
		API.store = [];
		this.save({type:'open',detail: {start_state:this.start_state, id: this.id}});
		return API;
	}
	save(edit_event) {
		var edit = {type:edit_event.type, detail:edit_event.detail};
		edit.number = this.store.length;
		edit.timestamp = +(new Date());
		var last_edit = this.store[this.store.length-1];
		if(!!last_edit && !!last_edit.timestamp) {
			edit.since_last = edit.timestamp - last_edit.timestamp;	
		} else {
			edit.since_last = 'first';
		}
		this.store.push(edit);
	}
}
