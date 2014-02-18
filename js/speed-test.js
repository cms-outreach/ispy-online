function showSpeedTest() {
	var stw = document.getElementById("speed-test-window");
	stw.state = { step: 0 };
	centerElement("speed-test-window");
	stw.style.display = "block";
}

function closeSpeedTest() {
	var stw = document.getElementById("speed-test-window");
	stw.state.step = 41;
	stw.style.display = "none";
}

var testParams = {
	camera: { focal_length: 1 },
	scale_: 150,
	xoff_: 100,
}

function projectPoint(p) {
	var z = p.z;
	if (z > 0) {
		return null;
	}
	return {x: p.x / z, y: p.y / z};
}

function startTest() {
	var refVT = 2330249;
	var refFR = 653;
	var stw = document.getElementById("speed-test-window");
	var state = stw.state;
	incStep = function() {
		state.step++;
		$("#speed-progress-bar").css("width", (state.step * 358 / 40) + "px");
		$("#speed-progress-number").html(Math.round(state.step * 100 / 40) + "%");
		if (state.step >= 40) {
			return;
		}
		setTimeout(incStep, 1000);
	};
	setTimeout(incStep, 1000);
	
	var vertexTransformations = 0;
	var fillRate = 0;
	var canvas = document.getElementById("test-canvas");
	var ctx = canvas.getContext("2d");
	var f1 = function() {
		if (!state.t0) {
			state.t0 = new Date().getTime();
		}
		if (state.step < 20) {
			var t = new Pre3d.Transform();
			t.rotateAroundAxis({x: 1, y: 1, z: 2}, 0.2);
			for (var i = 0; i < 200000; i++) {
				var p = {x: i, y: i + 1, z: i + 2};
				var pp = t.transformPoint(p);
				var ppp = projectPoint(pp);
				vertexTransformations++;
			}
			setTimeout(f1, 0);
		}
		else {
			state.t1 = new Date().getTime();
			var vt = Math.round(vertexTransformations / (state.t1 - state.t0) * 1000);
			$("#vtl").html("Vertex transformations:");
			$("#vtv").html(vt + " V/s (" + (Math.round(vt/refVT * 100) / 100) + ")");
			setTimeout(f2, 0);
		}
	};
	
	var f2 = function() {
		if (state.step < 40) {
			ctx.fillStyle = "rgba(0, 0, 0, 1)";
			ctx.fillRect(0, 0, 320, 200);
			fillRate += 320 * 200 / 1000;
			ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
			
			for (var i = 0; i < 20; i++) {
				ctx.moveTo(i, i);
				ctx.lineTo(i, i + 100);
				ctx.lineTo(i + 100, i + 100);
				ctx.lineTo(i, i);
				ctx.fill();
				fillRate += 5; 
			}
			setTimeout(f2, 0);
		}
		else {
			state.t2 = new Date().getTime();
			var fr = Math.round(fillRate / (state.t2 - state.t1) * 1000);
			$("#frl").html("Canvas fill rate:");
			$("#frv").html(fr + " Mpixels/s (" + (Math.round(fr / refFR * 100) / 100) + ")");
		}
	};

	setTimeout(f1, 100);
}
