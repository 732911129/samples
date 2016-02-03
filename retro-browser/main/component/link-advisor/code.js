(function () {
	function register_link_advisor(root) {
		// functions 
			function advise_link( msg, clear ) {
				if(clear == 1 || (msg.sourceId.indexOf("linkadvisor.js") !== -1 && msg.line == 20)) {
					//console.log("Advising link ", msg, "this" , this, "real this", this);
					if(!!msg.message) {
						this.innerHTML = "&nbsp;" + msg.message + "&nbsp;" 
					} else {
						this.innerHTML = "";	
					}
				}
			}
		// api
			this.advise_link = advise_link;
	}

	rn.create_task('component','link-advisor','register',register_link_advisor);
}());
