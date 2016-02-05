-- Sometimes on playback, the streams are not synchronized.
	[IDEAS: something to do with document.execCommand sometimes occurring after range.load I believe.]
	[NOTES: This one is very annoying and very important. The sanctity of the box state it really works to preserve. This bug damages the very core of that sanctity.]
-- The cursor lags one behind the actual cursor.
	[IDEAS: keydown versus keyup]
	[IDEAS: the lag is proportional NOT to the number of characters but TO THE NUMBER OF new lines. That is the number of element nodes inside the editing host. This indicates to me that the bottleneck we are experiencing is the due to the algorithm for finding the start and end points in the selection. Perhaps we can improve this algorithm somehow. I believe it can be improved significantly.]
	[IDEAS: Some optimizations based on the case where we are at the end of the input have been occasioned. Another will optimize the whole search algorithm to use a binary-search-like heuristic. I predict that will offer significant and consistent performance wins. :);p;) xx FUCK YES.]

