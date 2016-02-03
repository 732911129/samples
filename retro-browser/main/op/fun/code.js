(function () {
	function register_op_fun(root) {
		this.execute = function () {
			//console.log("Executing op fun", this );
			this.hand_off();
		};
		this.complete_called = function () {
			if(!!this.nextElementSibling) {
				this.nextElementSibling.setAttribute('ip','');
			} else {
				//console.log("No more siblings", this);
				this.call_complete();
			}
		};
		this.hand_off = function hand_off() {
			//console.log("handing off", this);
			if(!!this.firstElementChild) {
				this.firstElementChild.setAttribute("ip","");
			} else {
				//console.log("Interrupt element", this, " has no children.")	
				this.call_complete();
			}
			this.removeAttribute("ip");
		};
	}

	rn.create_task('op','fun', 'register', register_op_fun);
	rn.create_task('op','fun','setup', rn.noop);
}());
