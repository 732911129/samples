selections = new Selections();
ranges = new Ranges();
writing_box.focus();
self.pbw = new EditActor({
	page:printing_box,
	source:writing_box
});
self.pbw2 = new EditActor({
	page:printing_box2,
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
var c3 = new Cursor({
	for: printing_box2,
	color: "blue"
});
