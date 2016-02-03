(function() {
	function register_op_then(root) {
		//console.log("op_then", arguments);
		this.execute = function() {		
			var condition = this.getAttribute('condition');
			var op_then = this.querySelector('op-then');
			var op_else = this.querySelector('op-else');
			//console.log("IF : ", condition, op_then, op_else );
		}		
		this.hand_off = function hand_off()	{
			if(!!this.firstElementChild) {
				//console.log("Passing instruction pointer to ", this.firstElementChild);
				this.firstElementChild.setAttribute("ip","");
			} else {
				//console.log("Then element", this, " has no children.")	
				this.call_complete();
			}
			this.removeAttribute("ip");
		}
	}

	rn.create_task('op','then','register',register_op_then);
	rn.create_task('op','then','setup',rn.noop);
}());
