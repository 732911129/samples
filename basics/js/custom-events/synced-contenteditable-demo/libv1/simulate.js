var simulate = new (function simulate() {
	var API = this;

	API.mouse = {}, API.key = {};

	// helpers
		function get(sel) {
			if(sel instanceof HTMLElement) {
				return sel;
			}
			return document.querySelector(sel);
		}

	// mouse
		function click(sel) {

		}

		function hover(sel) {

		}

		function leave(sel) {

		}

		function down(sel) {

		}

		function up(sel) {

		}

	// key
		// helper
			function fakeKey(event, text) {
				return event;					
			}

		// send text to an element with selector 
			function send(sel,what) {
				var el = get(sel);
				var event = document.createEvent('TextEvent');
				event.initTextEvent('textInput',true,true,self,what);
				var fakedown = fakeKey(new KeyboardEvent('keydown'),what), 
						fakepress = fakeKey(new KeyboardEvent('keypress'),what),
						fakeup = fakeKey(new KeyboardEvent('fakeup'),what);
				if(document.activeElement !== el) {
					//TODO: try replacing this with simulated mouse events
					el.focus();
				}
				//el.dispatchEvent(fakedown);
				//el.dispatchEvent(fakepress);
				el.dispatchEvent(event);	
				//el.dispatchEvent(fakeup); 
			}	

	// build API
		API.key.send = send;		

	return API;
});
