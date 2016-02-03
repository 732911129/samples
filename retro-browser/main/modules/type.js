rn.type = new (function type() {
	/* functions */
		/* set up the types we recognize */
			var recognized_types = [Element, HTMLCollection, NodeList, String, Boolean, Number, RegExp, Array, Map, Set, Function, Object]; 
			var recognized_prototypes = recognized_types.map( function (t) { return t.prototype; } );		

		function type_item(item, no_subtypes) { /* type a single item */
			if(!!item) {
				var match = recognized_prototypes.indexOf(item.__proto__), loops = 7;
				while(match < 0 && !!item.__proto__ && loops > 0) {
					item = item.__proto__;
					match = recognized_prototypes.indexOf(item.__proto__);
					loops--;
				}	
				if(match >= 0) {
					return recognized_types[match].name;
				}
			}
			return "unknown";
		}

		function type(something) { /* expand a collection or list of items to type */
			var t = type_item(something);
			if(t == "Array" || t == "NodeList" || t == "HTMLCollection")	{
				return rn.conversion.arrify(something).map( type_item ).join(',');	
			} else if (t == "Map" || t == "Set") {
				return rn.conversion.list(something).map( type_item ).join(',');
			} else {
				return type_item(something);
			}
		}

		function type_recurse(something) { /* recursively expand lists and collections */
			var t = type_item(something);
			if(t == "Array" || t == "NodeList" || t == "HTMLCollection")	{
				return rn.conversion.arrify(something).map( type_recurse ).join(',');	
			} else if (t == "Map" || t == "Set") {
				return rn.conversion.list(something).map( type_recurse ).join(',');
			} else {
				return type_item(something);
			}
		}

	/* api */
		this.item = type_item;
		this.d = type;
});
