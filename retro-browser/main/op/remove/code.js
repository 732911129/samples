(function() {
	function register_op_remove(root) {
		this.execute = function () {
			var attach_parent = this.getAttribute('attach-parent');
			var attach = this.getAttribute('attach');					
			var multiple = this.hasAttribute('multiple');
			var to_remove;
			if(!!multiple) {
				to_remove = rn.selector.get_all(attach_parent, attach, this);
			} else {
				to_remove = [rn.selector.get(attach_parent, attach, this)];
			}
			if(this.hasAttribute('debug')) {
				console.log("Removing ", to_remove, " by ", this );
			}
			for(var elem of to_remove) {
				if(!!elem) {
					elem.remove();
				}
			}
			return to_remove.length;
		}
	}

	rn.create_task('op','remove','register',register_op_remove);
	rn.create_task('op','remove','setup',rn.noop);
}());


