function centerElement(id) {
	var el = $("#" + id);
	el.css("left", ((window.innerWidth - el.width()) / 2) + "px");
	el.css("top", ((window.innerHeight - el.height()) / 2) + "px");
}

function setCheckbox(id, value) {
	setBooleanAttr(id, "checked", value);
}

function setInputEnabled(id, value) {
	setBooleanAttr(id, "disabled", !value);
}

function setBooleanAttr(id, attrName, value) {
	if (value) {
		$("#" + id).attr(attrName, true);
	}
	else {
		$("#" + id).removeAttr(attrName);
	}
}

function setRadio(id, value) {
	$("input[name=" + id + "]:radio").each(function() {
		if ($(this).attr("value") == value) {
			$(this).attr("checked", true);
		}
		else {
			$(this).removeAttr("checked");
		}	
	});
}

function clamp(v, min, max) {
	if (v < min) {
		return min;
	}
	else if (v > max) {
		return max;
	}
	else {
		return v;
	}
}
