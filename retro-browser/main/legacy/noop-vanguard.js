1;
var breach = 'pending';
(function () {
	function noop(){}
	noop();
}());
// certified nothing
function noop() {}
noop();
breach = 'complete';
