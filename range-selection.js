function showRange(event, key) {
	var rd = d_descr[key].rd;
	var canvas = document.getElementById("range-selector-canvas");
	var ctx = canvas.getContext("2d");
	ctx.width = canvas.width;
	ctx.height = canvas.height;
	ctx.left = event.clientX + canvas.offsetLeft;
	ctx.top = event.clientY + canvas.offsetTop;
	drawRange(key, ctx, rd);
	var rs = $("#range-selector");
	rs.css("left", event.clientX + "px");
	rs.css("top", event.clientY + "px");
	setupMouse(key, canvas, ctx, rd);
	$("#cut-title").html("Energy range for " + d_descr[key].desc);
	document.redrawRange = function() {
		drawRange(key, ctx, rd);
	};
	rs.show();
}

function drawRange(key, ctx, rd) {
	drawAxes(ctx);
	drawHistogram(ctx, rd);
	drawThresholds(ctx, rd);
}

function setupMouse(key, canvas, ctx, rd) {
	var dragInfo = {
		xstart: null,
		xend: null,
		buttonPressed: false,
	};
	canvas.onmousemove = function(event) {
		if (!dragInfo.buttonPressed) {
			return;
		}
		dragInfo.xend = event.clientX;
		setCut(key, ctx, rd, dragInfo.xstart, dragInfo.xend);
	};
	canvas.onmousedown = function(event) {
		if (event.button != 0) {
			return;
		}
		var handle = getClickedHandle(ctx, rd, event.clientX, event.clientY);
		if (handle == -1) {
			return;
		}
		dragInfo.buttonPressed = true;
		dragInfo.xstart = event.clientX;
		dragInfo.xend = event.clientX;
		dragInfo.handle = handle;
		if (handle == 1) {//lower handle
			dragInfo.xstart = cutToClient(ctx, rd, rd.highCut);
		}
		else if (handle == 2) {
			dragInfo.xstart = cutToClient(ctx, rd, rd.lowCut);
		}
		setCut(key, ctx, rd, dragInfo.xstart, dragInfo.xend);
	};
	canvas.onmouseup = function(event) {
		if (!dragInfo.buttonPressed) {
			return;
		}
		dragInfo.buttonPressed = false;
		
		dragInfo.xend = event.clientX;
		setCut(key, ctx, rd, dragInfo.xstart, dragInfo.xend);
	};
	canvas.onmouseout = function(event) {
		var wasPressed = dragInfo.buttonPressed;
		dragInfo.buttonPressed = false;
		if (wasPressed) {
			dragInfo.xend = event.clientX;
			setCut(key, ctx, rd, dragInfo.xstart, dragInfo.xend);
		}
	}
}

function setCut(key, ctx, rd, xs, xe) {
	ctx.fillStyle = "rgba(0, 0, 0, 1)";
	var cxs = clientToCut(ctx, rd, xs);
	var cxe = clientToCut(ctx, rd, xe);
	rd.lowCut = clamp(Math.min(cxs, cxe), 0, 1);
	rd.highCut = clamp(Math.max(cxs, cxe), 0, 1);
	rd.dirty = true;
	//log("range: " + rd.range + ", lowCut: " + rd.lowCut + ", highCut: " + rd.highCut + ", xs: " + xs + ", xe: " + xe);
	drawRange(key, ctx, rd);
	document.draw();
}

function getBackground() {
	if (document.settings.invertColors) {
		return "rgba(255, 255, 255, 1)";
	}
	else {
		return "rgba(0, 0, 0, 1)";
	}
}

function getForeground() {
	if (!document.settings.invertColors) {
		return "rgba(255, 255, 255, 1)";
	}
	else {
		return "rgba(0, 0, 0, 1)";
	}
}



function drawAxes(ctx) {
	ctx.strokeStyle = getForeground();
	ctx.fillStyle = getBackground();
	ctx.fillRect(0, 0, ctx.width - 1, ctx.height - 1);
	ctx.beginPath();
	ctx.moveTo(5, 5);
	ctx.lineWidth = 1.0;
	ctx.lineTo(5, ctx.height - 20);
	ctx.lineTo(ctx.width - 5, ctx.height - 20);
	ctx.stroke();
}

function clientToCut(ctx, rd, x) {
	return (x - ctx.left - 15) / (ctx.width - 20) * 2;
}

function cutToClient(ctx, rd, cut) {
	return cut * (ctx.width - 20) / 2 + ctx.left + 15;
}

function getClickedHandle(ctx, rd, x, y) {
	var bottom = parseInt(ctx.top) + parseInt(ctx.height) - 55;
	if (y > bottom) {
		var cxl = cutToClient(ctx, rd, rd.lowCut);
		var cxh = cutToClient(ctx, rd, rd.highCut);
		if (x <= cxl && x >= cxl - 10) {
			return 1;
		}
		if (x >= cxh && x <= cxh + 10) {
			return 2;
		}
		return -1;
	}
	return 0;	
}

function drawHistogram(ctx, rd) {
	var h = [];
	var scale = (ctx.width - 20) / rd.range;
	var max = 1;
	for (var i = 0; i < rd.sorted.length; i++) {
		var v = Math.round(rd.sorted[i] * scale);
		while (h.length <= v) {
			h.push(0);
		}
		h[v] = h[v] + 1;
		if (h[v] > max) {
			max = h[v];
		}
	}
	max = Math.log(max + 1);
	var scaley = (ctx.height - 30) / max;
	for (var i = 0; i < h.length; i++) {
		ctx.moveTo(5 + i, ctx.height - 20);
		ctx.lineTo(5 + i, ctx.height - 20 - Math.log(h[i] + 1) * scaley);
	}
	ctx.stroke();
}


function drawThresholds(ctx, rd) {
	var lowCut = document.settings.globalCaloEnergyLowCut;
	if (!document.settings.globalCaloEnergyCutEnabled) {
		lowCut = 0;
	}
	if (rd.lowCut !== null) {
		lowCut = rd.lowCut;
	}
	var highCut = 1.0;
	if (rd.highCut !== null) {
		highCut = rd.highCut;
	}
	var scale = (ctx.width - 20);
	var sx = 5 + lowCut * scale;
	var ex = 5 + highCut * scale;
	var y = ctx.height - 20;
	ctx.fillStyle = "rgba(255, 255, 0, 0.3)";
	ctx.fillRect(sx, 10, ex - sx + 2, y - 10);
	ctx.fillStyle = getForeground();
	ctx.beginPath();
	ctx.moveTo(sx, y);
	ctx.lineTo(sx, y + 14);
	ctx.lineTo(sx - 14, y + 14);
	ctx.lineTo(sx, y);
	ctx.closePath();
	ctx.fill();
	ctx.beginPath();
	ctx.moveTo(ex, y);
	ctx.lineTo(ex, y + 14);
	ctx.lineTo(ex + 14, y + 14);
	ctx.lineTo(ex, y);
	ctx.closePath();
	ctx.fill();
	
	$("#low-cut").text(getCutString(lowCut, rd.range));
	$("#high-cut").text(getCutString(highCut, rd.range));
}

function getCutString(percent, range) {
	return (Math.round(percent * range * 100) / 100) + " GeV" + " (" + Math.round(percent * 100) + "%)";
}

function closeRangeSelector() {
	$("#range-selector").hide();
}
