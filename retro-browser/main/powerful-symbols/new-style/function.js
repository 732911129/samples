		function make_green_screen_input(box,cursor,label,value) {
			/* support */
				box.contentEditable = true;
				var last_height = 0;
				if(!!value) {
					box.appendChild(document.createTextNode( value));
				}
				if(!!label) {
					$(box).prev().text(label);
				}
				function wrapFirst(el) {
					$(el).contents().eq(0).filter(
						function () {
							return this.localName !== "div";
						} ).wrap('<div />');
				}
				function caretBound(el,toStart) {
					var r = document.createRange();
					r.selectNodeContents(el);
					r.collapse(toStart);	
					var s = document.getSelection();
					s.removeAllRanges();
					s.addRange(r);
				}
				function postpone(f) {
					// execute function returned by f after everything else has bubbled
					// but save the arguments, e
					return function(e) {
						console.log("Executing ",e);
						window.setTimeout(f(e),50); /* 50ms instead of 0ms now works on iOS */
						return true;
					};
				}
				function onEnter() {
					if(!$(box).hasClass('doubleline') && !$(box).hasClass('tripleline')) {
						// we reverse the enter 'scroll down' effect
						$(box).scrollTop(0);
						$(box).children().filter( function () {
							return $(this).text().length === 0;
							} ).remove();
						// a kind of hack to reverse the effect of an enter applied mid string
						$(box)[0].innerHTML = '<div>' + box.innerText.replace('\n','') + '</div>';
						var next_input = $(box).closest('.input_container').nextAll('.input_container:first').find('.input');	
						if(next_input.length == 0) {
							$(box).blur(); 
						} else {
							next_input.focus();
						}
					}
					if(box.childNodes && box.childNodes[0] 
						&& box.childNodes[0].localName !== "div") {
						wrapFirst(box);
					}
				}
				function removeSpansAndEmptyTextNodes(target) {
					target.find('span').each( function () {
							var jthis = $(this);
							jthis.after(jthis.text());
							jthis.parent()[0].normalize();
							jthis.remove();	
						} );
				}
				function caretEnd(el) {
					caretBound(el,false);
				}
				function caretStart(el) {
					caretBound(el,true);
				}
				function caretLine() {
					var s = document.getSelection();
					if(s.rangeCount <= 0) {
						return 0;
					}
					var box_width = parseFloat(window.getComputedStyle(box).width);
					var cursor_width = parseFloat(window.getComputedStyle(cursor[0]).width);
					var columns = Math.floor(box_width/cursor_width);
					var len = box.childNodes.length;
					if(len == 0) {
						return 0;
					}
					var chars = 0;
					for(var i = 0; i < len; i+= 1) {
						var childNode = box.childNodes[i];
						var childlength = childNode.innerText ?
							childNode.innerText.length : childNode.length;
						if(s.focusNode.parentElement === childNode || s.focusNode === childNode) {
							chars += s.focusOffset;
							break;
						}
						chars += childlength;
					}
					return Math.floor(chars/columns);
				}
				function caretColumn() {
					var inp = document.querySelector('input');
					var z = inp.selectionEnd;
					var x = inp.selectionStart;
					if(x !== z) {
						z = x;
					}	
					if(z < inp.size) {
						return z;
					}
					return inp.size;
				}
				function shadowCursor(e) {
					return function () {
						switch(e.keyCode) {
							case 13:
								onEnter();
							case 8:
							case 37:
							case 38:
							case 39:
							case 40:
							case 46:  
								removeSpansAndEmptyTextNodes($(e.target));
							default:
								break;		
						}
						caretTo(box);
					};
				}


			function caretTo(el,line,column) {
				line = line || caretLine();
				column = column || caretColumn();
				var boxtopscroll = $(box).scrollTop();
				var computed_style_cursor = window.getComputedStyle(cursor[0]);
				var proper_width = parseFloat(computed_style_cursor.width);
				var proper_height = parseFloat(computed_style_cursor.height);
				if(isNaN(proper_height)) {
					proper_height = last_height; 
				} else {
					last_height = proper_height;
				}
				var topoffset = (line*proper_height)-boxtopscroll;
				var realcolumn = column;
				if(realcolumn < 0) {
					realcolumn = 0;	
				}
				var leftoffset = realcolumn*proper_width;
				var baseplace = $(el).offset();
				topoffset -= 1;
				if(topoffset < -1) {
					topoffset = -1;
				}
				var elbox = $(el)[0].getBoundingClientRect();
				var boxcols = Math.floor(elbox.width/proper_width) || 0;
				var boxlines = Math.ceil(el.innerText.length/boxcols) || 0;
				line = line || 0;
				console.log("Cols, lines, line, column", boxcols, boxlines, line, realcolumn);
				if(line >= boxlines && line > 0) {
					// Go up 1 line
					topoffset -= proper_height;
					// Set at max column (it may be more appropriate)
					leftoffset = boxcols*proper_width;
				} 
				console.log(topoffset, leftoffset);
				var newplace = {
					top:baseplace.top+topoffset,
					left:baseplace.left+leftoffset
				};
				$(cursor).offset(newplace);
			}

		/* a way to solve the cursor jumping out of the box on 
			various conditions such as selecting the whole block,
			or some other conditions is to just realize the cursor
			has its own life it has its own dynamics. We must follow it
			and if the cursor goes to the bottom of the block, then we must
			scroll down there too, so the cursor is in view of the text window.
			The cursor will move, we will follow it. We can scroll the block to 
			reach the cursor. And we can put the shadow cursor where the cursor is.
		*/		
	
			/* begin */
				cursor.hide();
				box.addEventListener('keydown',postpone(shadowCursor));
				box.addEventListener('click', postpone(shadowCursor));
				box.addEventListener('touchend', postpone(shadowCursor));
				box.addEventListener('select', postpone(shadowCursor));
				document.addEventListener('selectionchange', postpone(shadowCursor));
				box.addEventListener('focus',function(){console.log("Focus in");});
				box.addEventListener('blur',function(){console.log("Focus out");});
				box.addEventListener('resize',function(){console.log("Resize");});
				// cursor position resets to start
				// we can preserve, but for now just put in end
				$(box).on('focusout', function () {
						$(box).prev().css({
								'background':'transparent',
								'color':'rgba(52,255,181,1.0)'
							});
						if($(box).text().trim().length == 0) {
							$(box).empty();
						}
						if(box.childNodes && box.childNodes[0] 
							&& box.childNodes[0].localName !== "div") {
							wrapFirst(box);
						}
						cursor.hide();
					});
				$(box).on('focusin', function () {
						cursor.show();
						$(box).prev().css({
								'background':'rgba(0,211,144,1.0)',
								'color':'rgba(1,37,74,1.0)'
							});
						// TODO: it would be great to make cursor go to end
						//postpone(caretEnd)(box);
						caretTo(box);
					});
				$('.input_label').on('click', function () {
						$(this).next().focus();
					});
				// resize is not working for more than one box at a time. Why?
				//$(box).on('resize',postpone(shadowCursor));
		}
		make_green_screen_input($('.menu-box')[0],$('.cursor'),"Name","your name");


