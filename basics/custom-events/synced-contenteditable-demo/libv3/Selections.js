"use strict";
// utility functions for selections
self.Selections = class Selections {
	measure_selection(from) {
		var measure = {start:null,end:null};
		var r = ranges.save();
		var rc = r.cloneRange();
		rc.setStart(from,0);
		measure.end = ranges.measure(rc);
		rc.setEnd(r.startContainer,r.startOffset);
		measure.start = ranges.measure(rc);
		ranges.load(r);
		return measure;
	}

	set_selection(from,measure) {
		var a = document.createRange();
		// this is buggy for EditActor
		// tho it does produce optimization
		if( measure.start == measure.end && measure.end == ranges.measure_elem(from)) {
			if(measure.end == 0) {
				a.setStart(from,0); 
				a.setEnd(from,0);
			} else {
				var container = from.lastChild, offset = 0;
				if(container.nodeType == Node.TEXT_NODE) {
					offset = container.nodeValue.length;
				} else if (!!container.lastChild) {
					// this is also bug prone
					// as it only checks 3 levels down in the DOM
					// it produces significant optimiztion
					// the caveat is that as it has a fixed DOM level
					// it really only works on plaintext and won't operate
					// consistently correctly if there is additional HTML 
					// in the edit host
					// and its limitation is that if you are even 1 character back from the end, 
					// then the optimization will not apply and you will be using the laggy 
					// existing algorithm
					// this is insignificant as we are
					// optimizing that to a binary search type heuristic tomorrow.
					// boom.
					// fuck yeah.  :p:)xxx
					container = container.lastChild;
					if(container.nodeType == Node.TEXT_NODE) {
						offset = container.nodeValue.length;
					}
				}
				a.setStart(container,offset);
				a.setEnd(container,offset);
			}
		} else if(measure.start == measure.end && measure.end == 0) {
			a.setStart(from,0); 
			a.setEnd(from,0);
		} else {
			var total = 0, x = document.createRange();
			x.setStart(from,0);
			from.normalize();
			var z = document.createTreeWalker(from);
			while(z.nextNode()) {
				let current = z.currentNode;
				x.setEnd(current,current.length);
				total = ranges.measure(x);
				if(total >= measure.start) {
					if(a.startContainer == document) {
						if(current.nodeType == Node.ELEMENT_NODE) {
							a.setStart(current,0);
						}	else {		
							a.setStart(current,current.length-(total-measure.start));
						}
					}
				}
				if(total >= measure.end) {
					if(current.nodeType == Node.ELEMENT_NODE) {
						a.setEnd(current,0);
					} else {
						a.setEnd(current,current.length-(total-measure.end));
					}
					break;
				}
			}		
		}
		ranges.load(a);
	}
};
