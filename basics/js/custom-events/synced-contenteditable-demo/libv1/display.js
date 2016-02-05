function r(apple) {
	"use strict";
	function npr() {
		let x;
		try{
			x = window.getSelection().getRangeAt(0).cloneRange();
		}catch(e){
			return;
		}
		x.collapse();
		x = x.getClientRects()[0];
		if(!x) {
			let span = document.createElement('span');
			span.appendChild( document.createTextNode("\u200b") );
			x = window.getSelection().getRangeAt(0).cloneRange();
			try {
				x.insertNode(span);	
				x = span.getClientRects()[0];
			} catch(e) {
				console.log(x.startContainer);
				console.log(e);
				span.remove();
				return;
			}
			let p = span.parentNode;
			p.removeChild(span);
			p.normalize();	
		}
		if(!!x) {
			apple.style.left = x.left;
			apple.style.top = x.top;	
		}
	}
	return function () {
		npr();
	};
}
zc1 = r(c1);
zc2 = r(c2);

output.oninput = zc2; 
output.onkeyup = zc2;
