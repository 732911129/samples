rn.webview = new (function webview() {
	/* functions */
		function webview_back() {
			var active_webview = document.querySelector('tab-body[active]::shadow webview');
			if(!!active_webview) {
				active_webview.back();
			} else {
				console.log("No active webview");
			}
		}

		function webview_forward() {
			var active_webview = document.querySelector('tab-body[active]::shadow webview');
			if(!!active_webview) {
				active_webview.forward();
			} else {
				console.log("No active webview");
			}
		}

		function webview_reload() {
			var active_webview = document.querySelector('tab-body[active]::shadow webview');
			if(!!active_webview) {
				active_webview.reload();
			} else {
				console.log("No active webview");
			}
		}

		function webview_go(history_index, callback) {
			var active_webview = document.querySelector('tab-body[active]::shadow webview');
			if(!!active_webview) {
				active_webview.go(history_index, callback);
			} else {
				console.log("No active webview");
			}
		}

	/* api */
		this.back = webview_back;
		this.forward = webview_forward;
		this.go = webview_go;
		this.reload = webview_reload;	
});
