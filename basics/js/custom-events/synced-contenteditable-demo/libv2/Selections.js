"use strict";
// utility functions for selections
self.Selections = class Selections {
	// selections:
		// measure, and create from, a selection's start and end points
			// measure the current selection's start and end points from a node
					// details: 
						//returns an object with properties start and end
						// which measure the start and end points of the current selection
						// relative to some DOM node
				measure_selection(from) {
					// create the measure
						var measure = {start:null,end:null};
					// before anything, save the current range
						var r = ranges.save();
					// then create a range  
						var rc = r.cloneRange();
					// that measures to the end of the range
					// from the start
						rc.setStart(from,0);
					// and measure that length
						measure.end = ranges.measure(rc);
					// then change the range so it measures
					// to the start of the current range
						rc.setEnd(r.startContainer,r.startOffset);
					// and again measure the range
						measure.start = ranges.measure(rc);
					// before returning load the saved range
						ranges.load(r);
					return measure;
				}

			// find and display the range specified by measure
					// details:
						// find and display the range (node and offset points)
						// that spans the start-th through the end-th character
						// starting at from
						// how we find it:
							// find it by stepping through the DOM from from
							// and measuring the character length back to the start of from
							// until we pass each of the points specified by start and end
							// and when we pass a point, we save it in the range
							// special case:
								// a special case is when the start and end are both 0
								// in that case, there's no need to search, we can just the 
								// the start and end to from, and both offsets to 0
				set_selection(from,measure) {
					var x = document.createRange(), a = document.createRange();
					// find the answer 'a' range
						// details:
							// that specifies the node and offset of 
							// each start and end point 
							// as measured by finding those points
							// by checking the DOM
						if(measure.start == 0 && measure.end == 0) {
							// if it's both 0 then no need to search for it
								a.setStart(from,0); 
								a.setEnd(from,0);
						} else {
							// otherwise we need to measure
								// details:
									// otherwise we need to measure on which nodes and which offset
									// the start and end coordinates lie
							// and we start measuring from the beginning of from
								var total = 0;
								x.setStart(from,0);
							// then before walking the DOM, first optimize
									// details:
										// save ourselves a bit of time by normalizing the nodes
										// which reduces their number
								from.normalize();
							// and walk the DOM starting at from
								var z = document.createTreeWalker(from);
								// while there's still more nodes
									while(z.nextNode()) {
										let current = z.currentNode;
										// get the total length so far to the end of this node
											x.setEnd(current,current.length);
											total = ranges.measure(x);
										// see if we've already passed the start
											if(total >= measure.start) {
												// and if the start is unset (it always defaults to document)
													if(a.startContainer == document) {
														// element nodes always set offset to 0
															if(current.nodeType == Node.ELEMENT_NODE) {
																a.setStart(current,0);
															}	else {		
																a.setStart(current,current.length-(total-measure.start));
															}
													}
											}
										// see if we've already passed the end
											if(total >= measure.end) {
												// element nodes always set the offset to 0
													if(current.nodeType == Node.ELEMENT_NODE) {
														a.setEnd(current,0);
													} else {
														a.setEnd(current,current.length-(total-measure.end));
													}
												// leave the loop
													// details:
														// now we've got start & end 
														// because start is guaranteed by range and selection to be less than end
														// so we can finish this loop
												break;
											}
									}		
						}
					// display it
						ranges.load(a);
				}
};
