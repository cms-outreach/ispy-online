function displayCollection(key) {
    var d = document.eventData;
    
    var type = d["Types"][key],
		collection = d["Collections"][key];

    $('#collection-table').empty();
    //$('#table').html("<table id=\"collection-table\">");

    $('#collection-table').append('<thead> <tr>')

    for ( var t in type ) {
		$("#collection-table thead > tr").append($('<th class="group">').text(type[t][0]));
    }
    
    for ( c in collection ) {
		var row_content = "<tr>";

		for ( v in collection[c] ) {
	    	row_content += "<td>"+collection[c][v]+"</td>";
		}

		$('#collection-table').append(row_content);
    } 

    fleXenv.fleXcrollMain("#datatable-scroll");
    fleXenv.updateScrollBars();

    /*
    $('#collection-table').dataTable({
		 "sScrollX": "800px",
		 "sScrollY": "150px",
		 "bPaginate": false,
		 "bDestroy": true
		});

    // rm these "by hand" until I figure out proper config
    $('#collection-table_filter').remove();
    $('#collection-table_info').remove();
    */   
}
