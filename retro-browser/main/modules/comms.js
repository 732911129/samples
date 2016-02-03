rn.comms = new (function () {
	/* functions */
		function send(msg) {
			chrome.runtime.sendMessage(msg);
		}

	/* api */
		this.send = send;
});
