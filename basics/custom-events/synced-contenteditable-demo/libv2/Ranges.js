"use strict";
// utility functions for ranges 
self.Ranges = class Ranges {
	// ranges:
		// helper functions to save, load, view and measure ranges
			// save the current range
				save() {
					try {
						return self.getSelection().getRangeAt(0).cloneRange();
					} catch(e) {
						return null;
					}
				}
			// load a range (make it the current selection)
				load(r) {
					if(!!r) {
						var selection = self.getSelection();
						selection.removeAllRanges();
						selection.addRange(r);
						this.view(r);
					}
				}
			// scroll a given range into view 
				view(r) {
					if(!!r) {
						var scrollmagnet = r.startContainer || r.endContainer;
						if(!!scrollmagnet) {
							if(scrollmagnet.nodeType !== Node.ELEMENT_NODE) {
								scrollmagnet = scrollmagnet.parentElement;
							}
							if(!!scrollmagnet && !!scrollmagnet.scrollIntoViewIfNeeded) {
								scrollmagnet.scrollIntoViewIfNeeded(true);
							}
						}
					}
				}
			// measure the length, in characters, of the text nodes spanned by a range
					// details:
						// we convert the range to a selection
						// because otherwise
						// the characters are not measured correctly 
						// for example: 
							// a <br> is removed from a range, 
							// but in a selection it renders correctly as a \n
				measure(r) {
					if(!!r) {
						// this.load(r);
						// inlined:
							var selection = self.getSelection();
							selection.removeAllRanges();
							selection.addRange(r);
						return selection.toString().length;
					} else {
						return 0;
					}
				}
};

