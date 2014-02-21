function enableNextPrev() {
	if (EVD.selectedEventIndex > 0) {
		$("#prev-event-button").removeClass("disabled");
	}
	if (EVD.currentEventList && (EVD.currentEventList.length > EVD.selectedEventIndex)) {
		$("#next-event-button").removeClass("disabled");
	}
}

function loadCurrentEvent() {
	var file = EVD.currentFileList[EVD.selectedFileIndex];
	var event = EVD.currentEventList[EVD.selectedEventIndex];
	var size = event.size;
	var path = EVD.settings.lastDir + "/" + file.name;
	var ro = startDownload(path + ":" + event.name, "Loading " + path + ":" + event.name + "...", EVD.eventDataLoaded);
}

function nextEvent() {
	if (EVD.currentEventList && (EVD.currentEventList.length > EVD.selectedEventIndex)) {
		EVD.selectedEventIndex++;
		loadCurrentEvent();
	}
}

function prevEvent() {
	if (EVD.selectedEventIndex > 0) {
		EVD.selectedEventIndex--;
		loadCurrentEvent();
	}
}

function showEventBrowser() {
	centerElement("event-browser");
	clearList("browser-files");
	clearList("browser-events");
	$("#event-browser").show();
	$("#browser-load").addClass("disabled");
	browserFileList(EVD.settings.lastDir);
}

function closeEventBrowser() {
	$("#event-browser").hide();
}

function clearList(id) {
	var tbl = document.getElementById(id);
	while (tbl.rows.length > 0) {
		tbl.deleteRow(0);
	}
}

var listCache = {};

function browserFileList(dir) {
	if (listCache[dir]) {
		updateFileList(listCache[dir], dir);
	}
	else {
		browserRequest("list", dir, browserFileListCB, dir);
	}
} 

function browserFileListCB(text, dir) {
	try {
		resp = eval(text);
	}
	catch (e) {
		window.alert("Invalid response: " + text);
	}
	listCache[dir] = resp[1];
	updateFileList(resp[1], resp[0]);
}

function updateFileList(list, dir) {
	clearList("browser-files");
	clearList("browser-events");
	EVD.currentFileList = list;
	EVD.settings.lastDir = dir;
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

function stripOne(f) {
	var fs = f.split("/");
	fs.pop();
	return fs.join("/");
}

function selectFile(index) {
	if (EVD.selectedFileIndex) {
		$("#browser-file-" + EVD.selectedFileIndex).removeClass("selected");
	}
	if (EVD.selectedEventIndex) {
		$("#browser-event-" + EVD.selectedEventIndex).removeClass("selected");
	}
	var f = EVD.currentFileList[index];
	if (f.type == 1) {
		$("#selected-event").html("");
		$("#browser-load").addClass("disabled");
		EVD.selectedFileIndex = null;
		var dir;
		if (f.name == "..") {
			dir = stripOne(EVD.settings.lastDir);
		}
		else {
			dir = EVD.settings.lastDir + "/" + f.name;
		}
		EVD.settings.lastDir = dir;
		browserFileList(dir);
	}
	else {
		EVD.selectedFileIndex = index;
		browserEventList(EVD.settings.lastDir + "/" + f.name, index);
	}
}

function browserEventList(file, fileIndex) {
	browserRequest("events", file, browserEventListCB, fileIndex);
}

function browserEventListCB(text, fileIndex) {
	EVD.selectedFileIndex = fileIndex;
	$("#browser-file-" + fileIndex).addClass("selected");
	try {
		resp = eval(text);
	}
	catch (e) {
		window.alert("Invalid response: " + text);
	}
	updateEventsList(resp[1]);
}

function updateEventsList(list) {
	EVD.currentEventList = list;
	clearList("browser-events");
	var tbl = document.getElementById("browser-events");
	for (var i = 0; i < list.length; i++) {
		var e = list[i];
		var row = tbl.insertRow(tbl.rows.length);
		var cell = row.insertCell(0); 
		cell.innerHTML = '<a id="browser-event-' + i + '" class="event" onclick="selectEvent(\'' + i + '\');">' + e.name + '</a>';  
	}
	fleXenv.fleXcrollMain("browser-events-div");
}

function selectEvent(index) {
	var file = EVD.currentFileList[EVD.selectedFileIndex];
	if (EVD.selectedEventIndex) {
		$("#browser-event-" + EVD.selectedEventIndex).removeClass("selected");
	}
	$("#browser-event-" + index).addClass("selected");
	EVD.selectedEventIndex = index;
	var event = EVD.currentEventList[index];
	var ld = EVD.settings.lastDir;
	$("#selected-event").html(ld + "/" + file.name + ":" + event.name);
	$("#browser-load").removeClass("disabled");
}

function browserRequest(name, paramStr, callback, data) {
    var ro;
    if(navigator.appName == "Microsoft Internet Explorer") {
		ro = new ActiveXObject("Microsoft.XMLHTTP");
	}
	else {
		ro = new XMLHttpRequest();
	}
    function cb() {
    	if (ro.readyState == 4) {
    		if (ro.status == 200) {
    			callback(ro.responseText, data);
    		}
    		else {
	    		console.log("Update failed: ");
	    		console.log("    status: " + ro.status);
    	    	console.log("    statusText: " + ro.statusText);
    	    	console.log("    responseText: " + ro.responseText);
    	    	callback(ro.responseText, data, ro.statusText);
    		}
    	}
    }
    var url = "jsp/browser.jsp?op=" + name + "&param=" + paramStr;
    console.log("url: <a href=\"" + url + "\">" + url + "</a>");
    ro.open("get", url);
    ro.onreadystatechange = cb;
    ro.send(null);
    return ro;
}

function loadEvent() {
	if ($("#selected-event").html() == "") {
		return;
	}
	closeEventBrowser();
	
	var file = EVD.currentFileList[EVD.selectedFileIndex];
	var event = EVD.currentEventList[EVD.selectedEventIndex];
	var size = event.size;
	var path = EVD.settings.lastDir + "/" + file.name;
	var ro = startDownload(path + ":" + event.name, "Loading " + path + ":" + event.name + "...", EVD.eventDataLoaded);
	var progress = function() {
		if (ro.readyState == 1) {
			updateProgress(0.5, "Connection opened");
		}
		else if (ro.readyState == 2) {
			updateProgress(1.0, "Headers received");
		}
		else if (ro.readyState == 3) {
			var crt = ro.responseText.length;
			var p = crt / size * 89 + 1;
			updateProgress(p, "Receiving data: " + crt + "/" + size + " bytes");
		}
		else if (ro.readyState == 4) {
			return;
		}
		setTimeout(progress, 100);
	};
	setTimeout(progress, 100);
}

function startDownload(path, title, callback) {
	if (!callback) {
		throw "No callback supplied";
	}
	updateProgress(0, "Initializing");
	centerElement("load-progress-window");
	$("#load-progress-window-title").html(title);
	$("#load-progress-window").show();
	return browserRequest("get", path, loadEventCB, [path, callback]);
}

function loadEventCB(text, data, error) {
	var path = data[0];
	var callback = data[1];
	if (error) {
		window.alert("Error: " + error);
		$("#load-progress-window").hide();
		return;
	}
	updateProgress(91, "Parsing data");
	var nan = Number.NaN;
	try {
		var ed = JSON.parse(cleanupData(text));
		updateProgress(93, "Initializing objects");
		callback(ed);
		updateProgress(100, "Done");
	}
	catch (e) {
		log("<pre>" + e.stack + "</pre>");
		window.alert("Data loading failed: ", e.stack);
		$("#load-progress-window").hide();
		throw e;
	}
	$("#load-progress-window").hide();
	$("#title").html(path);
}

function updateProgress(p, text) {
	var frame = document.getElementById("event-load-progress-frame");
	width = 576;
	$("#event-load-progress-bar").css("width", Math.round(p / 100 * width) + "px");
	$("#event-load-progress-text").html(text);
}

function cleanupData(d) {
    // rm non-standard json bits
    // newer files will not have this problem
    d = d.replace(/\'/g, "\"")
	.replace(/nan/g, "0");
    return d;
}