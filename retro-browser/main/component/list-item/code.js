(function () {
	function setup_list_item(root) {
		var icon_prefix = "fa-";
		var icon_name = this.getAttribute('icon');
		var color = this.getAttribute('color');
		var icon_container = root.querySelector('#item-icon .icon');
		icon_container.classList.add(icon_prefix + icon_name);
		icon_container.style.color = color;
	}

	rn.create_task('component','list-item','setup',setup_list_item);
}());
