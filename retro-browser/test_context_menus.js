chrome.contextMenus.create(
	{
		type: "normal",
		id:"cris-test",
		title:"Locate",
		contexts:["all"]	
	},
	function created() {
		console.log("Menu created");
	}
);
