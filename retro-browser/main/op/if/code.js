(function() {
	function register_op_if() {
		////console.log("op_if", arguments);
		this.execute = function() {		
			/* setup */
				var condition = this.getAttribute('condition');
				/* we only want the direct children */
				var unique = "if"+parseInt(Math.random()*100000000);
				this.setAttribute('id', unique);
				var this_parent = this.parentNode;
				var op_then = this_parent.querySelector('#'+unique + ' > op-then');
				var op_else = this_parent.querySelector('#'+unique + ' > op-else');
				var result = false;
			/* determine result */
				if(this.matches('[property~="condition"]')) {
					if(this.hasAttribute('debug')) {
						console.log("IF property :", condition, this.getAttribute('condition-match'), this);
					}
					if(!!condition) {
						if(this.hasAttribute('condition-match')) {
							if(condition == this.getAttribute('condition-match')) {
								result = true;
							}
						} else {
							result = true;
						}
					}		
					if(this.hasAttribute('debug')) {
						console.log("If property result ", result, this);
					}
				} else {
					var condition_parent = this.getAttribute('condition-parent');
					var condition_selector = rn.selector.attr(condition);
					if(this.hasAttribute('debug')) {
						console.log("IF elements : ", condition, op_then, op_else, condition_selector );
					}
					/* evaluate the condition */
					/* currently just supports existence */
					var condition_element = rn.selector.get(condition_parent, condition_selector.element_selector, this);
					/* condition */
					if(!!condition_element && 
							!!condition_element.
							hasAttribute(condition_selector.attribute_requested)) {
						if(this.hasAttribute('condition-match')) {
							if(condition_element.
									getAttribute(condition_selector.attribute_requested) ===
									this.getAttribute('condition-match')) {
								result = true;
							}
						} else {
							result = true;
						}
					} 
					if(this.hasAttribute('debug')) {
						console.log("Condition element ", condition_element, " condition ", condition_selector, "result", result);
					}
				}
				this.setAttribute('result',result);
			/* branch */
				var real_this = this
				function real_hand_off() {
					var real_result = real_this.getAttribute('result');
					if(real_result === "true" && !!op_then) {
						if(real_this.hasAttribute('debug')) {
							console.log("Branching to then", real_this);
						}
						/* branch to then branch */
						op_then.setAttribute("ip","");
					} else if(real_result === "false" && !!op_else) {
						if(real_this.hasAttribute('debug')) {
							console.log("Branching to else", real_this);
						}
						/* branch to else branch */
						op_else.setAttribute("ip","");
					} else {
						if(real_this.hasAttribute('debug')) {
							console.log("No instruction paths, going to next sibling ", real_this, real_this.nextElementSibling);
						}
						real_this.next_sibling();
					}
					real_this.removeAttribute('ip');	
				}				
				real_hand_off();
			return result;
		}		
		this.hand_off = function dummy_hand_off() {
			/* do nothing for now */
			/* the real hand of is called within execute and the hand off */
			/* branches on the result obtained in execute */
		};
		this.next_sibling = function () {
			if(!!this.nextElementSibling) {
				this.nextElementSibling.setAttribute('ip','');
			} else {
				if(this.hasAttribute('debug')) {
					console.log("IF triggering call complete ", this );
				}
				this.call_complete();
			}
		};
		this.complete_called = function () {
			if(this.hasAttribute('debug')) {
				console.log("IF call complete triggered ", this );
			}
			this.next_sibling();
		};
	}

	rn.create_task('op','if','register',register_op_if);
	rn.create_task('op','if','setup',rn.noop);
}());
