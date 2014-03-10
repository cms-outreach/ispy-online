function hasFileAPI() {
	if ( window.FileReader ) {
  		return true;
  	} else {
  		console.log("FileReader", window.FileReader);
  		console.log("File", window.File);
  		console.log("FileList", window.FileList);
  		console.log("FileSystem", window.FileSystem);
  		return false;
  	}
}
    
function loadFile() {
	var fileList = document.getElementById('file-selector').files;
	document.currentFileList = fileList;
	showEventBrowser();
}

function showEventBrowser() {

	if (!hasFileAPI()) {
		alert("Sorry. You seem to be using a browser that does not support the FileReader API. Please try with Chrome (6.0+), Firefox (3.6+), Safari (6.0+), or IE (10+).");
		return;
	}

	centerElement("event-browser");
	clearList("browser-files");
	clearList("browser-events");
	$("#event-browser").show();
	$("#browser-load").addClass("disabled");
	updateFileList(document.currentFileList, "");
}

function closeEventBrowser() {
	$("#event-browser").hide();
	$("#selected-event").html("");
}

function clearList(id) {
	var tbl = document.getElementById(id);
	while (tbl.rows.length > 0) {
		tbl.deleteRow(0);
	}
}

var listCache = {};

function updateFileList(list, dir) {
	clearList("browser-files");
	clearList("browser-events");
	document.currentFileList = list;
	document.settings.lastDir = dir;
	var tbl = document.getElementById("browser-files");
	for (var i = 0; i < list.length; i++) {
		var e = list[i];
		var row = tbl.insertRow(tbl.rows.length);
		var cell = row.insertCell(0);
		var cls = e.type == 1 ? "dir" : "file"; 
		cell.innerHTML = '<a id="browser-file-' + i + '" class="' + cls + '" onclick="selectFile(\'' + i + '\');">' + e.name + '</a>';  
	}
	fleXenv.fleXcrollMain("browser-files-div");
}

function selectFile(index) {
	 var reader = new FileReader();

    reader.onload = function(e) {
    	var data = e.target.result; 
       	var zip = new JSZip(data);
       	var eventlist = []; 
       	$.each(zip.files, function(index, zipEntry){
       		if ( zipEntry._data !== null && zipEntry.name !== "Header" ) {
       			eventlist.push(zipEntry.name);
       		}
       	});
       	updateEventsList(eventlist);
       	document.igdata = zip;
    }
    
    reader.onerror = function(e) {
       alert(e);
    }

    reader.readAsArrayBuffer(document.currentFileList[index]); 

	if (document.selectedFileIndex) {
		$("#browser-file-" + document.selectedFileIndex).removeClass("selected");
	}
	if (document.selectedEventIndex) {
		$("#browser-event-" + document.selectedEventIndex).removeClass("selected");
	}

	document.selectedFileIndex = index;
}

function updateEventsList(list) {
	document.currentEventList = list;
	clearList("browser-events");
	var tbl = document.getElementById("browser-events");
	for (var i = 0; i < list.length; i++) {
		var e = list[i];
		var row = tbl.insertRow(tbl.rows.length);
		var cell = row.insertCell(0); 
		cell.innerHTML = '<a id="browser-event-' + i + '" class="event" onclick="selectEvent(\'' + i + '\');">' + e + '</a>';  
	}
	fleXenv.fleXcrollMain("browser-events-div");
}

function selectEvent(index) {
	var file = document.currentFileList[document.selectedFileIndex];
	if (document.selectedEventIndex) {
		$("#browser-event-" + document.selectedEventIndex).removeClass("selected");
	}
	$("#browser-event-" + index).addClass("selected");
	document.selectedEventIndex = parseInt(index);
	var event = document.currentEventList[document.selectedEventIndex];
	var ld = document.settings.lastDir;
	$("#selected-event").html(ld + "/" + file.name + ":" + event);
	$("#browser-load").removeClass("disabled");
}

function loadEvent() {	
	closeEventBrowser();

	var file = document.currentFileList[document.selectedFileIndex];
	var event = document.currentEventList[document.selectedEventIndex];
	var path = document.settings.lastDir + "/" + file.name + "/" + event;
	
	$("#title").html("Loading..."+event);

	try{
    	var ed = JSON.parse(cleanupData(document.igdata.file(event).asText()));
    	enableNextPrev();
    	eventDataLoaded(ed);
    } catch(e) {
    	alert(e);
    } 

    $("#title").html("Event " + (document.selectedEventIndex+1) + " of " + document.currentEventList.length + ":" + path);
}

function enableNextPrev() {
	if (document.selectedEventIndex > 0) {
		$("#prev-event-button").removeClass("disabled");
	}
	else {
		$("#prev-event-button").addClass("disabled");
	}
	if (document.currentEventList && document.currentEventList.length - 1 > document.selectedEventIndex) {
		$("#next-event-button").removeClass("disabled");
	}
	else {
		$("#next-event-button").addClass("disabled");
	}
}

function nextEvent() {
	if (document.currentEventList && document.currentEventList.length - 1 > document.selectedEventIndex) {
		document.selectedEventIndex++; 
		loadEvent(); 
	}
}

function prevEvent() {
	if (document.currentEventList && document.selectedEventIndex > 0) {
		document.selectedEventIndex--;
		loadEvent(); 
	}
}

function cleanupData(d) {
    // rm non-standard json bits
    // newer files will not have this problem
    d = d.replace(/\'/g, "\"")
	.replace(/nan/g, "0");
    return d;
}