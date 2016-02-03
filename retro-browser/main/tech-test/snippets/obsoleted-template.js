/* template stuff */
	function get_text( doc ) {
		var child_array = Array.prototype.slice.call(doc.childNodes);
		return child_array.map(function (n) { return n.outerHTML || n.textContent; }).join('');
	}

	function get_template_vars ( template_text ) {
		var matches, vars = {};
		var regex = /{{([^{}]+)}}/g;
		while(matches = regex.exec(template_text)) {
			vars[matches[1]] = true;
		}	
		//console.log("Template vars ", vars );
		return Object.keys(vars);
	}

	function render_template( template_text, api_element ) {
		/* do nothing for now */
		return template_text;
		var template_vars = get_template_vars ( template_text );
		template_vars.forEach(function ( tvar ) {
			var var_val = api_element.getAttribute(tvar) || "";
			var reg = new RegExp("{{\\s*" + tvar + "\\s*}}","g");
			//console.log(var_val, reg);
			template_text = template_text.replace(reg, var_val);	
		});	
		return template_text;
	}

	/* render a piece of template from a template element  */
	/* into a shadow root using vars defined on the shadow root's host */
	function render_template( template, root ) {
		var template_text = get_text( template.content );
		var rendered_template = render_template( template_text, root.host );	

		/* create a document fragment to build the new rendered template */
		var df = document.createRange().createContextualFragment("<template>"+rendered_template+"</template>" );
		/* append the rendered template to the root */
		root.appendChild(document.importNode(df.querySelector('template').content,true));
	}
