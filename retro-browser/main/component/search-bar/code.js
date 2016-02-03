(function () {
	function setup_search_bar(root) {
		var input_addon = root.querySelector('input-addon');
		var label_attr = this.getAttribute('label') || "";
		input_addon.setAttribute('label',label_attr);
		var ph_attr = this.getAttribute('placeholder') || "";
		input_addon.setAttribute('placeholder',ph_attr);
	}

	rn.create_task('component','search-bar','setup',setup_search_bar);
}());
