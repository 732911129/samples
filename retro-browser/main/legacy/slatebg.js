function do_save(msg,resp) {
		main_page = msg.data;
		var saveable = {};
		saveable[main_page.name] = main_page.value;
		chrome.storage.local.set(saveable,function(a) {
			console.log("Object saved")
			if(!!resp) {
				resp({saved:true});
			}
		});		
}

function do_get(msg,resp) {
	type = msg.type;
	chrome.storage.local.get(type,function(a) {
			console.log("Object retrieved");
			if(!!resp) {
				resp({got:true,data:a});
			}
		});
}

chrome.runtime.onMessage.addListener(function(msg,sender,resp) {
	switch(msg.action) {
		case "sl_save":
			do_save(msg,resp);	
			break;
		case "sl_get":
			do_get(msg,resp);
			break;
	}
	return true;	
});
