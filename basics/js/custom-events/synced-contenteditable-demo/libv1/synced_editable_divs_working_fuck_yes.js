/*
monitor(input);
monitor(document,'selectionchange');
monitor(output);
monitor(receiver);
monitor(emitter);
*/

function get_range() {
	var x = window.getSelection().getRangeAt(0).cloneRange();
	return x;
}
input.addEventListener('textInput',function (e) {
	// save the range
		var r = get_range();
		var cs = document.createElement('span');
		r.insertNode(cs);
	// transmit the caret
	var l = get_range_length();
	// send the input
	//set_caret_input(output,l);
	set_caret(output,l);
	simulate.key.send('#output',e.data);
	// refocus the input
	input.focus();
	// revive the range
		var selection = window.getSelection();
		selection.removeAllRanges();
		r.selectNode(cs);		
		selection.addRange(r);
		cs.parentNode.removeChild(cs);
});
// now it works to update the output's cursor as ours changes
function get_range_length() {
	var r = get_range(); 
	var rc = r.cloneRange(true);
	rc.selectNodeContents(input);
	rc.setStart(input,0);
	rc.setEnd(r.endContainer,r.endOffset);
	var s = document.getSelection();
	s.removeAllRanges();
	s.addRange(rc);
	return s.toString().length;
}
function set_caret(el,from_start) {
	var s = window.getSelection(), x = document.createRange();
	el.normalize();
	x.setStart(el,0);
	z = document.createTreeWalker(el);
	var total = 0,lastNode = el;
	while(z.nextNode()) {
		x.setEnd(z.currentNode,z.currentNode.length);
		s.removeAllRanges();
		s.addRange(x);
		total = s.toString().length;
		if(total >= from_start) {
			x.setEnd(z.currentNode,z.currentNode.length-(total-from_start));
			break;	
		}
	}		
	x.collapse();
	s.removeAllRanges();
	s.addRange(x);	
}
function set_caret_input(el,from_start) {
	el.setSelectionRange(from_start,from_start);
}

