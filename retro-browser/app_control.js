
/* support functions */
	function assign_global(global_name, value) {
		console.log(global_name, value);
		self[global_name] = value;
	}

/* launch functions and definitions */
	var app_window;
	var launch_window_options = {
		id:"main window",
		innerBounds : {
			left:0,
			top:0,
			width:1202,
			minWidth:320,
			height:751,
			minHeight:240
		},
		frame : {
			type: "none"
		},
		state: "normal"
	};

	function go_window() {
		chrome.app.window.create("main/layout.html",launch_window_options, assign_global.bind(self,"app_window"));
	}

	function go_launch() {
		go_window();
	}

/* launch interrupt */
chrome.app.runtime.onLaunched.addListener( go_launch );

/* incoming message functions and definitions */
	function execute_call_chain( call_chain ) {
		/* define some return values to control if */
		/* we continue or not, the value of which depends on */
		/* the iteration function we are using */
		var keep_going = false, stop = true;
		/* start at the global object */
		var current_object = self;
		function follow_chain_link( full_property, chain_index, chain ) {
			console.log("Arriving at chain link ", full_property);
			var property = full_property.split(/\(.*\)/)[0];
			var next_object = current_object[property];
			if(!!next_object) {
				/* if we had a pair of parentheses somewhere */
				if(property !== full_property) {
					/* assume it's a function and execute */
					console.log("Executing at ", full_property );
					/* as well as updating current object to the  */
					/* result of that execution */
					/* in true call chain style */
					/* and make sure we bind it to the correct thing ! */
					next_object = next_object.bind(current_object);
					current_object = next_object();
				} else {
					/* other wise just update current object */
					current_object = next_object;
				}
				/* if everything was cool then return ok */
				return keep_going;	
			}	else {
				console.log("Chain broken at ", full_property, " Stopping" );
				return stop; /* chain has broken, so we stop */
			}
		}
		call_chain.some( follow_chain_link );
	}

	function receiver( msg, sender, reply ) {
		switch ( msg ) {
			case "close":
				console.log(msg, sender, reply);
				app_window.close();
				break;
			case "minimize":
				console.log(msg, sender, reply);
				app_window.minimize();
				break;
			case "maximize":
				console.log(msg, sender, reply);
				app_window.maximize();
				break;
			default:
				console.log("unknown", msg, sender, reply);
				break;
		}
	}

/* incomming message interrupt */
chrome.runtime.onMessage.addListener( receiver );




