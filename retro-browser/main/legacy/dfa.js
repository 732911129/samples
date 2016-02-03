//TODO: actually make this a set of DFAs which are more expressive
// more comprehensible and more maintainable than the current system
// based on set intersection alone, without the DFA abstraction
StanTech.TheSystem.DFA = {
	name: window.StanTech.TheSystem.name + 'DFA: ',
	signaturize : function (codes_class) {
		var languages = Object.keys(codes_class).sort();
		var signature = languages.join('/');
		//window.StanTech.TheSystem.DFA.say('Signature for ', codes_class, ' is ', signature ); 
		return signature;
	},
	phase_0_structuring : function () {
		// variable definitions
			var source_rough_paragraphs = window.StanTech.TheSystem.paragraphs();

		// main loop
		window.StanTech.TheSystem.document = {
			parse : {
				val : source_rough_paragraphs
			},
			emissions : { 
				paragraph : source_rough_paragraphs
			}
		};
	},
	init: function () {
		window.StanTech.TheSystem.DFA.say = window.StanTech._say(window.StanTech.TheSystem.DFA.name);
		//window.StanTech.TheSystem.DFA.say(JSON.stringify(window.StanTech.TheSystem.collect_frequencies()));
		window.StanTech.TheSystem.DFA.say('setup');
	}
};
StanTech.TheSystem.DFA.init();
