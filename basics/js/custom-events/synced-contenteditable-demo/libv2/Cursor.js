"use strict";
self.Cursor = class Cursor {
	constructor(properties) {
		var API = this;
		if(!properties.for) {
			return;
		}
		this.for = properties.for;
		this.cursor = document.createElement('div');
		this.cursor.style.position = 'fixed';
		this.for.addEventListener('edit.select',function (e) {
			var x = ranges.save().getClientRects()[0];
			if(!!x) {
				API.cursor.style.left = x.left;
				API.cursor.style.top = x.top;	
			}
		});
		this.color = properties.color;
		this.cursor.style.backgroundColor = properties.color || 'lime';	
		this.cursor.style.width = '2ch';
		this.cursor.style.height = '3ex';
		document.body.appendChild(this.cursor);
		return API;	
	}
};
