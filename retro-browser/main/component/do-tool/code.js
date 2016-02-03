(function () {
	function setup_do_tool(root) {
		var icon_prefix = "fa-";
		var icon_name = this.getAttribute('icon');
		var icon_container = root.querySelector('#tool-icon');
		var icon = icon_container.querySelector('.icon');
		if(this.hasAttribute('spin')) {
			icon.classList.add(icon_prefix + 'spin');
		}
		icon_container.style.background = this.getAttribute('bg') || "";
		icon.style.color = this.getAttribute('color') || "";
		icon.classList.add(icon_prefix + icon_name);
	}

	rn.create_task('component','do-tool','setup',setup_do_tool);
}());
