(function op_service() {
	console.warn = function () {};
	//console.log("Self is worker ", self, " and we are launching the op service");
	function notify ( info ) {
		self.postMessage(info);
	}
	function router ( msg ) {
		console.log("Router received msg", msg);
		setTimeout( notify.bind(null, "Acknowledged", msg), 1000); 
	}
	self.addEventListener('message', router);
}());
