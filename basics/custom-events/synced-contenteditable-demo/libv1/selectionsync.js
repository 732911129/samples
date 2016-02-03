document.addEventListener('selectionchange',function(e) {
});
input.addEventListener('keyup',function (e) {
	// update caret in input
		zc1();
	// save range
		cs = transmit.save_range();
	// update selection in output
		var crds = transmit.get_range_coords(input);
		transmit.set_selection(output,crds.start,crds.end);
		output.focus();
		zc2();
	// return to input
		input.focus();
	// revive the range
		transmit.revive_range(cs);
});
