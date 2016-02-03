selections = new Selections();
ranges = new Ranges();
writing_box.focus();
self.pbw = new EditActor({
	page:printing_box,
	source:writing_box
});
self.wbs = new EditSensor(writing_box);
var c1 = new Cursor({
	for: writing_box,
	color: "hotpink"
});
var c2 = new Cursor({
	for: printing_box
});

