(function () {
	function register_tab_body(root) {
		// properties 
			this.default_src = "https://www.google.com/";
			this.search_provider = "https://www.google.com/#q=";
		// functions 
			this.mark_ready = function mark_ready() {
				this.setAttribute('ready','');	
			}
			this.attach_incoming = function attach_incoming(event) {
				function _attach_incoming() {
					if(this.hasAttribute('debug')) {
						console.log("An incoming page has arrived", event);
						console.log("It requested the following ", event.initialWidth, event.initialHeight, event.windowOpenDisposition);
					}
					var z = this.shadowRoot.querySelector('webview');
					var to_attach = false;
					if(!z) {
						to_attach = true;
						z = document.createElement('webview');
					}
					//console.log('attach incoming this', this, event);
					var p = this.shadowRoot.querySelector('#tab-body');
					var q = event.window;
					function insert() {
						if(!!to_attach) {
							p.appendChild(z);
						}
					}
					function attach() {
						q.attach(z);
					}
					/* this is most performant */
					var real_this = this;
					setTimeout(function () { insert(); real_this.mark_ready(); attach(); }, 50);
					if(this.hasAttribute('debug')) {
						console.log("Created, attached to a page and queued to insert", z);
					} 
				}
				var target_tabid = this.getAttribute('tabid');
				//console.log(target_tabid);
				rn.create_task('component','tab-body','attached-post', _attach_incoming.bind(this),'[tabid="'+target_tabid+'"]',true);
			}
	}
	function attach_tab_body(root) {
		if(this.hasAttribute('debug')) {
			console.log("We are creating a tab body", this);
		}
		// check for a webview 
			var root = this.shadowRoot;
			var webview = root.querySelector('webview');
		if(!webview) {
			// helper function 
				function create_and_attach_webview(src) {
					// create a webview
						z = document.createElement('webview');
					// define functions that will set its properties and insert it
						if(this.hasAttribute('debug')) {
							console.log("We proceed immediately to attach webview", z, this);
						}
						function set(az, uri) {
							return function() {
								az.allowtransparency = true;
								az.setAttribute('partition',"persist:cris-1");
								az.setAttribute('src',uri);
							};
						}
						function insert(aroot, az) {
							return function () { 
								aroot.querySelector('#tab-body').appendChild(az);
							};
						}
						if(this.hasAttribute('debug')) {
							console.log("Created, set and queued for attach ", z);
						} 
					// perform the insertion and property setting
						setTimeout( insert(root,z), 50);
						setTimeout( this.setAttribute.bind(this,'ready',''), 50);
						setTimeout( set(z,src), 50);
				}
			// get the webview src
				var webview_src;
				if(this.hasAttribute('src')) {
					webview_src = this.getAttribute('src');
				}
				webview_src = webview_src || this.default_src;
			// and if we are not waiting for an incoming context we create and attach a webview
			//console.log("Test ", this, this.hasAttribute('await-incoming'), this.awaitIncoming, !!this.parentNode);
			if(!this.hasAttribute('await-incoming') && !this.awaitIncoming) {
				create_and_attach_webview.call(this,webview_src);
			} else {
				rn.queue_event('component','tab-body','attached-post',true,this);
			}	
		}		 
	}
	function attr_changed_tab_body( attr_name, old_val, new_val ) {
		if(attr_name == "src" && new_val !== "") {
			var webview_url, src = new_val;
			/* if we start with http we send that as a url */
			/* or if we include a space we send that as query parameters */
			/* or if we include a dot we append a http and send that as url */
			/* or if we don't start with http://, nor include a space, nor include a dot */
			/* then we assume a single word query */
			if(src.indexOf('http://') === 0 || src.indexOf('https://') === 0 || src.indexOf('blob:') === 0 || src.indexOf('chrome-extension://') === 0) {
				webview_url = src;
			} else if(/\s/.test(src)) {
				webview_url = this.search_provider + src.replace(/\s+/g,'+');
			} else if(src.indexOf('.') !== -1) {
				webview_url = 'http://'+src;
			} else {
				webview_url = this.search_provider + src;
			}
			var webview = this.shadowRoot.querySelector('webview');
			if(this.hasAttribute('debug')) {
				console.log("Assigning webview ", webview, " src ", webview_url );
			}
			if(!!webview) {
				webview.setAttribute('src',webview_url);
			} else {
				console.log("No webview found ", this, "to give url", webview_url);	
			}
		}
	}

	rn.create_task('component','tab-body','register', register_tab_body);
	rn.create_task('component','tab-body','attached', attach_tab_body);
	rn.create_task('component','tab-body','attr_changed', attr_changed_tab_body);
}());
