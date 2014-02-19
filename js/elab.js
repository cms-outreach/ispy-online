function populateInputs() {
	var inputs = document.getElementsByTagName("input");
	for (var i = 0; i < inputs.length; i++) {
		if (inputs[i].type == "text" && inputs[i].getAttribute("placeholder") != null) {
			inputs[i].style.color = "gray";
			inputs[i].value = inputs[i].getAttribute("placeholder");
		}
	}
}

function aLs(layerID) {
	return document.getElementById(layerID).style;
}

function HideShow(ID) {
	if ((aLs(ID).visibility == "hidden")) {
		aLs(ID).visibility = "visible";
		aLs(ID).display = "";
	}
	else if (aLs(ID).visibility == "visible") {
		aLs(ID).visibility = "hidden";
		aLs(ID).display = "none";
	}
}

function vSwitchShow(id) {
	show(id + "-h");
	hide(id + "-v");
}

function vSwitchHide(id) {
	show(id + "-v");
	hide(id + "-h");
}

function hide(id) {
	aLs(id).visibility = "hidden";
	aLs(id).display = "none";
}

function show(id) {
	aLs(id).visibility = "visible";
	aLs(id).display = "";
}

function selectAll(start, finish, direction) {
	for (var i = start; i < finish; i++) {
		fldObj = document.getElementById("cb" + i);
		if (fldObj.type == 'checkbox') {
			fldObj.checked = direction; 
		}
	}
}
    
function reference(name, W, H) {
	if (!H) {
		H = 250;
	}
	while (name.indexOf(" ") > 0) {
		name = name.replace(" ", "_");
	}
	var url="../references/display.jsp?name=" + name + "&type=reference";
	var winPref = "width=400,height=" + H + ",scrollbars=yes,toolbar=no,menubar=no,status=no,resizable=yes,title=yes";
	window.open(url, "_blank", winPref);
}

function glossary(name, H) {
	if (!H) {
		H = 250;
	}
	while (name.indexOf(" ") > 0) {
		name = name.replace(" ", "_");
	}
	var url = "../references/display.jsp?name=" + name + "&type=glossary";
    var winPref = "width=300,height=" + H + ",scrollbars=no,toolbar=no,menubar=no,status=no,resizable=yes,title=yes";
	window.open(url, "_blank", winPref);
}

function describe(tr, arg, label) {
	var url="../jsp/dispDescription.jsp?tr=" + tr + "&arg=" + arg + "&label=" + label;
    var winPref = "width=250,height=250,scrollbars=no,toolbar=no,menubar=no,status=no,resizable=yes,title=yes";
	window.open(url, "_blank", winPref);
}


function showRefLink(url, W, H) {
	var height=500;
	var width=500;
	if (!H) {
		H = 500;
	}
	if (!W) {
		W = 500;
	}
	winPref = "width=" + W + ",height=" + H + ",scrollbars=yes,toolbar=yes,menubar=no,status=yes,resizable=yes";
	window.open(url, "_blank", winPref);
}

//http://www.experts-exchange.com/Web/Web_Languages/JavaScript/Q_21265898.html
function toggle(t_show, t_hide, s_show, s_hide){
	if (document.getElementById(t_show).innerHTML == s_show) {
		document.getElementById(t_show).innerHTML = s_hide;
		document.getElementById(t_hide).style.display = "";
	}
	else if (document.getElementById(t_show).innerHTML == s_hide) {
		document.getElementById(t_show).innerHTML = s_show;
		document.getElementById(t_hide).style.display = "none";
	}
	else {
		document.getElementById(t_hide).style.display = "none";
	}
}

function registerLabelForUpdate(name, label, dest) {
	if (!this.labelsToUpdate) {
		this.labelsToUpdate = [];
	}
	this.labelsToUpdate[name] = [label, dest];
}

function updateLabels(source, name) {
	if (this.labelsToUpdate != null && this.labelsToUpdate[name] != null) {
		var p = this.labelsToUpdate[name];
		if (p) {
			var label = p[0];
			var dest = p[1];
			var destInput = document.getElementById(dest);
			var text = destInput.value;
			var index = text.indexOf(label);
			if (index != -1) {
				index += label.length;
				var nl = text.indexOf('\n', index);
				if (nl == -1) {
					nl = text.length;
				}
				text = text.substring(0, index) + source.value + text.substring(nl);
				destInput.value = text; 
			}
		}
	}
}

function firstNonTextChild(obj) {
	if (obj == null) {
		printStackTrace();
	}
    for (var i = 0; i < obj.childNodes.length; i++) {
        if (obj.childNodes[i].nodeName != "#text") {
	        return obj.childNodes[i];
        }
    }
    return null;
}

function getAncestor(obj, level) {
    if (level == 0) {
        return obj;
    }
    else {
        return getAncestor(obj.parentNode, level - 1);
    }
}

function log(text) {
    var l = document.getElementById("log");
    if (l) {
    	l.innerHTML = l.innerHTML + "<br />\n" + new Date().toGMTString() + " " + text;
    	l.scrollTop = l.scrollHeight;
    }
}

function initlog(defaultOn) {
	document.write(
		'<a onclick="toggleLog();" style="position: fixed; bottom: 4px; right: 20px; z-index: 1;"><img id="logtoggle" src="graphics/plus.png" alt="Show Log" /></a>' +
		'<div id="log" style="display: none; z-index: 0; height: 100px;">' + 
		'</div>');
	if (defaultOn) {
		toggleLog();
	}
}

function toggleLog() {
	var l = document.getElementById("log");
	var lt = document.getElementById("logtoggle");
	if (l.style.display == "none") {
		l.style.display = "block";
		lt.alt = "Hide Log";
		lt.src = "graphics/minus.png"; 
	}
	else {
		l.style.display = "none";
		lt.alt = "Show Log";
		lt.src = "graphics/plus.png";
	}
}

function printStackTrace() {
	try {
		kaboom();
	} 
	catch (e) {
		log("<pre>" + e.stack + "</pre>");
	}
}

function getStackTrace(e) {
	var s = "";
	if (e.stack) {
		var lines = e.stack.split('\n');
		for (var i = 0, len = lines.length; i < len; i++) {
			s += lines[i] + "\n";
		}
	}
	return s;
}

function spinnerOn(selector) {
	$(selector).each(function(i, e) {
		$(this).css("position", "relative");
		var imgHeight = 20;
		var imgWidth = 20;
		var myHeight = $(this).height();
		var myWidth = $(this).width();
		var top;
		var left;
		var img;
		if (myHeight == 0) {
			top = "50%";
			left = "50%";
		}
		else {
			top = (myHeight - imgHeight) / 2 + "px";
			left = (myWidth - imgWidth) / 2 + "px";
		}
		if (myHeight > 48 || myHeight == 0) {
			img = "spinner-large.gif";
		}
		else {
			img = "spinner-small.gif";
		}
		$(this).append('<div class="spinner-background" style="position: absolute; width: 100%; height: 100%; left: 0px; top: 0px; "></div>');
		$(this).append('<img class="spinner-image" style="position: absolute; left: ' + left + '; top: ' + top + ';" src="graphics/' + img + '" />');
	});
}

function spinnerOff(selector) {
	$(selector + " .spinner-background").remove();
	$(selector + " .spinner-image").remove();
}

function isArray(testObject) {   
    return testObject && !(testObject.propertyIsEnumerable('length')) && typeof testObject === 'object' && typeof testObject.length === 'number';
}

function pp(obj) {
	if (isArray(obj)) {
		s = "[";
		for (var i in obj) {
			s += i + ": " + pp(obj[i]) + ", "; 
		}
		s += "]";
		return s;
	}
	else if (obj == null) {
		return null;
	}
	else {
		return obj.toString();
	}
}

function centerElement(id) {
	var el = $("#" + id);
	el.css("left", ((window.innerWidth - el.width()) / 2) + "px");
	el.css("top", ((window.innerHeight - el.height()) / 2) + "px");
}

function openPopup(event, id) {
	if (event == "center") {
		centerElement(id);
		$("#" + id).show();
	}
	else {
		$("#" + id).css("right", "10px");
		$("#" + id).css("top", (event.clientY + 10) + "px");
		$("#" + id).show();
	}
}

function closePopup(id) {
	$("#" + id).hide();
}