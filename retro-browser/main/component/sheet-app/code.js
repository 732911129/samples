(function() {
	function setup_sheet_app(root) {
		function setup_sheet() {
			var rows_element = root.querySelector("#rows");
			var columns_element = root.querySelector('#columns');
			var container = root.querySelector('#container');
			var current_columns = [], current_rows = [];

			/* note that these row and column arrays will no longer contribute to valid results */
			/* for row and column indexes of clicks after insertions or deletions of columns or rows */
			var rows = rn.conversion.arrify(rows_element.children), columns = rn.conversion.arrify(columns_element.children);	

			/* removing the rows from the top of the z-stack allows element from point */
			/* to obtain the next underlying element, in this case, columns */
			function remove_rows() {
				rows_element.style.zIndex = 0;
			}	
			function replace_rows() {
				rows_element.style.zIndex = 3;	
			}

			function remove_elem( elem_moused ) {
				elem_moused.style.zIndex = 1;
			}
		
			function highlight_row ( elem_moused ) {
				while(current_rows.length > 0) {
					current_rows.pop().style.backgroundColor = "";
				}
				if( !!elem_moused && !elem_moused.matches('#container') ) {
					elem_moused.style.backgroundColor = "rgba(255,0,127,0.4)";
					current_rows.push(elem_moused);
				}
			}

			function highlight_column( elem_moused ) {
				while(current_columns.length > 0) {
					current_columns.pop().style.backgroundColor = "";
				}
				if( !!elem_moused && !elem_moused.matches('#container') ) {
					elem_moused.style.backgroundColor = "rgba(255,0,127,0.4)";
					current_columns.push(elem_moused);
				}
			}

			function get_intended_cell(mouse_event) {
				var removed_elems = [], row_moused, top_elem;
				var elem_moused = root.elementFromPoint(mouse_event.clientX, mouse_event.clientY);
				if(!!elem_moused) {
					top_elem = elem_moused;
					if(elem_moused.matches('sheet-cell')) {
						removed_elems.push([elem_moused, elem_moused.style.zIndex]);
						//console.log("Removing ", elem_moused);
						remove_elem(elem_moused);		
						elem_moused = root.elementFromPoint(mouse_event.clientX, mouse_event.clientY);
					}
					if(elem_moused.matches('[row]')) {
						row_moused = elem_moused;
						//console.log("Highlighting row ", row_moused );
						highlight_row( row_moused );
					}
				}
				remove_rows();
				var column_moused = root.elementFromPoint(mouse_event.clientX, mouse_event.clientY);
				//console.log("Column moused ", column_moused);
				replace_rows();
				while(!!(elem_moused=removed_elems.pop())) {
					elem_moused[0].style.zIndex = elem_moused[1];	
				}
				highlight_column( column_moused );
				//console.log(rows.indexOf(row_moused), columns.indexOf(column_moused));
				return { row : rows.indexOf(row_moused), column : columns.indexOf(column_moused), top_elem : top_elem };
			}

			function record_intended_cell(mouse_event) {
				var cell = get_intended_cell(mouse_event);
				root.host.setAttribute('clicked-row',cell.row);	
				root.host.setAttribute('clicked-column',cell.column);	
				if(!!cell.top_elem && cell.top_elem.matches('sheet-cell')) {
					root.host.setAttribute('cell-clicked','yes');
				} else {
					root.host.removeAttribute('cell-clicked');
				}
			}

			root.addEventListener('click', record_intended_cell );	
			root.addEventListener('mousemove', get_intended_cell );	
			container.addEventListener('mouseout', highlight_column.bind(null,null) );
		}
		setup_sheet();
	}

	rn.create_task('component','sheet-app','setup', setup_sheet_app);
}());
