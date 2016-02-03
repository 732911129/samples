(function() {
	function register_op_del(root) {
		this.execute = function () {
			if(this.hasAttribute('debug')) {
				console.log("Execute del", this);
			}
			var map = rn.conversion.attr_map.bind(this)( this.attributes );
			var args = [ map.get('target-parent'), map.get('target'), this ];
			if(this.hasAttribute('multiple')) {
				var targets = rn.selector.get_all.apply(null, args);
			} else {
				targets = [ rn.selector.get.apply(null, args) ];
			}
			for(var target of targets) {
				if(!!target) {
					target.removeAttribute(map.get('attr'));
				}	
			}
		};	
	}

	rn.create_task('op','del','register', register_op_del);
	rn.create_task('op','del','setup', rn.noop);
}());
