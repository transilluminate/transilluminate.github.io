// controller.js
"use strict";

jQuery(document).ready( function(){

// add selected medication
function AddMedication(Medication) {
	if (Medication && inAvailableMedications(Medication) && !inDisplayMedications(Medication)){
		var filepath = '/interaction/';
		var filename = MedicationDetails[Medication]['json'];
		var url = [filepath,filename].join('');
		
		$.getJSON( url, function(json){
			var MedicationLink = [json['@graph'][0]['@id'],".html"].join('');
			MedicationDetails[Medication]['url'] = MedicationLink;
			MedicationDetails[Medication]['interactions'] = {};
			
			$.each(json['@graph'][0]['hasInteraction'], function( index, object ) {
				var InteractionTitle	= object['hasTitle']['@value']
											.replace(/(<([^>]+)>)/g,"")	// strip HTML
											.toLowerCase();				// lowercase
				var InteractionLink		= object['@id']
											.replace(/#/,".html#");
											
				var InteractionDetails = [];
				var InteractionSeverity = "";
				for (var i = 0; i < object['hasMessage'].length; i++) {
					var Interaction = object['hasMessage'][i]['hasTextContent']
										.replace(/\r?\n|\r/g,"")	// get rid of newlines
										.replace(/ {1,}/g," ")		// get rid of trailing spaces
										.replace(/ \./g,".");		// get rid of the space before period
					InteractionDetails.push( escapeHtml(Interaction) );				// add it to the interaction details array
						
					var severity = object['hasMessage'][0]['hasImportance'];	// get the severity of each
					InteractionSeverity = (severity == 'Severe') ? 'Severe' : InteractionSeverity;
				}
				MedicationDetails[Medication]['interactions'][InteractionTitle] = {
					'url': InteractionLink,
					'severity': InteractionSeverity,
					'details': InteractionDetails.join("<br><br>")
				};
			});
		})
		.done( function() {
			DisplayMedications.push(Medication);
			DisplayMedications.sort();
			RefreshView();
		})
	}
}

// delete selected medication
function DeleteMedication(Medication){
	if (Medication && inDisplayMedications(Medication)){
		var index = $.inArray(Medication, DisplayMedications);	// get the index
		DisplayMedications.splice( index, 1 );					// splice it out
		RefreshView();
	};
}

// checkers
function inDisplayMedications(string){
	return ($.inArray( string, DisplayMedications ) >= 0);
}
function inAvailableMedications(string){
	return ($.inArray( string, AvailableMedications() ) >= 0);
}

// view stuff
function RefreshView() {
	var tableSize = (DisplayMedications.length + 1);
	$("#interactionsTable").empty().hide();
	$("#interactionsInfo").empty().hide();
	
	var AnticholinergicBurden = getTotalAnticholinergicScore(DisplayMedications,ACB);
	$("#interactionsInfo").append("<br><strong>Medications:</strong> " + DisplayMedications.join(', '));
	$("#interactionsInfo").append("<br><strong>Total Anticholinergic Burden:</strong> " + getTotalAnticholinergicScore(DisplayMedications,ACB));
	$("#interactionsInfo").append("<br><strong>Interactions:</strong> ");
	
	for (var y = 0; y < tableSize; y++) {						// step down line by line...
	
		var row = "<tr>";
		for (var x = 0; x < tableSize; x++) {					// then per column
			
			if (x == 0 && y == 0) {								// top left cell is special...			
				if (tableSize == 1) {							// blank table, add a starting hint
					row += "<td style='text-align:right'>";
					row +=   "<span class='text-success'>";
					row +=     "<i class='fas fa-arrow-up'>&nbsp</i>";
					row +=     "Start by adding a medication here...";
					row +=   "</span>";
					row += "</td>";
				}
				else {
					row += "<td style='text-align:left; vertical-align:bottom'>";
					
					// toggle info button
					row += "<button id='toggleInteractionDetails' class='btn btn-outline-secondary mr-sm-2 mt-sm-2'>Details <i id='infoToggleIcon' class='far fa-caret-square-down'></i></button>";

					// polypharmacy alert!
					if (tableSize >= 6) {
						var button = (tableSize >= 8) ? 'btn-outline-danger' : 'btn-outline-warning';
						row += "<button class='btn mr-sm-2 mt-sm-2 disabled " + button + "' data-toggle='tooltip' title='Polypharmacy!'><i class='fas fa-exclamation-triangle'></i></button>";
					}
					
					if (AnticholinergicBurden) {
						var button = (AnticholinergicBurden >= 3) ? 'btn-outline-danger' : 'btn-outline-warning';
						row += "<button class='btn mr-sm-2 disabled " + button + " mr-sm-2 mt-sm-2' data-toggle='tooltip' title='Anticholinergic Burden = " + AnticholinergicBurden + "'>ACB " + AnticholinergicBurden + "</button>";
					}
					
					row += "</td>";
				}				
			}
			else if (x == y) {
				row += ("<td class='table-active'><a class='btn btn-outline-secondary disabled'><i class='fas fa-tablets'></i></button></td>");
			}
			else {
				
				var rowTitle = DisplayMedications[y - 1];		// get the row header
				var columnTitle = DisplayMedications[x - 1];	// and the column header
				var AnticholinergicBurden = getAnticholinergicScore(rowTitle,ACB);
				
				if (y == 0) {	// create column headers
					row += ("<th scope='column' class='rotate col-xs-2'>");
					row +=   ("<div class='rotated'>");
					row +=     ("<a class='btn btn-outline-secondary' data-toggle='tooltip' title='" + columnTitle + "' role='button' target='_blank' href='" + MedicationDetails[columnTitle]['url'] + "#'>");
					row +=       (columnTitle);
					row +=     ("</a>");
					row +=   ("</div>");
					row += ("</th>");
				}
				else if (x == 0) {		// create row headers
					row += ("<th class='elementRow' scope='row' style='text-align:right'>");
					row +=   ("<a class='btn btn-outline-secondary mr-sm-2' data-toggle='tooltip' title='" + rowTitle + "' role='button' target='_blank' href='" + MedicationDetails[rowTitle]['url'] + "'>");
					row +=     (rowTitle);
					row +=   ("</a>");

					// anticholinergic burden
					if (AnticholinergicBurden < 3) { button = 'btn-outline-warning' }
					else if (AnticholinergicBurden >= 3) { button = 'btn-outline-danger' }
					row +=   ("<button class='btn mr-sm-2 disabled " + button + "' data-toggle='tooltip' title='Anticholinergic Burden = " + AnticholinergicBurden + "'>");
					row +=     (AnticholinergicBurden);
					row +=   ("</button>");		

					// delete button
					row +=   ("<button name='" + rowTitle + "' class='btn btn-outline-danger deleteButton' data-toggle='tooltip' title='Remove " + rowTitle + "'>");
					row +=     ("<i class='far fa-trash-alt'></i>");
					row +=   ("</button>");
					
					row += ("</th>");
				}					
				else { 				// build the interaction cells
					if (MedicationDetails[rowTitle]['interactions'][columnTitle]) {						// check if an interaction actually exists, if so:
						
						var url = MedicationDetails[rowTitle]['interactions'][columnTitle]['url'];				// get the details, link
						var severity = MedicationDetails[rowTitle]['interactions'][columnTitle]['severity'];		// ... severity ...
 						var details = MedicationDetails[rowTitle]['interactions'][columnTitle]['details'];		// and info about the interaction

						var button = (severity == "Severe") ? "btn-danger" : "btn-warning";						// conditionally format the cell colour...
						var icon = (severity == "Severe") ? "fas fa-exclamation-triangle" : "fas fa-balance-scale";	// ... and icon from font awesome
									// cells have colourized button, link to the interaction details, and a tooltip
						row += ("<td>");
						row +=   ("<a class='btn " + button + "' role='button' target='_blank' href='" + url + "' data-toggle='tooltip' data-html='true' title='" + details + "'>");
						row +=     ("<i class='" + icon + "'></i>");
						row +=   ("</a>");
						row += ("</td>");
						
						// add a note with explanatory text
						if (DisplayMedications.length > 1 && x <= y) {
							$("#interactionsInfo").append("<li>" + details);
						}
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

		};
		row += "</tr>";		
		$("#interactionsTable").append(row).fadeIn( "slow", function() {});
	};
	
	$(".deleteButton").click( function(event){	// now we can assign actions to the delete button
		event.preventDefault();									// stop the form from properly firing
		var entry = $(this).attr('name');		
   		DeleteMedication(entry);								// pass the entry to the deleteRow code
	});

	$("#toggleInteractionDetails").click( function() {
		if ( $("#interactionsInfo").is(":visible") ) {
			// hide details
			$("#interactionsInfo").fadeOut( "fast", function() {});
			$("#infoToggleIcon").removeClass("fa-caret-square-up");
			$("#infoToggleIcon").addClass("fa-caret-square-down");
		}
		else {
			// show details
			$("#interactionsInfo").fadeIn( "slow", function() {});
			$("#infoToggleIcon").removeClass("fa-caret-square-down");
			$("#infoToggleIcon").addClass("fa-caret-square-up");
		}		
	});

	// clear up and get ready for more!
	$('.tooltip').tooltip('hide');	
	$("#searchBox").focus();
	$("#searchBox").val('');
	$(".typeahead").typeahead('val','');	
}

// get STOPP info
// function StoppInfo (Medication) {
// 
// }

// get anticholinergic risk
function getAnticholinergicScore(Medication,RiskScore) {
	return (RiskScore[Medication]) ? RiskScore[Medication] : 0;
}

function getTotalAnticholinergicScore(MedicationsArray,RiskScore) {
	var score = 0;
	for (var index = 0; index < MedicationsArray.length; index++) {
		var Medication = MedicationsArray[index];
		score += getAnticholinergicScore(Medication,RiskScore);
    };
    return score;
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
		if (!inDisplayMedications(searchTerm)) {
			if (inAvailableMedications(searchTerm)) {
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

// scrape the BNF to get a list of medications and their links
function BuildMedications() {
	var url = 'https://bnf.nice.org.uk/interaction/index.html';
	$.ajax({ url:url, type:'get', dataType:'html',
		success:function(data){
			var html = $.parseHTML(data);
			var baseURL = "https://bnf.nice.org.uk/";
			var urls = [];
			var details = {};
			var list = $(html)
						.find('#A,#B,#C,#D,#E,#F,#G,#H,#I,#J,#K,#L,#M,#N,#O,#P,#Q,#R,#S,#T,#U,#V,#W,#X,#Y,#Z')
						.find('li');
			list.each( function(){
				var Title = $(this)[0].textContent
							.toLowerCase()
							.trim();
				var Link = $(this)[0].innerHTML
							.replace(/<a href=\"(.+).html.*/,"$1.json");
				details[Title] = { "json": Link };
				urls.push([baseURL, Link].join(""));
			});
			// output one per line... cut and paste into the 'interaction' subfolder 'urlText.txt'
			// then run: 'wget -i urlText.txt' or 'xargs -n 1 curl -O < urlText.txt' to download
			var urlText = urls.join("\n");
 			// DownloadText(urlText,'urlText.txt');		// uncomment to download
 			
			// JSON file: cut and paste, insert into MedicationDetails variable
			var jsonText = JSON.stringify(details);
			// DownloadText(jsonText,'jsonText.txt');	// uncomment to download
		}
	});
}

// download a file
function DownloadText(string,filename){
	window.URL = window.webkitURL || window.URL;
	var contentType = 'text/plain';
	var blob = new Blob([string], { type: contentType });
	var link = document.createElement('a');
	link.download = filename;
	link.href = window.URL.createObjectURL(blob);
	link.textContent = 'Download Link';
	link.dataset.downloadurl = [contentType, link.download, link.href].join(':');
	link.click();
}

// load typeahead object
function CreateTypeahead(){
	var Typeahead = new Bloodhound({
		datumTokenizer: function(datum){
			var tokens = [];
			var letterCount = datum.length;
			for (var letters = 1; letters <= letterCount; letters ++) {
				for (var i = 0; i + letters <= letterCount; i++) {
					tokens.push( datum.substr(i, letters) );
				};
			};
			return tokens;
		},
	 	queryTokenizer:Bloodhound.tokenizers.whitespace,
	 	local: AvailableMedications()
	});
	return Typeahead;
}

var entityMap = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;', '/': '&#x2F;', '`': '&#x60;', '=': '&#x3D;' };
function escapeHtml (string) {
  return String(string).replace(/[&<>"'`=\/]/g, function (s) { return entityMap[s]; });
}

// BuildMedications();	// uncomment to run
var Typeahead = CreateTypeahead();
$("#searchBox").typeahead({ hint:false, highlight:true, minLength:1 },{ source:Typeahead, limit:10 });

$("#interactionsInfo").hide();

// bind the 'submit' synonyms
$('.typeahead').bind('typeahead:select', function(event,string) {
	event.preventDefault();
	AddMedication(string);
});
$("#submitButton").click( function(event) {
	event.preventDefault();
	string = $("#searchBox").val().toLowerCase();
	AddMedication(string);
});
$("#searchForm").submit( function(event) {
	event.preventDefault();	// stops the page reloading and blanking all the entries
	$("#submitButton").click();
});

// bind the  tooltip to all the dynamically created items with 'data-toggle' properties
$('body').tooltip({ selector: '[data-toggle="tooltip"]', delay: { 'show':300, 'hide':100 }, placement:'right' });

RefreshView();
$("#searchBox").focus();

}); // end of document ready