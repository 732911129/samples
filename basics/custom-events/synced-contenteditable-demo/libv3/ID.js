"use strict";
self.ID = class ID {
	static mint() {
		var x = +(new Date());
		var y = Math.random();
		var z = Math.random();
		var id = '';
		id += Math.round(x*y);
		id += Math.round(x*z);	
		return id;
	}
	static smint() {
		var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
		var id = '';
		var togo = 32;
		while(togo--) {
			id += alphabet[Math.floor(Math.random()*alphabet.length)];
		}
		return id;
	}
}
