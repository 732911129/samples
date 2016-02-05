var transmit = new (function transmit() {
	var API = this;

	// functions
		//transmit
			// I feel we should make sequence a class
			function new_sequence(source) {
				var state = source.value || source.innerText;
				var seq = [];
				API.push_intent(seq,{action:"open_sequence",start_state:state});
				return seq;
			}
			function close_sequence(seq,source) {
				var state = source.value || source.innerText;
				API.push_intent(seq,{action:"close_sequence",end_state:state,total_actions:seq.length+1});
				return seq;	
			}
			function to_sequence(input, seq) {
				input.addEventListener('textInput', function (e) {
					API.push_select(seq);
					// a little bit of redundancy reduction
					if(e.data !== "") {
						API.push_intent(seq,{action:'insert',text:e.data})
					}
				});
				input.addEventListener('keydown', function (e) {
					API.push_select(seq);
					if(e.keyCode == 8) {
						API.push_intent(seq,{action:'delete'});
					}
				});
				input.addEventListener('beforecut', function (e) {
					API.push_select(seq);
					API.push_intent(seq,{action:'delete'});
				});
				input.addEventListener('paste', function (e) {
					API.push_select(seq);
					var pasting = e.clipboardData.getData('text/plain');
					API.push_intent(seq,{action:'insert',text:pasting});
				});
			}
			function from_sequence(output, seq) {
				var index = 0, last_select;
				function deploy(action,next) {
					zc2();
					output.focus();
					switch(action.action) {
						case "select":
							last_select = action;
							API.set_selection(output,action.start,action.end);
							break;
						case "insert":
							if(!!last_select) {
								API.set_selection(output,last_select.start,last_select.end);
							}
							last_select = null;
							//document.execCommand('insertText', null,action.text);
							simulate.key.send(output,action.text);
							break;
						case "delete":
							if(!!last_select) {
								API.set_selection(output,last_select.start,last_select.end);
							}
							last_select = null;
							document.execCommand('delete');
							break;
						default:
							last_select = null;
							console.log("Action ", JSON.stringify(action, null, 4));
							break;
					}
					zc2();
					if(!!next) {
						next();
					}
				}
				function process_next() {
					if(index == 0) {
						console.log("Sequence begins");
					}
					if(index < seq.length) {
						var next = seq[index];	
						var deploy_in = next.since_last;
						if(deploy_in == 'first') {
							deploy_in = 0;
						}
						index += 1;
						console.log("Next action in ", deploy_in);
						setTimeout(deploy.bind(null,next,process_next),deploy_in);
					} else {
						console.log("Sequence ends.");
					}
				}
				process_next();
			}
			function transmit(input,ouput) {
				// transmit text inputs
				input.addEventListener('textInput',function (e) {
					// save the selection
						cs = API.save_range(); 
					// transmit the caret
						var crds = API.get_range_coords(input);
					// set caret
						API.set_selection(output,crds.start,crds.end);
					// send the input event
						simulate.key.send('#output',e.data);
					// refocus the input
						input.focus();
					// revive the range
						API.revive_range(cs);
				});
				// transmit deletes
				input.addEventListener('keydown',function (e) {
					if(e.keyCode == 8) {
						// save the selection
							cs = API.save_range(); 
						// transmit the selection
							var crds = API.get_range_coords(input);
							API.set_selection(output,crds.start,crds.end); 
						// do delete work
							API.issue_delete(crds,output);
						// refocus the input
							input.focus();
						// revive the range
							API.revive_range(cs);
					} else if(e.keyCode == 90 && e.metaKey) {
						// save selection 
							cs = API.save_range(); 
						// transmit the selection
							var crds = API.get_range_coords(input);
							API.set_selection(output,crds.start,crds.end); 
						// do delete work
							API.issue_undo();
						// refocus the input
							input.focus();
						// revive the range
							API.revive_range(cs);
					}
				});
				// transmit cut
				input.addEventListener('beforecut', function (e) {
					// save selection
						cs = API.save_range(); 
					// set selection
						var crds = API.get_range_coords(input);
						API.set_selection(output,crds.start,crds.end); 
					// delete it
						API.issue_delete(crds,output);
					// refocus the input
						input.focus();
					// revive the range
						API.revive_range(cs);
				});		
				// transmit paste
				input.addEventListener('paste', function (e) {
					// save selection
						cs = API.save_range(); 
					// save range coords
						var crds = API.get_range_coords(input);
					// save paste data 
						var pasting = e.clipboardData.getData('text/plain');
					// set selection and paste
						API.set_selection(output,crds.start,crds.end); 
						simulate.key.send('#output',pasting);
					// refocus the input
						input.focus();
					// revive the range
						API.revive_range(cs);
				});
			}
		// helpers
			function push_select(seq) {
				cs = API.save_range();
				crds = API.get_range_coords(input);
				// a little bit of redundancy reduction
					// note: this is probably as good as we can do
						// because anything that is not the same as 
						// next may change the state of the element so even if
						// next is the same as a previous one, they now longer produce the same
						// effect, so they are in essence, different and must both be recorded
				var last, last_time, last_text = JSON.stringify(seq[seq.length-1]);
				if(!!last_text) {
					last = JSON.parse(last_text);	
					last_time = last['timestamp'];
					delete last['timestamp'];
					delete last['since_last'];
					delete last['action_number'];
				}
				var next = {action:'select',start:crds.start,end:crds.end} 
				if(JSON.stringify(last) !== JSON.stringify(next)) {
					API.push_intent(seq,next);
				}
				API.revive_range(cs);	
			}
			function push_intent(seq,intent) {
				intent.timestamp = +(new Date());
				var last = seq[seq.length-1];
				if(!!last && !!last.timestamp) {
					intent.since_last = intent.timestamp - last.timestamp;
				} else {
					intent.since_last = 'first';
				}
				intent.action_number = seq.length;
				seq.push(intent);	
			}
			function find_previous_text_node(root,current) {
				var z = document.createTreeWalker(root,NodeFilter.SHOW_ALL);
				//console.log(z,z.currentNode,current);
				// go forward to find current
				while(z.nextNode()) {
					//console.log("Going forward to find current ", z.currentNode);
					if(z.currentNode == current) {
						//console.log("Current found ", current);
						break;
					}
				}		
				//console.log("Going backward to find previous node we can delete ");
				while(z.previousNode()) {
					//console.log("<- ", z.currentNode);
					if(z.currentNode.nodeType == Node.TEXT_NODE) {
						// if it's a text node we can delete it
						return z.currentNode;
					} else if(z.currentNode.innerText == '\n' && z.currentNode !== root) {
						return z.currentNode;
					}
				}
				return null;
			}
			function get_range() {
				var x = window.getSelection().getRangeAt(0).cloneRange();
				return x;
			}
			function get_range_length(input) {
				var r = get_range(); 
				var rc = r.cloneRange(true);
				rc.selectNodeContents(input);
				rc.setStart(input,0);
				rc.setEnd(r.endContainer,r.endOffset);
				var s = document.getSelection();
				s.removeAllRanges();
				s.addRange(rc);
				return s.toString().length;
			}
			function get_range_coords(input) {
				var r = get_range(); 
				var rc = r.cloneRange(true);
				rc.selectNodeContents(input);
				rc.setStart(input,0);
				rc.setEnd(r.endContainer,r.endOffset);
				var s = document.getSelection();
				s.removeAllRanges();
				s.addRange(rc);
				// this is necesary because range.toString doesn't correctly return whitespace
				var end = s.toString().length;
				rc.setEnd(r.startContainer,r.startOffset);
				s.removeAllRanges();
				s.addRange(rc);
				var start = s.toString().length;
				return {start:start,end:end};
			}
			function get_selection(input) {
				var r = get_range(); 
				var rc = r.cloneRange(true);
				rc.selectNodeContents(input);
				rc.setStart(input,0);
				rc.setEnd(r.endContainer,r.endOffset);
				var s = document.getSelection();
				s.removeAllRanges();
				s.addRange(rc);
				// this is necesary because range.toString doesn't correctly return whitespace
				var end = s.toString().length;
				rc.setEnd(r.startContainer,r.startOffset);
				s.removeAllRanges();
				s.addRange(rc);
				var start = s.toString().length;
				return {start:start,end:end};
			}
			function set_selection(el,start,end) {
				//console.log("\nSet selection");
				var s = window.getSelection(), x = document.createRange(), a = document.createRange();
				el.normalize();
				// if it's both 0 then just focus
				if(start == 0 && end == 0) {
					a.setStart(el,0); 
					a.setEnd(el,0);
				}
				x.setStart(el,0);
				z = document.createTreeWalker(el);
				var total = 0;
				while(z.nextNode()) {
					// note the logic here is accidentally good
						// because when z.currentNode.length is null, then any computations are NaN
						// and so they go to zero
						// this works when the target node is an element node,
						// and somehow this logic is how it should be
						// whenever we are targeting the range to an element node
						// then the offset should be zero
						// perhaps it works to make this more definite
					//console.log(z.currentNode,z.currentNode.length,a.startContainer);
					x.setEnd(z.currentNode,z.currentNode.length);
					s.removeAllRanges();
					s.addRange(x);
					total = s.toString().length;
					if(total >= start && a.startContainer == document) {
						//console.log('\nStart',z.currentNode,z.currentNode.length-(total-start),z.currentNode.length,total,start,'e',end,a);
						a.setStart(z.currentNode,z.currentNode.length-(total-start));
					}
					if(total >= end) {
						//console.log('End',z.currentNode,z.currentNode.length-(total-end),z.currentNode.length,total,'s',start,end,a);
						a.setEnd(z.currentNode,z.currentNode.length-(total-end));
						break;
					}
				}		
				s.removeAllRanges();
				s.addRange(a);	
				API.view_range(a);
			}
			function set_caret(el,from_start) {
				var s = window.getSelection(), x = document.createRange();
				el.normalize();
				x.setStart(el,0);
				z = document.createTreeWalker(el);
				var total = 0,lastNode = el;
				while(z.nextNode()) {
					x.setEnd(z.currentNode,z.currentNode.length);
					s.removeAllRanges();
					s.addRange(x);
					total = s.toString().length;
					if(total >= from_start) {
						x.setEnd(z.currentNode,z.currentNode.length-(total-from_start));
						break;	
					}
				}		
				x.collapse();
				s.removeAllRanges();
				s.addRange(x);	
			}
			function set_caret_input(el,from_start) {
				el.setSelectionRange(from_start,from_start);
			}
			function save_range() {
				var r = this.get_range();
				return r;
			}
			function view_range(r) {
				var scrollmagnet = r.startContainer || r.endContainer;
				if(!!scrollmagnet) {
					if(scrollmagnet.nodeType !== Node.ELEMENT_NODE) {
						scrollmagnet = scrollmagnet.parentElement;
					}
					if(!!scrollmagnet && !!scrollmagnet.scrollIntoViewIfNeeded) {
						scrollmagnet.scrollIntoViewIfNeeded(false);
					}
					zc1();zc2();
				}
			}
			function revive_range(r) {
				var selection = window.getSelection();
				selection.removeAllRanges();
				selection.addRange(r);
				API.view_range(r);
			}
			// deletion
					// okay well I just found "execCommand" which has implemented this! Awesome!
					// what else can execCommand do?
				function issue_delete(crds,output) {
					console.log("Issuing delete");
					document.execCommand('delete');
					return;
					// buggy:
						// when deleting the last character in the top line, output will delete all lines
						// when deleting back to the previous line, it doesn't merge the lines.
						// when deleting the last character in the top line if there are no more lines we get errors that a span cannot be inserted into the selection, this is because the selection has somehow become attached to the document as a startContainer, I presume this is because we have deleted the other nodes to which the selection was formerly attached, and now, having no such attachment the selection reverts to the default or top level view as a substrate upon which to attach itself

					var s = window.getSelection();
					var r = s.getRangeAt(0);
					if(crds.start == crds.end) {
						var current = r.startContainer;
						var deleteAt = r.startOffset;
						//console.log("current ", current.nodeValue+'', " deleteAt ", deleteAt);
						// negtive value of deleteAt will delete from the end! :)
						// attempt to regress to previous node if we're at the start of one
						if(deleteAt == 0 && current.nodeType == Node.ELEMENT_NODE && current.innerText == '\n') {
							console.log("Deleting ", current);
							current.remove();
							deleteAt = -1;
						} else if(deleteAt == 0) {
							//console.log("Going backward");
							current = find_previous_text_node(output,current);	
							//console.log("Found ", current);
							if(!!current) {
								if(!!current.nodeValue) {
									// a text node to edit
									//console.log("A text node to edit ", current);
									deleteAt = current.nodeValue.length;
								} else {
									//console.log("A blank line to delete ", current);
									// a blank line node to delete
								}
							} else {
								console.log("Nothing to delete");
							}
						}
						if(deleteAt == 0) {
							// we had a black line before us
							//console.log('one left', current);
							if(!!current) {
								current.remove();
							}
						} else if(deleteAt > 0) {
							var work = current.nodeValue.split('');
							work.splice(deleteAt-1,1);	
							current.nodeValue = work.join('');
							var p = current.parentElement;
							if(current.nodeValue.length == 0) {
								p.innerHTML = '';
								if(p !== output) {
									console.log('adding br',p,output);
									p.innerHTML = '<br>';
								}
							} 
						}
					} else {
						r.deleteContents();
					}
				}
			// undo
				function issue_undo() {
					// this is buggy
						// the last few steps in the undo stack fail
					document.execCommand('undo');
				}

	// export API
		API.push_select = push_select;
		API.push_intent = push_intent;
		API.new_sequence = new_sequence;
		API.from_sequence = from_sequence;
		API.close_sequence = close_sequence;
		API.to_sequence = to_sequence;
		API.view_range = view_range;
		API.get_range = get_range;
		API.get_range_length = get_range_length;
		API.get_range_coords = get_range_coords;
		API.set_caret = set_caret;
		API.set_selection = set_selection;
		API.transmit = transmit;
		API.issue_delete = issue_delete;
		API.issue_undo = issue_undo;
		API.save_range = save_range;
		API.revive_range = revive_range;
	return API;
});


