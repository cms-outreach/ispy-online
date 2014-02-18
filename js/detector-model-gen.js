function makeDisc(ir, or, pos, slices) {
	var lines = [];
	var points = [];

	for (var i = 0; i < slices; i++) {
		var sa = Math.sin(i / slices * 2 * Math.PI);
		var ca = Math.cos(i / slices * 2 * Math.PI);
		
		points.push({x: ir * sa, y: ir * ca, z: pos});
		points.push({x: or * sa, y: or * ca, z: pos});
		
		var ix1 = i * 2;
		var ix2 = ((i + 1) % slices) * 2;
		
		lines.push({p1: ix1 + 0, p2: ix1 + 1});
		lines.push({p1: ix1 + 0, p2: ix2 + 0});
		lines.push({p1: ix1 + 1, p2: ix2 + 1});
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	
	return wf;
}

function makeCylinder(r, len, pos, slices, segments) {
	var lines = [];
	var points = [];
	for (var s = 0; s < segments; s++) {
		for (var i = 0; i < slices; i++) {
			var sa = Math.sin(i / slices * 2 * Math.PI);
			var ca = Math.cos(i / slices * 2 * Math.PI);
			var p = s/(segments - 1) * len + pos;
			points.push({x: r * sa, y: r * ca, z: p});
			
			var ix1 = (s * slices + i);
			var ix2 = (s * slices + ((i + 1) % slices));
			
			lines.push({p1: ix1, p2: ix2});
			
			if (s > 0) {
				var ix3 = ((s - 1) * slices + i);
				lines.push({p1: ix3 + 0, p2: ix1 + 0});
			}
		}
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	
	return wf;
}

function makeTube(ir, or, len, pos, slices, segments) {
	var lines = [];
	var points = [];
	for (var s = 0; s < segments; s++) {
		for (var i = 0; i < slices; i++) {
			var sa = Math.sin(i / slices * 2 * Math.PI);
			var ca = Math.cos(i / slices * 2 * Math.PI);
			var p = s/(segments - 1) * len + pos;
			points.push({x: ir * sa, y: ir * ca, z: p});
			points.push({x: or * sa, y: or * ca, z: p});
			
			var ix1 = (s * slices + i) * 2;
			var ix2 = (s * slices + ((i + 1) % slices)) * 2;
			
			lines.push({p1: ix1 + 0, p2: ix1 + 1});
			lines.push({p1: ix2 + 0, p2: ix2 + 1});
			lines.push({p1: ix1 + 0, p2: ix2 + 0});
			lines.push({p1: ix1 + 1, p2: ix2 + 1});
			
			if (s > 0) {
				var ix3 = ((s - 1) * slices + i) * 2;
				lines.push({p1: ix3 + 0, p2: ix1 + 0});
				lines.push({p1: ix3 + 1, p2: ix1 + 1});
			}
		}
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	
	return wf;
}

function makeRPCs(data, rd, descr) {
	var wf = makeWireframe(data, rd, descr);
	wf.push(makeDisc(7, 3, 9.7, 36));
	wf.push(makeDisc(7, 3, 7.9, 36));
	wf.push(makeDisc(7, 3, 7.2, 36));
	wf.push(makeDisc(7, 3, -9.7, 36));
	wf.push(makeDisc(7, 3, -7.9, 36));
	wf.push(makeDisc(7, 3, -7.2, 36));
	return wf;
}

function makeCSCs(data, rd, descr) {
	var s = 40;
	var w = [makeDisc(2.6, 1, 5.8, s), makeDisc(2.6, 1, 5.925, s),
	        makeDisc(2.6, 1, 6.050, s), makeDisc(2.6, 1, 6.175, s),
	        makeDisc(2.6, 1, -5.8, s), makeDisc(2.6, 1, -5.925, s),
	        makeDisc(2.6, 1, -6.050, s), makeDisc(2.6, 1, -6.175, s),
	        
	        makeDisc(4.7, 2.6, 6.8, s), makeDisc(4.7, 2.6, 6.9, s), makeDisc(4.7, 2.6, 7.05, s), makeDisc(4.7, 2.6, 7.15, s),
	        makeDisc(6.9, 5, 6.9, s), makeDisc(6.9, 5, 7.05, s),
	        
	        makeDisc(4.7, 2.6, -6.8, s), makeDisc(4.7, 2.6, -6.9, s), makeDisc(4.7, 2.6, -7.05, s), makeDisc(4.7, 2.6, -7.15, s),
	        makeDisc(6.9, 5, -6.9, s), makeDisc(6.9, 5, -7.05, s),
	        
	        ];
	for (var i = 0; i < 3; i++) {
		for (var j = 0; j < 3; j++) {
			w.push(makeDisc(6.9, 3.8, 8.1 + i + j * 0.2, s));
			w.push(makeDisc(1.5 + i * 0.1, 3.8, 8.1 + i + j * 0.2, s));
			w.push(makeDisc(6.9, 3.8, -(8.1 + i + j * 0.2), s));
			w.push(makeDisc(1.5 + i * 0.1, 3.8, -(8.1 + i + j * 0.2), s));
		}
	}
	return w;
}

function makeDriftTubes(data, rd, descr) {
	var lines = [];
	var points = [];
	for (var i = 0; i < 4; i++) {
		points.push(makePoint(data[0][i]));
		points.push(makePoint(data[1][i]));
	}
	lines.push({p1: 0, p2: 2});
	lines.push({p1: 2, p2: 4});
	lines.push({p1: 4, p2: 6});
	lines.push({p1: 6, p2: 0});
	
	lines.push({p1: 1, p2: 3});
	lines.push({p1: 3, p2: 5});
	lines.push({p1: 5, p2: 7});
	lines.push({p1: 7, p2: 1});
	
	lines.push({p1: 0, p2: 1});
	lines.push({p1: 2, p2: 3});
	lines.push({p1: 4, p2: 5});
	lines.push({p1: 6, p2: 7});
		
	var w = new Pre3d.Wireframe();
	w.points = points;
	w.lines = lines;
	return [w];
}

function makeModelHcalForward(data, rd, descr) {
	return [makeTube(0.15, 1.25, 1.7, 11.1, 24, 2), makeTube(0.15, 1.25, -1.7, -11.1, 24, 2)]; 
}

function makeModelHcalOuter(data, rd, descr) {
	return [makeTube(3.9, 4.1, 3, -1.5, 48, 8), makeCylinder(4.2, 2.5, 1.5, 24, 7),
	        makeCylinder(4.2, 3, 4.1, 24, 6), makeCylinder(4.2, -2.5, -1.5, 24, 7),
	        makeCylinder(4.2, -3, -4.1, 24, 6)];
}

function makeModelHcalEndcap(data, rd, descr) {
	var points = [];
	var lines = [];
	
	var or = 2.9;
	var ir = 0.4;
	
	var slices = 72;
	var len = 1.5;
	var pos = 4;
	
	var ori = pos / (pos + len) * or;
	var iro = (pos + len) / pos * ir;
	
	for (var i = 0; i < slices; i++) {
		var sa = Math.sin(i / slices * 2 * Math.PI);
		var ca = Math.cos(i / slices * 2 * Math.PI);
		
		points.push({x: ori * ca, y: ori * sa, z: pos});
		points.push({x: ir * ca, y: ir * sa, z: pos});
		points.push({x: or * ca, y: or * sa, z: pos + len});
		points.push({x: iro * ca, y: iro * sa, z: pos + len});
		
		points.push({x: ori * ca, y: ori * sa, z: -pos});
		points.push({x: ir * ca, y: ir * sa, z: -pos});
		points.push({x: or * ca, y: or * sa, z: -pos - len});
		points.push({x: iro * ca, y: iro * sa, z: -pos - len});
		
		var ix1 = i * 8;
		var ix2 = ((i + 1) % slices) * 8;
		
		//maybe this slice thing should be abstracted 
		//radial
		lines.push({p1: ix1 + 0, p2: ix1 + 1});
		lines.push({p1: ix1 + 2, p2: ix1 + 3});
		lines.push({p1: ix1 + 4, p2: ix1 + 5});
		lines.push({p1: ix1 + 6, p2: ix1 + 7});
		
		//tangential
		lines.push({p1: ix1 + 0, p2: ix2 + 0});
		lines.push({p1: ix1 + 1, p2: ix2 + 1});
		lines.push({p1: ix1 + 2, p2: ix2 + 2});
		lines.push({p1: ix1 + 3, p2: ix2 + 3});
		lines.push({p1: ix1 + 4, p2: ix2 + 4});
		lines.push({p1: ix1 + 5, p2: ix2 + 5});
		lines.push({p1: ix1 + 6, p2: ix2 + 6});
		lines.push({p1: ix1 + 7, p2: ix2 + 7});
		
		//well, still radial, but the other radius
		lines.push({p1: ix1 + 0, p2: ix1 + 2});
		lines.push({p1: ix1 + 4, p2: ix1 + 6});
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	return [wf];
}

function makeModelHcalBarrel(data, rd, descr) {
	var points = [];
	var lines = [];
	
	var or = 2.9;
	var ir = 1.8;
	var slices = 72;
	var len = 5;
	var lslices = 20;
	
	var maxa = Math.atan(len / or);
	
	for (var pos = 0; pos <= lslices; pos++) {
		var a = pos / lslices * maxa;
		var po = or * Math.tan(a);
		var pi = ir * Math.tan(a);
		
		for (var i = 0; i < slices; i++) {
			var sa = Math.sin(i / slices * 2 * Math.PI);
			var ca = Math.cos(i / slices * 2 * Math.PI);
			
			points.push({x: or * ca, y: or * sa, z: po});
			points.push({x: ir * ca, y: ir * sa, z: pi});

			points.push({x: or * ca, y: or * sa, z: -po});
			points.push({x: ir * ca, y: ir * sa, z: -pi});
			
			var ix1 = (pos * slices + i) * 4;
			var ix2 = (pos * slices + ((i + 1) % slices)) * 4;
			
			//tan
			lines.push({p1: ix1 + 0, p2: ix2 + 0});
			lines.push({p1: ix1 + 1, p2: ix2 + 1});
			if (pos > 0) {
				lines.push({p1: ix1 + 2, p2: ix2 + 2});
				lines.push({p1: ix1 + 3, p2: ix2 + 3});
			}
			
			//rad
			lines.push({p1: ix1 + 0, p2: ix1 + 1});
			if (pos > 0) {
				lines.push({p1: ix1 + 2, p2: ix1 + 3});
			}

			//axial
			if (pos < lslices) {
				var ix3 = ((pos + 1) * slices + i) * 4;
				lines.push({p1: ix1 + 0, p2: ix3 + 0});
				lines.push({p1: ix1 + 2, p2: ix3 + 2});
			}
		}
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	return [wf];
}

//function makeTube(ir, or, len, pos, slices, segments) {
function makeModelEcalEndcap(data, rd, descr) {
	return [makeTube(0.35, 1.5, 0.05, 3.2, 24, 2), makeTube(0.35, 1.5, -0.05, -3.2, 24, 2)];
}

function makeModelEcalPreshower(data, rd, descr) {
	return [makeDisc(0.4, 1.3, 3.025, 24), makeDisc(0.4, 1.3, 3.075, 24), 
	        makeDisc(0.4, 1.3, -3.025, 24), makeDisc(0.4, 1.3, -3.075, 24)]
}

function makeModelEcalBarrel(data, rd, descr) {
	var hr = data[0];
	var pos = data[1];
	var fr = data[2];
	var hpos = data[3];
	var slices = 24;
	
	var points = [];
	var lines = [];
	
	
	for (var a = 0; a < slices; a++) {
		var sa = Math.sin(a / slices * 2 * Math.PI);
		var ca = Math.cos(a / slices * 2 * Math.PI);
		
		for (var i = 0; i < pos.length; i++) {
			points.push({x: hr * ca, y: hr * sa, z: hpos[i]});
		}
		for (var i = 0; i < pos.length; i++) {
			points.push({x: fr[i] * ca, y: fr[i] * sa, z: pos[i]});
		}
		
		for (var i = 0; i < pos.length; i++) {
			var so1 = a * pos.length * 2;
			var so2 = ((a + 1) % slices) * pos.length * 2;
			var ix1 = i; 
			if (i < pos.length - 1) {
				lines.push({p1: so1 + ix1, p2: so1 + ix1 + 1});
			}
			lines.push({p1: so1 + ix1, p2: so2 + ix1});
			
			var so1 = a * pos.length * 2;
			var so2 = ((a + 1) % slices) * pos.length * 2;
			var ix1 = i + pos.length;
			if (i < pos.length - 1) {
				lines.push({p1: so1 + ix1, p2: so1 + ix1 + 1});
			}
			lines.push({p1: so1 + ix1, p2: so2 + ix1});
		}
	}
	
	var wf = new Pre3d.Wireframe();
	wf.points = points;
	wf.lines = lines;
	
	return [wf];
}

function makeModelTrackerBarrel(data, rd, descr) {
	var radii = [0.046, 0.07, 0.1, 
	             0.24, 0.27, 0.32, 0.37, 0.40, 0.43, 0.47, 0.51, 
	             0.62, 0.70, 0.78, 0.88, 0.97, 1.08];
	var lengths = [0.53, 0.53, 0.53, 
	               1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 1.3, 
	               2.18, 2.18, 2.18, 2.18, 2.18, 2.18];
	
	var slices = 24;
	var wfs = new Array();
	
	for (var i = 0; i < radii.length; i++) {
		var r = radii[i];
		var l = lengths[i];
		
		wfs.push(makeCylinder(r, l, -l / 2, slices, 2));
	}
	
	return wfs;

}

function makeModelTrackerEndcap(data, rd, descr) {
	var ecradii =    [0.145, 0.145, 0.50, 0.47, 0.50, 0.47, 0.50, 0.47,
	                  1.08, 1.06, 1.08, 1.06, 1.08, 1.06, 1.08, 1.06, 1.08, 1.06, 1.08, 1.06,
	                  1.08, 1.06, 1.08, 1.06, 1.08, 1.06];
	var ecintradii = [0.07,  0.07,  0.40, 0.25, 0.40, 0.25, 0.40, 0.25,
	                  0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30, 0.30,
	                  0.30, 0.30, 0.30, 0.30, 0.30, 0.30];
	var ecpos =      [0.35,  0.48,  0.76, 0.83, 0.89, 0.96, 1.02, 1.09,
	                  1.27, 1.34, 1.41, 1.48, 1.55, 1.62, 1.69, 1.76, 1.83, 1.90, 2.00, 2.08,
	                  2.20, 2.28, 2.40, 2.48, 2.60, 2.68];

	var slices = 24;
	var wfs = new Array();
	
	for (var i = 0; i < ecradii.length; i++) {
		var ecro = ecradii[i];
		var ecri = ecintradii[i];
		var ecp = ecpos[i];
		
		wfs.push(makeDisc(ecri, ecro, ecp, slices));
		wfs.push(makeDisc(ecri, ecro, -ecp, slices));	
	}
	return wfs;
}
