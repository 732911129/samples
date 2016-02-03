	var style_sheet_id = "restyle";

	/* get a dimensional property of an element */
		function get_dim( e, prop ) {
			return e.getBoundingClientRect()[prop];
		}

	/* style update helper functions */
		function make_attribute_selector( name, value ) {
			return '[' + name + '="' + value + '"]';
		}

		function get_stylesheet( suffix ) {
			var z = document.querySelector('style#' + style_sheet_id + suffix);
			if(!z) {
				z = document.createElement('style');
				z.setAttribute('id', style_sheet_id + suffix );
				(document.querySelector('head') || document.querySelector('body')).appendChild( z );
			}
			/* return the stylesheet */
			return z.sheet;
		}

		/* we could index these rules more efficiently */
		/* say with a map or by making the index derivable from the selector */
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
			var sheet = get_stylesheet( suffix );	
			var rule = get_latest_rule( sheet, selector );	
			var rule_style = rule.style;	

			for(var entry of property_map) {
				rule_style.setProperty(entry[0],entry[1]);
			}	
		}


