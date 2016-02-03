"use strict";
self.Ranges = class Ranges {
	save() {
		try {
			return self.getSelection().getRangeAt(0).cloneRange();
		} catch(e) {
			return null;
		}
	}
	load(r) {
		if(!!r) {
			var selection = self.getSelection();
			selection.removeAllRanges();
			selection.addRange(r);
			this.view(r);
		}
	}
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
	measure(r) {
		if(!!r) {
			var selection = self.getSelection();
			selection.removeAllRanges();
			selection.addRange(r);
			return selection.toString().length;
		} else {
			return 0;
		}
	}
	measure_elem(el) {
		if(!!el) {
			var z = this.save();
			var r = document.createRange(r);	
			r.selectNodeContents(el);
			var x =  this.measure(r); 
			this.load(z);
			return x;
		}
	}
};

