rn.template = new (function template() {
	/* functions */
		function custom_get_attribute( attr_name, scope_vars ) {
			var attr = { text : this._getAttribute( attr_name ), name : attr_name };
			attr.template = attr.text;
			print_attribute_template( this, scope_vars, attr );
			if(this.matches('[_resolve-selector~="'+attr_name+'"]')) {
				var parent = this.getAttribute(attr_name+'-parent');
				var resolved_value = rn.selector.get(parent, attr.text, this);
				if(this.hasAttribute('debug')) {
					console.log("Custom get attribute Resolving selector ", attr_name, parent, resolved_value);
				}		
				attr.text = resolved_value;
			}
			attr.text = rn.selector.include( attr.name, attr.text, this );
			attr.text = rn.selector.project( attr.name, attr.text, this );
			return attr.text;	
		}
		function get_template_vars ( template_text ) {
			var matches, vars = {};
			var regex = /{{([^{}]+)}}/g;
			while(matches = regex.exec(template_text)) {
				vars[matches[1]] = true;
			}	
			return Object.keys(vars);
		}
		function resolve_template_var(scope_vars, attr, name) {
			/* scope priority : 
				1) scope vars,   
				3) elem properties, 
				2) elem attributes, 
				4) parent attributes, 
				5) default attribute 
			*/
			"use strict";
			var parent_source, scope_source, template_var_value;
			var var_parts = name.split('.');
			var var_name = var_parts.shift();
			//console.log(var_name, var_parts);
			if(!!this) {
				parent_source = rn.selector.get("["+var_name+"]",null,this) || 
					rn.selector.get('[exports~="'+var_name+'"]',null,this);
			}
			if(!!scope_vars) {
				scope_source = 
					(rn.type.item(scope_vars) == "Object" && scope_vars.hasOwnProperty(var_name)) ?
					scope_vars : null;
			}
			var reg = new RegExp("{{\\s*" + name.replace(/\(\)/g,'\\(\\)') + "\\s*}}","g");
			var property_var_name = rn.conversion.prop_name(var_name); 
			/* first attempt scope_vars, this, parent_source */
			if(!!scope_source) {
				template_var_value = scope_vars[var_name];
			} else if(!!this[property_var_name]) {
				template_var_value = this[property_var_name];
			} else if(name!== var_name && !!this.hasAttribute(var_name)) {
				template_var_value = this.getAttribute(var_name);
			} else if(!!parent_source) {
				template_var_value = parent_source.getAttribute(var_name);
				if(template_var_value == '~attached' || 
					parent_source.matches('[exports~="'+var_name+'"]') ) {
						template_var_value = parent_source[property_var_name];
				}
			}
			if(this.hasAttribute('debug')) {
				console.log(this, template_var_value, var_name);
			}
			/* then if it's still undefined attempt default and javascript globals, before defaulting to the empty string */
			if( (template_var_value == undefined || template_var_value == null) ) {
				if( !/-default$/.test(var_name) && 
						!!this && 
						!!this.hasAttribute &&
						this.hasAttribute(var_name + "-default")) {
					var default_var_name = var_name + "-default";
					template_var_value = this.getAttribute(default_var_name); 
				} else if ( self[property_var_name] || (!!self.top && self.top[property_var_name]) ) {
					template_var_value = self[property_var_name] || self.top[property_var_name];
				} else {
					template_var_value = "";
				}
			}
			//console.log("Resolve attempt ", attr, name, var_name, template_var_value, var_parts, this);
			var template_prev_value;
			for(var part of var_parts) {
				//console.log(reg,template_var_value);
				var prop_name = part.split("()")[0];
				template_prev_value = template_var_value;
				template_var_value = template_var_value[prop_name];
				if(/.+\(\)$/.test(part) && !!template_var_value) {
					//console.log("executing ", template_var_value );
					template_var_value = template_var_value.bind(template_prev_value)();
					//console.log("Printing ", template_var_value);
				}
			}
			/* try a final time if we still don't have anything */
			if( template_var_value == null || template_var_value == undefined) {
				if( !/-default$/.test(var_name) && 
						!!this && 
						!!this.hasAttribute &&
						this.hasAttribute(var_name + "-default")) {
					var default_var_name = var_name + "-default";
					template_var_value = this.getAttribute(default_var_name); 
				} else if ( self[property_var_name] || (!!self.top && self.top[property_var_name]) ) {
					template_var_value = self[property_var_name] || self.top[property_var_name];
				} else {
					template_var_value = "";
				}
			}
			/* we will not cast all values to strings */
			if(rn.type.item(template_var_value,true) == "String" ||
				rn.type.item(template_var_value,true) == "Number" ) {
					attr.text = attr.text.replace(reg,template_var_value);
					//console.log("Achieved value ", reg, attr.text, this);
			} else {
				attr.text = template_var_value;	
			}
		}
		function print_attribute_template( elem, scope_vars, attr ) {
			var template_vars = get_template_vars( attr.text );
			template_vars.forEach( resolve_template_var.bind(elem, scope_vars, attr ));
			//console.log("Print attribute result ", elem, attr);
			return attr;
		}
		function templated( elem, scope_vars, name, value ) {
			var attr = { name:name, template:value, text: value };
			print_attribute_template( elem, scope_vars, attr );
			//console.log("Print attr result ", elem, attr);
			return attr.text;
		}

	/* api */
		this.attr = custom_get_attribute;
		this.vars = get_template_vars;
		this.d = templated;
		this.print_attr = print_attribute_template;				
});
