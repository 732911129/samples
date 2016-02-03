function extract(prop,object) {
	return object[prop];
}
Function.prototype.then = function(next_fun) {
	var z = this;
	return function(inp) {
		next_fun(z(inp));
	};
}
var webviews = document.querySelectorAll('::shadow webview');

var indicate = console.log.bind(console,"INDICATING>>");

/* create code to execute in embedded to escalate events */
	/* variables used in the injected code */
		var scroll_prop_list = {
			window: ['scrollX','scrollY','innerWidth','innerHeight'],
			event: ['detail'],
			body : ['scrollWidth','scrollHeight']
		};
		var mousemove_prop_list = {
			window: ['scrollX','scrollY','innerWidth','innerHeight'],
			event: ['detail'],
			body : ['scrollWidth','scrollHeight']
		};
	/* functions used in the injected code */
		function project(prop_list,destination) {
			return function(event) {
				var data = {window:{},body:{},event:{}};
				/* copy the requested properties to the data package */
					prop_list.window.forEach(function(prop) {
						data.window[prop] = window[prop];
					});			
					prop_list.event.forEach(function(prop) {
						data.event[prop] = event[prop];
					});
					prop_list.body.forEach(function(prop) {
						data.body[prop] = document.body[prop];
					});
				/* send the data package */
					destination(JSON.stringify(data));
			};
		}
		function watch(target_name,event_name,props) {
			window[target_name].addEventListener(event_name,project(props,escalate));
		}
	/* a helper to create the code to call watch */
		function create_watch_call(target_name,event_name,prop_list) {
			return "watch(" + [target_name,event_name,prop_list].map(JSON.stringify).join(',') + ");";
		}
	/* the code */
		var code = [
				"var escalate = console.log.bind(console);",
				project.toString(),
				watch.toString(),
				create_watch_call('document','scroll',scroll_prop_list),
				create_watch_call('document','mousemove',mousemove_prop_list),
			].join(';');

function notify_end(scroll_info) {
	console.log(scroll_info.message);
	if(typeof scroll_info.message == "object") {
		var info = JSON.parse(scroll_info.message);
		if(info.window.scrollX >= info.body.scrollWidth-info.window.innerWidth-5) {
			console.log("End reached. Bounce.");
		}
	}
}

/* execute that code */
function inject (webview) {
	return function() {
		/* host listens for escalated events from the embedded */
		if(webview.alreadyBound === true) {
			return;
		}
		webview.alreadyBound = true;
		webview.addEventListener('consolemessage',extract.bind(null,'message').then(console.log.bind(console)));
		webview.addEventListener('consolemessage',notify_end);
		/* embedded executes script which can escalate events */
		webview.executeScript({code:code},indicate.bind(null,"EXECUTED"));
	};
}
for(var i =0;i < webviews.length; i++) {
	var webview = webviews[i];
	webview.addEventListener('loadstart',function () {webview.alreadyBound = false; });
	webview.addEventListener('loadstop',inject(webview));
}

