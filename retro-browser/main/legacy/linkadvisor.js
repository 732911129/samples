var link_advisor = {};
function indicate_link(e) {
	var hover = document.elementFromPoint(e.clientX,e.clientY);
	if(hover !== link_advisor.previous_hover) {
		link_advisor.previous_hover = hover;
		if(!!hover && !!hover.tagName && hover.tagName.toLowerCase() === "a") {
			if(!!hover.href) {
				msg = hover.href;
			}
		} else {
			var seek = hover;
			msg = location.href;
			while(!!seek.parentNode || !!seek.host) {
				seek = seek.parentNode || seek.host;
				if(seek.tagName && seek.tagName.toLowerCase() === "a") {
					if(!!seek.href) {
						msg = seek.href;
					} 
					break;
				}
			}
		}
		if(msg !== link_advisor.previous_msg) {
			link_advisor.previous_msg = msg;
			console.log(msg);
		}
	}
}
window.addEventListener('mousemove', indicate_link);
