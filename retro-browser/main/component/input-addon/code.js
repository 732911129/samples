(function () {
	function setup_input_addon(root) {
		var icon_font_config = ["fa", "fa-fw"];
		/* helper functions */
			function apply_attrs(root) {
				/* apply icon */
				var icon_prefix = "fa-";
				var icon_name = this.getAttribute('icon');
				var icon_container = root.querySelector('#label-icon');
				var icon = icon_container.querySelector('#icon');
				if(!!icon_name) {
					icon.classList.add.apply(icon.classList,[icon_prefix + icon_name].concat(icon_font_config));
				}
				/* apply text */
				var text_value = this.getAttribute('label') || "";
				var text = root.querySelector('#label-text');
				if(!!text_value) {
					text.innerHTML = text_value;
				}
				/* apply type */
				var type = this.getAttribute('type');
				var input = root.querySelector('input');
				if(!!type) {
					input.type = type;
				}
				/* apply sizing */
				var size = this.getAttribute('size');
				var max_length = this.getAttribute('maxlength');
				if(!!size) {
					input.setAttribute('size',size);
				}
				if(!!max_length) {
					input.setAttribute('maxlength',max_length);
				}
				/* apply placeholder */
				var ph = this.getAttribute('placeholder');
				if(!!ph) {
					input.setAttribute('placeholder',ph);
				}
				/* apply button */
				var action_label = document.createTextNode(this.getAttribute('action-label') || "Do");
				var button = root.querySelector('button');
				button.appendChild(action_label);
					/* enable button to be activated when clicking on label */
					/* using the label-button attribute */
				if(this.hasAttribute('label-button')) {
					var label = root.querySelector('label');
					label.setAttribute('for',button.id);
				}
			}
		apply_attrs.bind(this, root)();
	}

	function attr_changed_input_addon( attr_name, old_val, new_val ) {
		//console.log("input addon changed ", this, arguments, Math.random());
		switch(attr_name) {
			case 'action-label':
				var button = this.shadowRoot.querySelector('button');
				button.innerHTML = new_val;	
				break;
			case 'label':
				var text = this.shadowRoot.querySelector('#label-text');
				text.innerHTML = new_val;
				break;
			case 'placeholder':
				var input = this.shadowRoot.querySelector('input');
				input.setAttribute('placeholder',new_val);
				break;
			default:
				break;
		}
	}

	rn.create_task('component','input-addon','setup',setup_input_addon);
	rn.create_task('component','input-addon','attr_changed',attr_changed_input_addon);
}());
