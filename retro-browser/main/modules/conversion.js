rn.conversion = new (function conversion() {
	/* functions */
		function prop_name_from_string( str ) {
			//console.log("Prop name from string ", str );
			var result = str.replace(/-/g,"_");
			//console.log("Prop name result ", result);
			return result;
		}
		var arrify = list;
		function list(attrs) {
			return Array.prototype.slice.call(attrs);
		}
		function list_(iter) {
			var out = [];
			for(var i of iter) {
				out.push(i);	
			}
			return out;
		}
		function attr_map(attrs, exclude, no_template) {
			exclude = exclude || [];
			var elem_this = this;
			return new Map(list(attrs).
				filter( 
					function (e) { 
						if (exclude.indexOf(e.name) !== -1) {
							return false;
						}	
						return true;
					}
				).
				map ( 
					function (e) {
						if(!!no_template && !!no_template.has(e.name)) {
							return [e.name, attrs.getNamedItem(e.name).value];
						}
						return [e.name, elem_this.getAttribute(e.name)];
					}
				));
		}
		// camel case helper 
			function _upper_group_1(match, group1) {
				return group1.toUpperCase();
			}
		function camel_case(name) {
			return (String(name)||'').replace(/(?:^|-)(.)/g, _upper_group_1 );
		}
	/* api */
		this.prop_name = prop_name_from_string;
		this.arrify = arrify;
		this.list = list;
		this.list_ = list_
		this.attr_map = attr_map;
		this.cc = camel_case;
});
