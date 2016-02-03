(function() {
	function register_op_else(root) {
		//console.log("op_else", arguments);
		this.execute = function() {		
			var condition = this.getAttribute('condition');
			var op_then = this.querySelector('op-then');
			var op_else = this.querySelector('op-else');
			//console.log("IF : ", condition, op_then, op_else );
		}		
		this.hand_off = function hand_off()	{
			if(!!this.firstElementChild) {
				this.firstElementChild.setAttribute("ip","");
			} else {
				//console.log("Else element", this, " has no children.")	
				this.call_complete();
			}
			this.removeAttribute("ip");
		}
	}

	rn.create_task('op','else','register',register_op_else);
	rn.create_task('op','else','setup',rn.noop);
}());
