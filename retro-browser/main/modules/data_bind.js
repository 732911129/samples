rn.data_bind = new (function data_bind() {
	/* functions */
		function load_extraction(msg) {
			//console.log("Loading Extraction",msg);
			if(msg.line == 112 && msg.sourceId.indexOf('reveal.js') == msg.sourceId.length-9) {
				try { 	
					var results = JSON.parse(msg.message);
					var sheet = document.querySelector('sheet-app');
					var sheet_insert = sheet.querySelector('::shadow #cell-stash');
					var start_row = parseInt(sheet.getAttribute('clicked-row'));
					var start_column = parseInt(sheet.getAttribute('clicked-column'));
					if(sheet.hasAttribute('cell-clicked')) {
						start_row++;
					}		
					results = results.slice(0,10);
					console.log("Loading Extraction",results);
					var result_index = 0, current_row;
					if(start_row > 0 && start_column > 0) {
						for(var result of results) {
							current_row = start_row + result_index;
							var cell_selector = '::shadow [row="row'+current_row+'"]' + '[column="column'+start_column+'"]';
							console.log("Cell selector " + cell_selector);
							var new_cell = sheet.querySelector( cell_selector );
							console.log("New cell " + new_cell);
							if(!new_cell) {
								new_cell = document.createElement('sheet-cell');
								new_cell.setAttribute('row','row' + current_row);	
								new_cell.setAttribute('column','column' + start_column);	
								sheet_insert.appendChild(new_cell);	
							}
							var input = new_cell.querySelector('::shadow input');
							input.value = result;
							result_index++;
						}	
					} else {
						console.log("Invalid row and column to paste data ", start_row, start_column);
					}
				}
				catch (e) {
					console.log(e, e.stack);
				}
			} else {
				//console.log("Load extraction doesn't handle this message ", msg);
			}
		}

	/* api */
		this.load_extraction = load_extraction;
});
