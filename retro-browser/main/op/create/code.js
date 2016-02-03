(function() {
	function register_op_create(root) {
		this.execute = function() {
			var attach_fun = 'appendChild';
			var element_name = this.getAttribute('_element');
			var element = document.createElement(element_name);
			// hack until we create a task for attach incoming to occur on 
			// the element's attached event
			if(this.hasAttribute('await-incoming')) {
				element.awaitIncoming = true;
			}
			var attach_parent = this.getAttribute('_attach-parent');
			var attach = this.getAttribute('_attach');
			var attach_target = rn.selector.get(attach_parent,attach,this);
			var text_content = this.getAttribute('_text-content');
			if(!attach_target && this.hasAttribute('_here')) {
				attach_target = this.parentNode;
			}
			var attach_shadow = this.hasAttribute('_attach-shadow');
			if(!!attach_shadow && !!attach_target.shadowRoot) {
				attach_target = attach_target.shadowRoot;
			}
			var no_template = this.getAttribute('_no-template');
			if(!!no_template) {
				no_template = new Map(this.getAttribute('_no-template').split(/\s+/).map(function (i) { return [i, i];}));
			}
			if(this.hasAttribute('debug')) {
				console.log("Attaching ", element, " to ", attach_target);
				console.log("Not templating ", no_template);
			}
			var attrs = rn.conversion.attr_map.bind(this)( this.attributes, ['_element','_attach-parent','_attach','_attach-shadow','_no-template','ip','result', 'immediate', '_here', '_text-content','_text-content-parent'], no_template);
			/* immediate for the created element is encoded as make-immediate  */
			if(attrs.has('_make-debug')) {
				attrs.set('debug');
				attrs.delete('_make-debug');
			}
			if(attrs.has('make-immediate')) {
				attrs.set('immediate','');
				attrs.delete('make-immediate');
			}
			for(var attr of attrs) {
				if(this.hasAttribute('debug')) {
					console.log(attr);
				}
				element.setAttribute(attr[0],attr[1]);
			}
			if(!!text_content) {
				element.innerText	= text_content;
			}
			if(!!attach_target) {
				attach_target.appendChild(element);	
			} else {
				console.log("No attachment target ", this, element );
			}		
		}	
	}

	rn.create_task('op','create','register',register_op_create);
	rn.create_task('op','create','setup',rn.noop);
}());
