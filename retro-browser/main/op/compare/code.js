(function () {
	function register_op_compare() {
		// functions
			function contains(string, query) {
				if(!!string) {
					return string.indexOf(query) !== -1;
				}
			}
		// api
			this.contains = contains
	}

	rn.create_task('op','compare','register',register_op_compare);
	rn.create_task('op','compare','setup',rn.noop);
}());
