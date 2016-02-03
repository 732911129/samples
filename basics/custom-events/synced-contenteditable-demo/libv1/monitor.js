var projections = {
	'Event': ['type'],
	'KeyboardEvent': ['keyCode'],
	'MouseEvent': ['clientX','clientY'],
	'TextEvent': ['data']
};
var small_events = [
	'cut',
	'copy',
	'paste',
	'input',
	'change',
	'textInput'
];
var events = [
	'focus',
	'blur',
	'cut',
	'copy',
	'paste',
	'mousemove',
	'mouseenter',
	'mouseleave',
	'mousedown',
	'mouseup',
	'input',
	'change',
	'textInput',
	'keydown',
	'keyup',
	'keypress',
	'click'
];
function monitor(el,aevent) {
	"use strict";
	var cevents;
	if(!!aevent) {
		if(typeof aevent == "string") 
			cevents = [aevent];
		else if(aevent instanceof Array)
			cevents = aevent;
	} else {
		cevents = events;
	}
	for(let event of cevents) {
		el.addEventListener(event,report);
	}
}

function get_props(e) {
	var all_props = [];
	while(e.__proto__ !== null) {
		if(!!e.__proto__.constructor) {
			var project = projections[e.__proto__.constructor.name];
			if(!!project) {
				all_props = all_props.concat(project);
			}
		}
		e = e.__proto__;
	}
	// remove duplicates
	return all_props.sort().filter(function (n,i) { if(i == 0 || n !== all_props[i-1]) { return true; }});
}

function report(e) {
	var projected_props = get_props(e);	
	var report_obj = {};
	for(var prop of projected_props) {
		report_obj[prop] = e[prop];
	}
	var report_text = JSON.stringify(report_obj,cleaner,2);
	console.log(report_text);
	//return report_text;
}

function cleaner(key,o) {
	try{
		JSON.stringify(o);
	}
	catch(e) {
		return undefined;
	}
	return o;
}

