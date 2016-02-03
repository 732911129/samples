/*
monitor(input,['paste','cut','textInput','beforecut']);
monitor(input,small_events);
monitor(document,'selectionchange');
monitor(output,small_events);
monitor(receiver);
monitor(emitter);
*/
//transmit.transmit(input,output); 
var edit_script = transmit.new_sequence(input);
transmit.to_sequence(input,edit_script);

