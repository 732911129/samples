(function() {
	function register_op_mv() {
		this.execute = function () {
			function go() {
				//console.log("OP MV EXECUTION", this);
				var from_selector = this.getAttribute("from");
				var from_parent = this.getAttribute("from-parent");
				var to_parent = this.getAttribute("to-parent");
				var to_selector = this.getAttribute("to");
				var remove_condition = this.hasAttribute("remove");
				if(from_selector && to_selector) {
					var from = rn.selector.attr(from_selector);
					var to =rn.selector.attr(to_selector);
					var from_element = rn.selector.get(from_parent, from.element_selector, this);
					var to_element = rn.selector.get(to_parent, to.element_selector, this);
					if(this.hasAttribute('debug')) {
						console.log("from", from.element_selector, "to", to.element_selector);	
						console.log("from", from.attribute_requested, "to", to.attribute_requested);	
						console.log("elements", from_element, to_element);
					}
					if(!to_element && this.hasAttribute('to-alternate')) {
						var to_alt_selector = this.getAttribute('to-alternate');
						var to_alt = rn.selector.attr(to_alt_selector);
						var to_alt_element = rn.selector.get(to_parent, to_alt.element_selector, this);
						if(!!to_alt_element) {
							to_element = to_alt_element;
							to = to_alt;
						}
					}
					if((!!from_element || this.hasAttribute('create-ok')) && !!to_element) {
						var from_attribute_value; 				
						if(!this.hasAttribute('create-ok')) {
							if(this.matches('[property~="from"]')) {
								from_attribute_value = from_element[rn.conversion.prop_name(from.attribute_requested)];
							} else {
								from_attribute_value = from_element.getAttribute(from.attribute_requested);
							}
						} else {
							from_attribute_value = "";
						}
						/* and only transmit the attribute's value if it is not null */
							/* unless 'create-ok' is set */
							/* so if the attribute exists */
							/* it's okay for it to be an empty string */
						if((from_attribute_value !== null && from_attribute_value !== undefined) || this.getAttribute('create-ok')) {
								var remove_before = (from_element === to_element && 
									from.attribute_requested === to.attribute_requested);
								if(!!remove_before && !!remove_condition) {
									//console.log("Removing attribute at from");
									from_element.removeAttribute(from.attribute_requested);
								}
								if(this.matches('[property~="to"]')) {
									to_element[rn.conversion.prop_name(to.attribute_requested)] = from_attribute_value;
								} else {
									to_element.setAttribute(to.attribute_requested,from_attribute_value);	
								}
								if(!remove_before && !!remove_condition && !!from_element) {
									//console.log("Removing attribute at from");
									from_element.removeAttribute(from.attribute_requested);
								}
								//console.log("Transmitted attribute");
						}	else {
							//console.log("No attribute to transmit", from.attribute_requested);
						}
					} else {
						//console.log("This MV has invalid elements");
					}
				} else {
					//console.log("This MV has no from and to attributes");
				}
			}
			if(this.hasAttribute('delay')) {
				setTimeout(go.bind(this), parseInt(this.getAttribute('delay') || 0));
			} else {
				go.bind(this)();
			}	
		};
	}

	rn.create_task('op','mv','register',register_op_mv);
	rn.create_task('op','mv','setup',rn.noop);
}());

