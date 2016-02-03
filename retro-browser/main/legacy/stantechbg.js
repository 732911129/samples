navigator.geolocation.getCurrentPosition(function (a) {console.log(a); }, function(b) { console.log("E",b); }, {timeout:3000});
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

function save_to_db(type,data,cb) {
	function save(store) {
		var type_store = store[type];
		if(type == 'db') {	
			store.db = data;
		} else {
			if(!type_store) {
				type_store = [];
				store[type] = type_store;	
			}
			type_store.push(data);
		}
		chrome.storage.local.set(store,cb);
	}
	chrome.storage.local.get(type,save);
}
function delete_all_from_db(type,cb) {
	chrome.storage.local.remove(type,cb);
}
function delete_from_db(type,data,cb) {
	function sdelete(store) {
		var type_store = store[type];
		if(!type_store) {
			cb();
		}
		var index = type_store.indexOf(data);
		while(index !== -1 ) {
			type_store.splice(index,1);
			index = type_store.indexOf(data);
		}
		chrome.storage.local.set(store,cb);
	}
	chrome.storage.local.get(type,sdelete);
}
function get_from_db(type,cb) {
	function send(store) {
		if(!!cb) {
			cb(store[type]);
		}
	}
	chrome.storage.local.get(type,send);
}
function load_module(where,module_name,cb) {
	function post_load() {
		console.log("Executed load of module : ", module_name, "into", where);
		if(!!cb) {
			console.log("Executing call back.");
			cb();
		}
	}
	chrome.tabs.executeScript(where,{file : module_name+'/load.js'},post_load);
}
function plex_request(request,sender,reply) {
	if(!!sender.tab) {
		function do_reply(from_db) {
			var msg = {ok:true,id:request.id,type:request.type,action:request.action};
			if(!!from_db) {
				msg.data = from_db;
			}
			reply(msg);
		}
		switch(request.action) {
			case 'get':
				get_from_db(request.type,do_reply);
				break;
			case 'save':
				save_to_db(request.type,request.data,do_reply);			
				break;
			case "sl_save":
				do_save(request,reply);
				break;
			case "sl_get":
				do_get(request,reply);
				break;
			case 'execute':
				chrome.tabs.executeScript(parseInt(sender.tab.id),{file:request.data},do_reply);
				break;
			case 'delete':
				delete_from_db(request.type,request.data,do_reply);	
				break;
			case 'format':
				delete_all_from_db(request.type,do_reply);
				break;
			case 'load':
				load_module(parseInt(sender.tab.id),request.data,do_reply);
				break;
			default:
				console.log("Doing nothing. Request not understood. ",JSON.stringify({request:request,sender:sender}));
				do_reply({error:"request not understood."});
		}
		return true;
	}
}
chrome.runtime.onMessage.addListener( plex_request );
