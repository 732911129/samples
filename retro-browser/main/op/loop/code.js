(function () {
	function register_op_loop(root) {
		this.execute = function () {
			//console.log("Execute loop", this);
			var forEach_parent = this.getAttribute('forEach-parent');
			var forEach = this.getAttribute('forEach');
			var collection = rn.selector.get_all(forEach_parent,forEach,this);
			var loop = this;
			function forEach_next(index) {
				var elem = collection[index];
				loop.setAttribute('index',index);
				loop.elem = elem;
				if(!!loop.firstElementChild) {
					loop.firstElementChild.setAttribute('ip','');
					//console.log("loop", index, loop, loop.elem, loop.firstElementChild.outerHTML+"" );
				}	
				index++;
				if(index < collection.length) {
					setTimeout( forEach_next.bind(null,index), 0 );
				} else {
					//console.log("Concluding loop");
					loop.set_result("index");
				}
			}
			forEach_next(0);
			/* actually it's very important the next loop is only begun once everyone has handed off for this loop */
			/* so at the end of the loop, inserted after all instructions needs to be the "next loop" hand off. We choose to avoid that for now */
		};
	}

	rn.create_task('op','loop','register',register_op_loop);
	rn.create_task('op','loop','setup', rn.noop);
}());
