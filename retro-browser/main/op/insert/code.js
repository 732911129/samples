(function () {
	function register_op_insert(root) {
		var op_insert_base_path = "/main";
		this.log_result = function (result) {
			this.set_result(result);
			//console.log("Script result ", this, result);
		}
		this.execute = function () {
			var attach_parent = this.getAttribute('attach-parent');
			var attach = this.getAttribute('attach');
			var attach_element = rn.selector.get(attach_parent,attach,this);
			if(!!attach_element) {
				var details = {};
				if(this.hasAttribute('src')) {
					details.file = [op_insert_base_path, this.getAttribute('src')].join('/');
				} else if (this.hasAttribute('code')) {
					details.code = this.getAttribute('code');
				}
				if(!attach_element.hasAttribute('closed')) {
					var t= this;
					attach_element.executeScript(details, t.log_result.bind(t));
				}
			} else {
				console.log("No attach element ", this );
			}
		}
	}

	rn.create_task('op','insert','register',register_op_insert);
	rn.create_task('op','insert','setup', rn.noop);
}());
