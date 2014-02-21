EVD.defaultSettings = {
	invertColors: false,
	lastDir: "",
	orthographicProjection: true,
    showCollectionCount: false
}

EVD.settings = {};

function showSettings() {
	centerElement("settings");
	var settings = $("#settings");
	setCheckbox("setting-invert-colors", EVD.settings.invertColors);
	settings.show();
}

function hideSettings() {
	$("#settings").hide();
}

function updateProjectionIcons() {
	if (document.settings.orthographicProjection) {
		$("#perspective-view").removeClass("selected");
		$("#orthographic-view").addClass("selected");
	}
	else {
		$("#perspective-view").addClass("selected");
		$("#orthographic-view").removeClass("selected");
	}
}
