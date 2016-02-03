rn.layout = new (function layout() {
	/* prototype modification */
		HTMLElement.prototype.getComputedStyle = function () {
			return getComputedStyle(this);
		};

	/* functions */

		function position(selector_parent, selector, pos) {
			var e = rn.selector.get(selector_parent, selector, this);
			//console.log(arguments,e);
			if(!pos) {
				//console.log("No pos");
				return;
			} else {
				try {
					pos = JSON.parse(pos);
				} catch ( except ) {
					//console.log("JSON parse exception on pos ", pos, except );
				}
			}
			if(!!e) {
				e.style.top = pos.top + "px";
				e.style.left = pos.left + "px";
			} else {
				//console.log("No element ", selector);
			}
		}

		function match_size(selector_parent, selector, match_parent, match_width, match_height, match_both) {
			var s = rn.selector.get(selector_parent, selector,this);
			var match_to, target_size;
			if( match_width || match_height || match_both ) {
				match_to = rn.selector.get( match_parent, match_width || match_height || match_both, this);
			}
			if(!!match_to) {
				target_size = match_to.getBoundingClientRect();
				//console.log("Target size ", target_size );
				if(!!match_width) {
					s.style.width = target_size.width + "px";
					//console.log("WIDTH ", target_size.width, s.style.width );
				} else if (!!match_height) {
					s.style.height = target_size.height + "px";
				} else if (!!match_both) {
					s.style.width = target_size.width + "px";
					s.style.height = target_size.height + "px";
				} else {
					//console.log("Match_size: no match to specified ", arguments );
				}
			}
			return; 	
		} 

		function get_float_position_relative_to(selector_parent, selector, anchor) {
			//console.log("Acquiring float position", selector);
			var e = rn.selector.get(selector_parent, selector, this);
			//console.log("Elem ", e);
			var box = e.getBoundingClientRect();
			/* optimization : we could wrap all these "op-call" functions in things that wrap
				them in ways to process their return values as JSON */
			switch(anchor) {
				case "left":
					return JSON.stringify({top:box.bottom,left:box.left});
				case "right":
					return JSON.stringify({top:box.bottom,left:box.right});
				default:
					return JSON.stringify({top:box.bottom,left:(box.left+box.right)/2});
			}		
		}

	/* api */
		this.match_size = match_size;
		this.get_float_position_relative_to = get_float_position_relative_to;
		this.position = position;
});
