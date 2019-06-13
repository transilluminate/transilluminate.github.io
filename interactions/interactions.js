jQuery(document).ready( function(){	// once the page has loaded, let's start...

// define variables
var availableMedications = [];	// array for all medications listed in the BNF ( availableMedications = [medication1...] )
var displayMedications   = [];	// empty array of the meds we are going to add via the search box
var medicationDetails    = {};	// this stores the details of the interactions of the medications

// function buildAvailableMedications() {	// scrapes the BNF and builds a JSON object for saving locally to avoid C.O.R.S. issues
//	$.ajax({ url:'https://bnf.nice.org.uk/interaction/index.html', type:'get', dataType:'html',
//		success:function(data){
//			var medications = {};	// data hash for medicationsList.json
//			var jsonLinks = [];		// json links to download the json files (sorry for scraping, no other way around C.O.R.S. unless hosted by NICE!)
//			var html = $.parseHTML(data);
//			var medicationsList = $(html).find('#A,#B,#C,#D,#E,#F,#G,#H,#I,#J,#K,#L,#M,#N,#O,#P,#Q,#R,#S,#T,#U,#V,#W,#X,#Y,#Z').find('li');
//			medicationsList.each( function(){
//				var title = $(this)[0].textContent.toLowerCase().trim();	// put this lowercase to make matching easier
//				var link = $(this)[0].innerHTML.replace(/<a href=\"(.+).html.*/,"$1.json"); // grab the json url
//				medications[title] = link;	// build local relative urls
//				// can now output the data either as list of urls to download, or as a key:value JSON file
//				// 1. list of the urls:
//				//		output one per line... cut and paste into the 'interaction' folder 'urls.txt'
//				//		then run 'wget -i urls.txt' or 'xargs -n 1 curl -O < urls.txt' to download:
//				// $("#console pre code").append("https://bnf.nice.org.uk/" + link + "<br>");
//			});
//			// 2. key:value JSON file: cut and paste, save as 'medicationsList.json' in the root folder:
//			// $("#console pre code").append( JSON.stringify( medications ) );
//		}
//	});
// }
// buildAvailableMedications(); // uncomment block to run, also uncomment the #console div in the html to see results

function loadAvailableMedications(){	// load the medication list for the search terms
	$.getJSON('medicationsList.json', function(data) {					// localfile, built using buildAvailableMedications()
		$.each( data, function( title, jsonLink ) {
			availableMedications.push(title);								// push the title into the array of medications
			var baseURL = '/interaction/';									// relative filepath
			// var baseURL = 'https://bnf.nice.org.uk/interaction/';		// (works with Safari, not Chrome due to C.O.R.S.)
			medicationDetails[title] = { 'json': baseURL + jsonLink };		// and store the urls to the JSON files
		});
		// once searchArray has been loaded, initialise the typeahead
		var searchSuggestions = new Bloodhound({					// initialise a new search engine...
										datumTokenizer: function(datum){			// custom substring tokenizer: https://stackoverflow.com/a/23618659
											var tokens = [];						// blank to return
											var letterCount = datum.length;			// get the length of each passed datum (i.e. entry in the availableMedications array)
											for (var letters = 1; letters <= letterCount; letters ++) {
												for (var i = 0; i + letters <= letterCount; i++) {
													tokens.push( datum.substr(i, letters) );	// multiple combinations for every available size (eg. dog = d, o, g, do, og, dog)
												}
											}
											return tokens;
										},
 										queryTokenizer:Bloodhound.tokenizers.whitespace,
 										local:availableMedications	// ... based on the array we just built
									});
		// attach the typeahead actions to the search box
		$("#searchBox").typeahead({ hint:false, highlight:true, minLength:1 },{ source:searchSuggestions, limit:10 });
		// focus on the text entry box
		$("#searchBox").focus();
	});
}

// bind the 'submit' synonyms
$('.typeahead').bind('typeahead:select', function(event,string) {
	event.preventDefault();
	addMedication(string);
});
$("#submitButton").click( function(event) {
	event.preventDefault();
	string = $("#searchBox").val().toLowerCase();
	addMedication(string);
});
$("#searchForm").submit( function(event) {
	event.preventDefault();	// stops the page reloading and blanking all the entries
});
$("#searchForm").trigger('submit');	// workaround for Internet Explorer. Bless. https://stackoverflow.com/a/16201435

// add the data
function addMedication(term) {
	if (term && availableMedications.includes(term) && !displayMedications.includes(term) && medicationDetails[term]['json']) {	// sanity checks
		$.getJSON(medicationDetails[term]['json'], function(jsonObject){		// async call
			// the JSON tree is fairly complex, use an online explorer to understand (i.e. https://jsonformatter.org/json-viewer)
			var title = jsonObject['@graph'][0]['hasTitle']['@value'].replace(/(<([^>]+)>)/ig,"").trim().toLowerCase().toString();	// strip html
			var link = jsonObject['@graph'][0]['@id'].toString() + ".html";		// append '.html' to the link
			displayMedications.push(title);										// push into simple 1 dimensional array for quick iteration later
			medicationDetails[title]['url'] = link;								// the 'url' is a link to further details on the drug
			medicationDetails[title]['interactions'] = {};						// the 'interactions' is currently empty, we look at each one below
			$.each(jsonObject['@graph'][0]['hasInteraction'], function( index, object ) {	// get the array object 'hasInteraction', iterate over it
				var interactionTitle	= object['hasTitle']['@value'].replace(/(<([^>]+)>)/g,"").toLowerCase().toString();	// again, strip the HTML tags
				var interactionLink		= object['@id'].replace(/#/,".html#").toString();						// add .html within the sctring, before '#'
				var interactionDetails = "";
				var interactionSeverity = "";
				for (var i = 0; i < object['hasMessage'].length; i++) { // handling for multiple interactions
					var string = object['hasMessage'][i]['hasTextContent']
									.replace(/\r?\n|\r/g,"")	// get rid of newlines
									.replace(/ {1,}/g," ")		// get rid of trailing spaces
									.replace(/ \./g,".")			// get rid of the space before period
									.toString();				// make sure it's a string object
					interactionDetails += string;				// append the string
					if (i + 1 < object['hasMessage'].length) { interactionDetails += "<br><br>"; }	// line down
					
					var severity = object['hasMessage'][0]['hasImportance'].toString();	// get the severity of each
					interactionSeverity = (severity == 'Severe') ? 'Severe' : interactionSeverity;	// set the maximum
				}
				// then push this into a fairly complex data structure, that can be easily expanded later:
				medicationDetails[title]['interactions'][interactionTitle] = { 'url': interactionLink, 'severity': interactionSeverity, 'details': interactionDetails };
				// for example:	medicationDetails['simvastatin']['interactions']['clarithromycin'][severity] = 'Severe'
				//				medicationDetails['simvastatin']['url'] = 'https://bnf.nice.org.uk/...'
			});
			redrawTable();	// now we have data, redraw the table
		});

	}
};

function deleteMedication(entry) {
	if (entry && displayMedications.includes(entry)) {	// sanity check

		index = $.inArray(entry, displayMedications);	// get the index
		displayMedications.splice( index, 1 );			// splice it out
		
// 		// remove from the displayed table
// 		$("#resultsTable").find('tr').eq(index + 1).css('background','#f00').fadeOut('slow', function() { $(this).remove(); });
// 		$("#resultsTable tr").each( function() {
// 			$(this).find('td,th').eq(index + 1).fadeOut('slow', function() { $(this).remove(); });
// 		});
// 		$('.tooltip').tooltip('hide');

		redrawTable();	// no need to call this now
	};
}

function redrawTable() {
	displayMedications.sort();									// sort the array alphabetically	
	var tableSize = (displayMedications.length + 1);				// add 1 to the array length, so the table can have headers
	$("#resultsTable").empty();									// start with empty table
	for (var y = 0; y < tableSize; y++) {						// step down line by line...
		var row = ("<tr>");										// build a table row (note: don't *need* the brackets, but helps readablity)
		for (var x = 0; x < tableSize; x++) {					// then per column
			if (x == 0 && y == 0) {								// top left cell is special...			
				if (tableSize == 1) {							// blank table, add a starting hint
					row += ("<td style='text-align:right'>");
					row +=   ("<span class='text-success'>");
					row +=     ("<i class='fas fa-arrow-up'></i>");
					row +=     (" Start by adding a medication here...");
					row +=   ("</span>");
					row += ("</td>");
				}
				else {
					row += ("<td></td>");						// otherwise just display a blank cell
				}
			}
			else if (x == y) {									// diagonals...
				row += ("<td class='table-active'></td>");		// ... are grey
			}
			else {
				var rowTitle = displayMedications[y - 1];		// get the row header
				var columnTitle = displayMedications[x - 1];	// and the column header
				
				if (y == 0) {	// create column headers
					row += ("<th scope='column' class='rotate col-xs-2'>");
					row +=   ("<div class='rotated'>");
					row +=     ("<a class='btn btn-outline-secondary' data-toggle='tooltip' title='" + columnTitle + "' role='button' target='_blank' href='" + medicationDetails[columnTitle]['url'] + "#'>");
					row +=       (columnTitle);
					row +=     ("</a>");
					row +=   ("</div>");
					row += ("</th>");
				}
				else if (x == 0) {		// create row headers
					row += ("<th class='elementRow' scope='row' style='text-align:right'>");
					row +=   ("<a class='btn btn-outline-secondary mr-sm-2 deleteThisEntry' data-toggle='tooltip' title='" + rowTitle + "' role='button' target='_blank' href='" + medicationDetails[rowTitle]['url'] + "#'>");
					row +=     (rowTitle);
					row +=   ("</a>");
					row +=   ("<button class='btn btn-outline-danger deleteButton' data-toggle='tooltip' title='Remove " + rowTitle + "'>");
					row +=     ("<i class='far fa-trash-alt'></i>");
					row +=   ("</button>");
					row += ("</th>");
				}
				else { 				// build the interaction cells
					if (medicationDetails[rowTitle]['interactions'][columnTitle]) {						// check if an interaction actually exists, if so:
						
						var url = medicationDetails[rowTitle]['interactions'][columnTitle]['url'];				// get the details, link
						var severity = medicationDetails[rowTitle]['interactions'][columnTitle]['severity'];		// ... severity ...
 						var details = medicationDetails[rowTitle]['interactions'][columnTitle]['details'];		// and info about the interaction

						// ***

						var button = (severity == "Severe") ? "btn-danger" : "btn-warning";						// conditionally format the cell colour...
						var icon = (severity == "Severe") ? "fas fa-exclamation-triangle" : "fas fa-balance-scale";	// ... and icon from font awesome
									// cells have colourized button, link to the interaction details, and a tooltip
						row += ("<td>");
						row +=   ("<a class='btn " + button + "' role='button' target='_blank' href='" + url + "' data-toggle='tooltip' data-html='true' title='" + details + "'>");
						row +=     ("<i class='" + icon + "'></i>");
						row +=   ("</a>");
						row += ("</td>");
					}
					else {			// no interaction found, colour a blank cell green with a thumbs up!
						row += ("<td>");
						row +=   ("<button type='button' class='btn btn-outline-success disabled' data-toggle='tooltip' title='No interactions listed.'>");
						row +=     ("<i class='fas fa-thumbs-up'></i>");
						row +=   ("</button>");
						row += ("</td>");
					}
				}
			}
		};			// end of iteration 'x' (columns)
		row += ("</tr>");						// finish the row tag
		$("#resultsTable").append(row);			// finished building the row, add this to the table's DOM
  	};				// end of iteration 'y' (rows)		
	$(".deleteButton").click( function(event){	// now we can assign actions to the delete button
		event.preventDefault();									// stop the form from properly firing
		var entry = $(this).prev(".deleteThisEntry").text();	// we added the deleteThisEntry class to find the entry easily
   		deleteMedication(entry);								// pass the entry to the deleteRow code
	});
	// clear up and get ready for more!
	$('.tooltip').tooltip('hide');	
	$("#searchBox").focus();
	$("#searchBox").val('');
	$(".typeahead").typeahead('val','');	
};

// bind jQuery to the many ways to change the selection
$("#searchBox").keyup( function() { visualFeedback() });
$("#searchBox").blur(  function() { visualFeedback() });
$("#searchBox").focus( function() { visualFeedback() });
$("#searchBox").click( function() { visualFeedback() });
$('.typeahead').bind('typeahead:cursorchange', function() { visualFeedback() });

function visualFeedback() {	// conditional formatting of the submitButton and searchBox text
	var searchTerm = $("#searchBox").val().toLowerCase();
	if (searchTerm) {		// we have a non-empty box...
		if (!displayMedications.includes(searchTerm)) {		// ... we don't already have it in the list...
			if (availableMedications.includes(searchTerm)) {		// ... and it exists in the BNF! Success!
				$("#submitButton").prop('disabled', false);
				$("#submitButton").removeClass('disabled btn-outline-danger btn-outline-secondary btn-outline-success');
				$("#submitButton").addClass('btn-success');
				$("#searchBox").addClass('text-success');
				$("#searchBox").removeClass('text-secondary');
			}
			else {			// otherwise, it doesn't exist in the BNF
				$("#submitButton").prop('disabled', true);
				$("#submitButton").removeClass('btn-success btn-outline-success btn-outline-secondary');
				$("#submitButton").addClass('btn-outline-danger disabled');
				$("#searchBox").addClass('text-secondary');
				$("#searchBox").removeClass('text-success');
			}
		}
		else {				// or we already have it
			$("#submitButton").prop('disabled', true);
			$("#submitButton").removeClass('btn-outline-danger btn-outline-secondary btn-success');
			$("#submitButton").addClass('btn-outline-success disabled');
			$("#searchBox").addClass('text-success');
			$("#searchBox").removeClass('text-secondary');
		}
	}
	else {					// or we have an empty box
		$("#submitButton").prop('disabled', true);
		$("#submitButton").removeClass('btn-outline-danger btn-outline-success btn-success');
		$("#submitButton").addClass('btn-outline-secondary disabled');
		$("#searchBox").addClass('text-secondary');
		$("#searchBox").removeClass('text-success');
		
	}
}

// bind the  tooltip to all the dynamically created items with 'data-toggle' properties
$('body').tooltip({ selector: '[data-toggle="tooltip"]', delay: { 'show':300, 'hide':100 }, placement:'right' });

// lastly, build the availableMedications list
loadAvailableMedications();

// and draw the first table...
redrawTable();

});	// :D