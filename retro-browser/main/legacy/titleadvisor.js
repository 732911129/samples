function advise_title() {
	console.log(document.title || (!!window.location ? window.location.href : !!window.name ? window.name : ""));
}
advise_title();
