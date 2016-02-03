(function() {
	function register_op_set(root) {
		this.execute = function () {
			//console.log("Execute set", this);
			var elem = this;
			var map = rn.conversion.attr_map.bind(this)(this.attributes);
			var args = [ map.get('target-parent'), map.get('target'), this ];
			if(this.hasAttribute('multiple')) {
				var targets = rn.selector.get_all.apply(null, args);
			} else {
				targets = [ rn.selector.get.apply(null, args) ];
			}
			//console.log("Set ", this, targets);
			targets.forEach( function ( target, index ) {
				if(!!target) {
					var template_origin = target;
					if(elem.hasAttribute('template-origin')) {
						template_origin = elem;
					}
					var value = elem.attributes.getNamedItem('value'), attr = elem.attributes.getNamedItem('attr').value;
					if(!value) {
						value = "";
					} else {
						value = value.value;
					}
					var template_vars = rn.template.vars(value);
					if(template_vars.length > 0) {
						value = rn.template.d(template_origin, {index:index}, attr, value);
						if(elem.hasAttribute('debug')) {
							console.log("Template value ", template_vars, target, index, elem, value );
						}
					}	
					var template_vars_attr = rn.template.vars(attr);
					if(template_vars_attr.length > 0) {
						attr = rn.template.d(template_origin, {index:index}, attr, attr);
						if(elem.hasAttribute('debug')) {
							console.log("Template value ", template_vars_attr, target, index, elem, value, attr );
						}
					}
					if(elem.hasAttribute('property')) {
						target[attr] = value;
					}
					if(elem.hasAttribute('increment')) {
						var target_attr = target.getAttribute(attr);
						if(!target_attr) {
							target_attr = value;
						}
						target_attr = parseInt(target_attr);
						if(isNaN(target_attr)) {
							target_attr = 1137;
						}
						target.setAttribute(attr, target_attr+1);
					} else {
						target.setAttribute(attr, value || "");
					}
				}	
			});
		};	
	}

	rn.create_task('op','set','register',register_op_set);
	rn.create_task('op','set','setup',rn.noop);
}());
