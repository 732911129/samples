/* from http://stackoverflow.com/a/16844961 by Metricton */
function get_icons() {
    var icon_nodes = document.querySelectorAll('link[rel~="icon"][href^="/"], link[rel~="icon"][href^="htt"], link[rel~="icon"][href$=".ico"]');
		var icons = Array.prototype.slice.call(icon_nodes).map( function (n) { return n.href; } ).filter( function (h) { if (!!h) { return true; } } );

		//if(icons.length == 0) {
		if(true) {
			//icons.push(document.location.protocol + "//" + document.location.host + "/favicon.ico");
			icons = [document.location.protocol + "//" + document.location.host + "/favicon.ico"];
		}

    return icons;
}

function save_icon_as_data_uri(save_function, icon_src, index) {
	try {
		var z = new Image();
		var c = document.createElement('canvas');
		var data_url = "";
		z.addEventListener('load', function () {
			try { 
				c.width = z.width;
				c.height = z.height;
				c.getContext('2d').drawImage(z, 0, 0, c.width, c.height);
				data_url = c.toDataURL();
			} catch(e) {
				/*console.log(e, e.stack);*/
			} finally {
				save_function(data_url || "");
			}
		});
		z.addEventListener('error', function () {
			save_function("");
		});
		z.src = icon_src;
	} catch(e) {
		save_function("");
	} 
}

function get_saver (save_array, callback, total) {
	return function (to_save) {
		save_array.push(to_save || "");
		if(save_array.length >= total) {
			callback(save_array);
		}
	};	
}

function icons_acquired(saved_icons) {
	if(!!saved_icons && saved_icons.length > 0) {
		console.log(saved_icons[0]);
	} else {
		console.log("");
	}
}

function get_data_uris() {
	var icon_source = get_icons();
	var data_uris = [];
	icon_source.map( save_icon_as_data_uri.
		bind(null, get_saver( data_uris, icons_acquired, icon_source.length ) )
	);
}

get_data_uris();
