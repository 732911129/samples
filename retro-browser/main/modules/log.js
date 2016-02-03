rn.log = new (function() {
	/* functions */
		function log_json(msg) {
			//console.log(msg);
			//console.log("Logging ", JSON.stringify(msg));
		}

	/* api */
		this.json = log_json;
});
