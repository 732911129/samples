(function () {
	function setup_progress_bar(root) {	
		// functions 
			this.inc = function inc() {
				this.setAttribute('value', parseFloat(this.getAttribute('value') || 0) + 1);
			};
			this.set_max = function set_max(max) {
				this.setAttribute('max',max || this.getAttribute('max') || 13);
			};
			this.reveal = function reveal() {
				document.querySelector('splash-page').style.display = "none";
				document.querySelector('main-app').style.visibility = "visible";
			};
			this.next_step = function next_step(index) {
				this.set_max(self.loaded_so_far.length);
				this.inc();
				var timeout = self.loaded_so_far[index];
				if(!timeout) {
					this.setAttribute('value',this.getAttribute('max'));
					setTimeout(this.reveal.bind(this), 37);
					return;
				}
				var new_index = index+1;
				var next_time = self.loaded_so_far[new_index] || timeout;
				var duration = next_time - timeout;
				//console.log("duration", duration);
				if(duration < 0) {
					duration = 0;
				}
				setTimeout(this.next_step.bind(this,new_index), duration);
			};
		// setup code
			this.setAttribute('value', this.getAttribute('value') || window.loaded_so_far || 0);
		//console.log("max at", this);		
		// start displaying progress
			this.next_step(0);
	}

	function attr_changed_progress_bar(attr_name, old_val, new_val) {
		var value = parseFloat(this.getAttribute('value'));
		var max = parseFloat(this.getAttribute('max'));
		var width = (value/max * 100)+"%";
		this.shadowRoot.querySelector('#value').style.width = width;
	}

	rn.create_task('component','progress-bar','setup',setup_progress_bar);
	rn.create_task('component','progress-bar','attr_changed',attr_changed_progress_bar);
}());



