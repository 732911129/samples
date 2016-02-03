var worker_state = {};
function launch_op_call_service() {
	/* definitions */
		var path_to_op_call_service_code_file = "tech-test/op-service.js";

	/* create a web worker */
	////console.log("Launching op call service");
	var OpCall = new Worker(path_to_op_call_service_code_file);	
	worker_state.OpCall = OpCall;
	OpCall.addEventListener('message', console.log.bind(console,"OpCall says:"));
}
//launch_op_call_service();
