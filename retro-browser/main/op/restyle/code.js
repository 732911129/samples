(function () {
	function register_op_restyle() {
		var style_sheet_id = 'restyle';
		var execute_absence_before_apply_ms = 250;
		// functions brought in
			function make_attribute_selector( name, value ) {
				return '[' + name + '="' + value + '"]';
			}
			function get_stylesheet( parent_doc, suffix ) {
				var z = parent_doc.querySelector('style#' + style_sheet_id + suffix);
				if(!z) {
					z = document.createElement('style');
					z.setAttribute('id', style_sheet_id + suffix );
					(parent_doc.querySelector('head') || parent_doc.querySelector('body') || parent_doc).appendChild( z );
				}
				/* return the stylesheet */
				return z.sheet;
			}
			/* we could index these rules more efficiently */
			/* say with a map or by making the index derivable from the selector */
			/* we will index these with a map */
			/* since we always know the index when we insert a rule. */
			function get_latest_rule(sheet, selector) {
				/* find the rule */
				var rules = sheet.cssRules;	
				var rule, i;
				for(i = rules.length-1; i >= 0; i--) {
					if( rules.item(i).selectorText === selector ) {
						rule = rules.item(i);
						break;
					}
				}
				if(!rule) {
					sheet.insertRule(selector+ "{}",rules.length);	
					rule = rules.item(rules.length-1);
				}
				return rule;
			}
			function create_or_update_style( selector, property_map, suffix ) {
				suffix = suffix || "";
				/* get the style sheet, the rule, and the rule's style declaration */
				var parent_doc = rn.selector.get('::shadow',null,this);
				var sheet = get_stylesheet( parent_doc, suffix );	
				var rule = get_latest_rule( sheet, selector );	
				var rule_style = rule.style;	

				for(var entry of property_map) {
					/* this could be rule_style[entry[0]] = entry[1] */
					rule_style.setProperty(entry[0],entry[1]);
				}	
			} 
		// api 
			this.make_attribute_selector = make_attribute_selector;
			this.create_or_update_style = create_or_update_style;
			this.get_stylesheet = get_stylesheet;
			this.get_latest_rule = get_latest_rule;	
		// functions migrated from setup
			this.apply_changes = function () {
				var change_fun;
				while(!!(change_fun = this.style_changes_queue.pop())) {
					change_fun();
				}
				this.clear_apply_queue();
			}
			this.clear_apply_queue = function () {
				var id;
				while(!!(id=this.apply_changes_queue.pop())) {
					clearInterval(id);
				}
			}
		// op specific version of standard functions migrated from setup
			/* bases are numeric values subtracted from the referenced attribute value */
			this.execute = function () {
				var map = rn.conversion.attr_map.bind(this) ( this.attributes, ['from', 'bases'] );
				var style_parent = map.get('style-parent') || this;
				this.apply_bases(map);
				//console.log("Execute restyle", this, map);
				//map.set('border-color','lime');
				/* As long as we separate the property resolution from the following */
				/* style insertion and and place it in another loop we really win */
				this.style_changes_queue.push(create_or_update_style.bind(this, this.getAttribute('from'), map ));
				this.apply_changes_queue.push( setInterval ( this.apply_changes.bind(this), execute_absence_before_apply_ms ) );
			}	
	}

	function setup_op_restyle() {
		this.style_changes_queue = [];
		this.apply_changes_queue = [];
	}

	rn.create_task('op','restyle','register',register_op_restyle);
	rn.create_task('op','restyle','setup',setup_op_restyle);
}());

