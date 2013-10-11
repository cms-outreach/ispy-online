document.defaultSettings = {
	invertColors: false,
	showFPS: false, 
	calorimeterTowers: true,
	calorimeterTowersLogScale: false,
	calorimeterTowersMaxLength: 1,
	calorimeterTowersWireSides: false,
	globalCaloEnergyCutEnabled: true,
	globalCaloEnergyLowCut: 0.25,
	ecalHitsMaxSize: 10,
	ecalHitsWireSides: false,
	hcalHitsMaxSize: 1,
	hcalHitsWireSides: false,
	lastDir: "",
	orthographicProjection: true,
    showCollectionCount: false
}

document.settings = {
};

function saveSettingsToCookie() {
	var cstr = "edsettings=";
	var first = true;
	for (var k in document.settings) {
		var value = document.settings[k];
		if (value == document.defaultSettings[k]) {
			// do not save setting if it's the default
			continue;
		}
		if (first) {
			first = false;
		}
		else {
			cstr += ",";
		}
		cstr += k + ":";
		if (typeof value == "boolean") {
			 cstr += value ? "true" : "false";
		}
		else {
			// would need escaping for general stuff
			cstr += value;
		}
	}
	var expires = new Date();
	expires.setDate(expires.getDate() + 3650);
	cstr += "; expires=" + expires.toUTCString();
	cstr += "; path=/";
	document.cookie = cstr;
}

function restoreSettingsFromCookie() {
	var cookies = document.cookie;
	var cv = cookies.split(";");
	//populate defaults first
	for (var k in document.defaultSettings) {
		document.settings[k] = document.defaultSettings[k];
	}
	for (var i = 0; i < cv.length; i++) {
		var kv = cv[i].split("=", 2);
		var cname = jQuery.trim(kv[0]);
		if (cname == "edsettings") {
			var sv = kv[1].split(",");
			for (var j = 0; j < sv.length; j++) {
				var kv2 = sv[j].split(":");
				var name = kv2[0];
				var value = kv2[1];
				if (document.settings[name] !== null) {
					if (typeof document.settings[name] == "boolean") {
						document.settings[name] = value == "true";
					}
					else if (typeof document.settings[name] == "number") {
						document.settings[name] = parseFloat(value);
					}
					else {
						document.settings[name] = value;
					}
				}
			}
		}
	}
	updateProjectionIcons();
}

function showSettings() {
	centerElement("settings");
	var settings = $("#settings");
	setCheckbox("setting-invert-colors", document.settings.invertColors);
	setCheckbox("setting-show-fps", document.settings.showFPS);
	setCheckbox("wireframe-sides", document.settings.calorimeterTowersWireSides);
	setRadio("calorimeter-display", document.settings.calorimeterTowers ? "towers" : "opacity");
	setCheckbox("setting-global-cut", document.settings.globalCaloEnergyCutEnabled);
	setInputEnabled("settings-global-low-cut-percentage", document.settings.globalCaloEnergyCutEnabled);
	$("#settings-global-low-cut-percentage").attr("value", Math.round((1 - document.settings.globalCaloEnergyLowCut) * 100));
	settings.show();
}

function saveAndHideSettings() {
	saveSettingsToCookie();
	$("#settings").hide();
	$("#speed-test-window").hide();
}

function toggleFPS() {
	document.settings.showFPS = !document.settings.showFPS;
	document.draw();
}

function toggleTowersWireframe() {
	document.settings.calorimeterTowersWireSides = !document.settings.calorimeterTowersWireSides;
}

function toggleGlobalCut() {
	document.settings.globalCaloEnergyCutEnabled = !document.settings.globalCaloEnergyCutEnabled;
	setInputEnabled("settings-global-low-cut-percentage", document.settings.globalCaloEnergyCutEnabled);
	document.draw();
}

function setTowers(val) {
	document.settings.calorimeterTowers = val;
	document.draw();
}

function setPerspectiveProjection(val) {
	document.settings.orthographicProjection = !val;
	saveSettingsToCookie();
	updateProjectionIcons();
	document.draw();
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
