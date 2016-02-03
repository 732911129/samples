(function () {
	function attr_changed_tab_head( attr_name, old_val, new_val ) {
		if(attr_name == "tab-title") {
			var z = this.querySelector('.title');
			if(!z) {
				z = document.createElement('span');
				z.classList.add('title');
				this.appendChild(z);
			}
			//console.log("Setting title for", z);
			z.innerText = this.getAttribute('tab-title');
		} else if(attr_name == "tab-favicon") {
			var i = this.querySelector('img');
			if(!i) {
				i = new Image();
				this.appendChild(i);
			}	
			i.src = this.getAttribute('tab-favicon');;
		}
	}

	rn.create_task('component','tab-head','attr_changed', attr_changed_tab_head);
}());
