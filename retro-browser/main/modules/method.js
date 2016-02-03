rn.method = new (function method() {
	/* functions */
		function go(fun) {
			fun();
		}
		function retry( name, fun, times, interval, callback ) {
			return function () {	 
				callback = callback || {};
				interval = interval || 337;
				if(times > 0) {
					var result = fun();
					if(!!result) {
						//console.log(name, " success.");
						if(!!callback.success) {
							callback.success.apply(result);
						}
					} else {
						//console.log("Retrying ", name, times, "times");
						setTimeout( retry( name, fun, times-1, interval, callback ), interval );	
					}
				} else {
					//console.log("Failed ", name, callback);
					if(!!callback.fail) {
						callback.fail.apply(null);
					}
				}
			};
		}
	/* Function prototype modification */
		Function.prototype.then = function(next_fun) {
			var z = this;
			var x = next_fun;
			return function(inp) {
				x(z(inp));
			};
		} 
	this.go = go;
	this.retry = retry;	
});
