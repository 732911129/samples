//TODO: set this up to handle nested iframes
// Using post message to the parent window. 
// The extension can then provide the code 
// Which should be dynamically loaded into a script
// In the nested iframe's body
StanTech.Loader = {
	name : window.StanTech.name + 'Loader: ',
	load_into_dynamic_iframes : function( load_code ) {
		var framelist = document.getElementsByTagName('iframe');
		var dynamic_frames = [];
		for(var i = 0; i < framelist.length;i+=1) {
			var frame = framelist[i];
			if(!frame.src || frame.src == "") {
				//console.log("##ST Dynamic iframe:",frame);
				dynamic_frames.push(frame);
			}
		}
		dynamic_frames.forEach( function(frame) {
				var fdocument = frame.contentDocument;
				var body = frame.contentDocument.body;
				var script = fdocument.createElement('SCRIPT');
				script.innerHTML = load_code || "console.log('from in a diframe');";
				body.appendChild(script);	
				console.log('##ST Dynamic iframe body', body);
			} );
	},
	code_to_load : 'console.log("dynamic code####");',
	init : function () {
		window.StanTech.Loader.say = StanTech._say(StanTech.Loader.name);	
		window.StanTech.Loader.say('Loading StanTech into dynamic iframes...');
		window.StanTech.Loader.load_into_dynamic_iframes(window.StanTech.Loader.code_to_load);
		window.StanTech.Loader.say('setup');
	} 
}
StanTech.Loader.init();
