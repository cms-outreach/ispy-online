function makePoint(array) {
	return {x: array[0], y: array[1], z: array[2]};
}

function makePoint2(x, y, z) {
	return {x: x, y: y, z: z};
}

function addPoints(p1, p2) {
	return {x: p1.x + p2.x, y: p1.y + p2.y, z: p1.z + p2.z};
}

function subPoints(p1, p2) {
	return {x: p1.x - p2.x, y: p1.y - p2.y, z: p1.z - p2.z};
}

function add(a1, a2) {
	return [a1[0] + a2[0], a1[1] + a2[1], a1[2] + a2[2]];
}

function makeColor(base, opacity) {
	return new Pre3d.RGBA(base[0], base[1], base[2], base[3] * opacity);
}

function distance(p1, p2) {
	var dx = p1.x - p2.x;
	var dy = p1.y - p2.y;
	var dz = p1.z - p2.z;
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function pointToStr(p) {
	if (p === null) {
		return "null";
	}
	return "x: " + p.x + ", y: " + p.y + ", z: " + p.z;
}

function affineToStr(m) {
	  return "[[" + m.e0 + ", " + m.e1 + ", " + m.e2  + ", " + m.e3  + "], " + 
	  		  "[" + m.e4 + ", " + m.e5 + ", " + m.e6  + ", " + m.e7  + "], " + 
	  		  "[" + m.e8 + ", " + m.e9 + ", " + m.e10 + ", " + m.e11 + "]]";
}

function makeScaledArrow(x1, y1, z1, x2, y2, z2, slices) {
  //tpm  In the pre3d makeSolidArrow method the length of the 
  // arrow is hard-coded (despite what one gives as arguments).
  // Therefore for now clone that method here with modifications.

  var s = new Pre3d.Shape();
  //just make an arrow in the X direction and then scale and rotate
	  
  var dx = x2 - x1;
  var dy = y2 - y1;
  var dz = z2 - z1;
  
  //tpm Scaling doesn't seem to work in pre3d makeSolidArrow method 
  // No doubt that's why the length is hard-coded.
  // Therefore here make the default 1.0 and add log10
  // of the scale (therefore if it's a unit vector the arrow is 1.0;
  // also it keeps the length from getting too long)
  var scale = Math.sqrt(dx*dx+dy*dy+dz*dz);

  var v = [];
  var stemRadius = 0.03;
  var stemLength = 0.1*scale;
  var headRadius = 0.15;
  var headLength = 0.25;
  //origin
  v.push({x: 0, y: 0, z: 0});
  //stem
  for (var i = 0; i < slices; i++) {
    var angle = 2 * Math.PI / slices;
    v.push({x: 0, y: stemRadius * Math.sin(i * angle), z: stemRadius * Math.cos(i * angle)});
  }
  //stem - other side
  for (var i = 0; i < slices; i++) {
    var angle = 2 * Math.PI / slices;
    v.push({x: stemLength, y: stemRadius * Math.sin(i * angle), z: stemRadius * Math.cos(i * angle)});
  }
  // head - base
  for (var i = 0; i < slices; i++) {
    var angle = 2 * Math.PI / slices;
    v.push({x: stemLength, y: headRadius * Math.sin(i * angle), z: headRadius * Math.cos(i * angle)});
  }
  // tip
  v.push({x: stemLength + headLength, y: 0, z: 0});
  
  //scale and rotate vertices
  var t = new Pre3d.Transform();
  //tpm this scale doesn't seem to work
  //t.scale(10.0);
	           
  //tpm By definition MET does not have a component in
  // Z so we only care about phi. Of course, this isn't true 
  // for other objects that may use this method so
  // caveat emptor!
  var phi = Math.atan2(dy, dx);	 
  t.rotateZ(phi);

  s.vertices = [];
  for (var i = 0; i < v.length; i++) {
    s.vertices.push(t.transformPoint(v[i]));
  }
	  
  var q = [];
  //stem base
  for (var i = 0; i < slices; i++) {
    q.push(new Pre3d.QuadFace(0, i + 1, ((i + 1) % slices) + 1, null));
  }
  //stem side
  for (var i = 0; i < slices; i++) {
    var ip1 = (i + 1) % slices;
    q.push(new Pre3d.QuadFace(i + slices + 1, ip1 + slices + 1, ip1 + 1, i + 1));
  }
  //head base
  for (var i = 0; i < slices; i++) {
    var ip1 = (i + 1) % slices;
    q.push(new Pre3d.QuadFace(i + 2 * slices + 1, ip1 + 2 * slices + 1, ip1 + slices + 1, i + slices + 1));
  }
  //head side
  var last = 1 + slices * 3;
  for (var i = 0; i < slices; i++) {
    var ip1 = (i + 1) % slices;
    q.push(new Pre3d.QuadFace(last, ip1 + 2 * slices + 1, i + 2 * slices + 1, null));
  }
  s.quads = q;
	  
  Pre3d.ShapeUtils.rebuildMeta(s);
  return s;
}

function makeMET(data) {    
    //"METs_V1": [["phi", "double"],["pt", "double"],["px", "double"],["py", "double"],["pz", "double"]]
    var pt = data[1];
    var px = data[2];
    var py = data[3];

    var arrow = makeScaledArrow(0, 0, 0, px, py, 0, 10);
    arrow.fillColor = new Pre3d.RGBA(1, 1, 0, 1);
    Pre3d.ShapeUtils.rebuildMeta(arrow);
    return arrow;
}

function makeTrack(data) {
	log("makeTrack(" + data + ")");
	return {p1: makePoint(data[0]), p2: makePoint(add(data[0], data[1]))};
}

function makeHit(data) {
	return makePoint(data[0]);
}

function makeSiStripDigis(data) {
	return makePoint(data[1]);
}

function makeCSCWD(data) {
	//[pos:p3d, len:num, ...]
	var crds = data[0];
	//this looks like a "line" tangent to a circle on the detector axis
	var x = crds[0];
	var y = crds[1];
	var z = crds[2];
	var l = data[1];
	var da = Math.sqrt(x * x + y * y);
	var sc = l / da / 2;
	var dx = x * sc;
	var dy = y * sc;
	 
	return {p1: makePoint2(x - dy, y + dx, z), p2: makePoint2(x + dy, y - dx, z)};
}

function makeCSCSD(data) {
	//[pos:p3d, len:num, ...]
	var crds = data[0];
	//radial to detector axis
	var x = crds[0];
	var y = crds[1];
	var z = crds[2];
	var l = data[1];
	var da = Math.sqrt(x * x + y * y);
	var sc = l / da / 2;
	var dx = x * sc;
	var dy = y * sc;
	 
	return {p1: makePoint2(x - dx, y - dy, z), p2: makePoint2(x + dx, y + dy, z)};
}

function makeCSCSegments(data) {
	return {p1: makePoint(data[1]), p2: makePoint(data[2])};
}

function makeQuad(f1, f2, f3, f4, b1, b2, b3, b4, fill, stroke) {
	var s = new Pre3d.Shape();
    s.vertices = [
      f1, f2, f3, f4, b1, b2, b3, b4
    ];

    //    4 -- 0
    //   /|   /|     +y
    //  5 -- 1 |      |__ +x
    //  | 7 -|-3     /
    //  |/   |/    +z
    //  6 -- 2

    s.quads = [
      new Pre3d.QuadFace(0, 1, 2, 3),  // Front
      new Pre3d.QuadFace(4, 5, 6, 7),  // Back
    ];
    if (document.settings.calorimeterTowersWireSides) {
    	// much faster to draw lines instead of the 4 faces
    	s.lines = [{v1: 0, v2: 4}, {v1: 1, v2: 5}, {v1: 2, v2: 6}, {v1: 3, v2: 7}];
    }
    else {
	    s.quads.push(new Pre3d.QuadFace(0, 1, 5, 4));
	    s.quads.push(new Pre3d.QuadFace(2, 3, 7, 6));
	    s.quads.push(new Pre3d.QuadFace(1, 2, 6, 5));
	    s.quads.push(new Pre3d.QuadFace(0, 4, 7, 3));
    }
    
    s.fillColor = fill;
    s.strokeColor = stroke;

    Pre3d.ShapeUtils.rebuildMeta(s);
    return s;
}

function makeChambers(data) {

  // ["detid", "int"],
  // ["front_1", "v3d"],["front_2", "v3d"],["front_3", "v3d"],["front_4", "v3d"],
  // ["back_1", "v3d"],["back_2", "v3d"],["back_3", "v3d"],["back_4", "v3d"]

  //    5 -- 4
  //   /|   /|     
  //  1 -- 0 |      
  //  | 6 -|-7     
  //  |/   |/    
  //  2 -- 3

  // add +1 to indices since points dont' start from 0

  return [
    {p1: makePoint(data[2]), p2: makePoint(data[3])}, 
    {p1: makePoint(data[1]), p2: makePoint(data[4])}, 
    {p1: makePoint(data[6]), p2: makePoint(data[7])},
    {p1: makePoint(data[5]), p2: makePoint(data[8])},
          
    {p1: makePoint(data[2]), p2: makePoint(data[6])}, 
    {p1: makePoint(data[1]), p2: makePoint(data[5])}, 
    {p1: makePoint(data[3]), p2: makePoint(data[7])},
    {p1: makePoint(data[4]), p2: makePoint(data[8])},

    {p1: makePoint(data[1]), p2: makePoint(data[2])}, 
    {p1: makePoint(data[3]), p2: makePoint(data[4])}, 
    {p1: makePoint(data[5]), p2: makePoint(data[6])},
    {p1: makePoint(data[7]), p2: makePoint(data[8])}
  ];
}

function makeTowers(data, rd, descr, front, back, energy) {
  var settings = document.settings;
  
  if (settings.calorimeterTowers) {
    if (!energy) {
      energy = getRankValue(data, rd);
    }
    if (energy < 0) {
      return null; // Java and Javascript should have a WTF constant, with a different meaning than NaN.
    }
		
    var len;
    if (settings.calorimeterTowersLogScale) {
      len = Math.log(energy) * settings.calorimeterTowersLogFactor;
    }
    else {
    	if ( descr.group === "ECAL" ) {
    		len = energy / rd.range * document.settings.ecalHitsMaxSize;
    	} else if ( descr.group === "HCAL" ) {
    		len = energy / rd.range * document.settings.hcalHitsMaxSize; 
    	} else {
	      len = energy / rd.range * document.settings.calorimeterTowersMaxLength;
	  	}
    }
		
    var superFront = new Array();
    
    for (var i = 0; i < 4; i++) {
      superFront.push(Pre3d.Math.linearInterpolatePoints3d(front[i], back[i], len));
    }
    
    back = superFront;
    
    var a; 

    if ( descr.group === "ECAL" ) {
    	a = settings.ecalHitsWireSides ? 1.0 : 0.3;
    } else if ( descr.group === "HCAL" ) {
    	a = settings.hcalHitsWireSides ? 1.0 : 0.3;
    } else { 
    	a = settings.calorimeterTowersWireSides ? 1.0 : 0.3;
	}    

    var shape = makeQuad(front[0], front[1], front[2], front[3],
      back[0], back[1], back[2], back[3], 
      makeColor(descr.fill, a),
      makeColor(descr.color, a));
    shape.drawOverdraw = true;
    return shape;
	}
  else {
    return makeQuad(front[0], front[1], front[2], front[3],
		    back[0], back[1], back[2], back[3], 
		    makeColor(descr.fill, getRankValue(data, rd) * 0.8 + 0.2),
		    makeColor(descr.color, getRankValue(data, rd) * 0.8 + 0.2));
  }
}

function makeRecHits(data, rd, descr, cindex) {
  /*
    in V2 ["time", "double"] is added before detid.
          ["energy", "double"],["eta", "double"],["phi", "double"],["detid", "int"],
          ["front_1", "v3d"],["front_2", "v3d"],["front_3", "v3d"],["front_4", "v3d"],["back_1", "v3d"],["back_2", "v3d"],["back_3", "v3d"],["back_4", "v3d"]
  */

  var front = new Array();
  var back = new Array();
  
  front.push(makePoint(data[cindex + 0]));
  front.push(makePoint(data[cindex + 1]));
  front.push(makePoint(data[cindex + 2]));
  front.push(makePoint(data[cindex + 3]));
  back.push(makePoint(data[cindex + 4]));
  back.push(makePoint(data[cindex + 5]));
  back.push(makePoint(data[cindex + 6]));
  back.push(makePoint(data[cindex + 7]));

  return makeTowers(data, rd, descr, front, back, data[0]);
}

function makeRecHits_V1(data, rd, descr) {
	return makeRecHits(data, rd, descr, 4);
}

function makeRecHits_V2(data, rd, descr) {
	return makeRecHits(data, rd, descr, 5);
}

var cnt = 0;
function makeDetectorPiece(data, rd, descr) {
	//["detid", "int"],
	//["front_1", "v3d"],["front_2", "v3d"],["front_3", "v3d"],["front_4", "v3d"],["back_1", "v3d"],["back_2", "v3d"],["back_3", "v3d"],["back_4", "v3d"]
	var front = new Array();
	var back = new Array();
	front.push(makePoint(data[0]));
	front.push(makePoint(data[1]));
	front.push(makePoint(data[2]));
	front.push(makePoint(data[3]));
	back.push(makePoint(data[4]));
	back.push(makePoint(data[5]));
	back.push(makePoint(data[6]));
	back.push(makePoint(data[7]));
	return [{p1: front[0], p2: front[1]}, {p1: front[1], p2: front[2]}, {p1: front[2], p2: front[3]}];
}

function makeSimpleDetectorPiece(data, rd, descr) {
	//subdiv, p1...p4
	var p1 = makePoint(data[0]);
	var p2 = makePoint(data[1]);
	var p3 = makePoint(data[2]);
	var p4 = makePoint(data[3]);
	return [p1, p2, p3, p4];
}

function makeWireframe(data, rd, descr) {
	var points = data[0];
	var lines = data[1];
	var wp = [];
	var wl = [];
	
	for (var i = 0; i < points.length; i++) {
		wp.push(makePoint(points[i]));
	}
	for (var i = 0; i < lines.length; i++) {
		wl.push({p1: lines[i][0], p2: lines[i][1]});
	}
	
	var w = new Pre3d.Wireframe();
	w.points = wp;
	w.lines = wl;
	
	return [w];
}

function makeSimpleRecHits(data, rd, descr, findex) {
	var s = new Pre3d.Shape();
    s.vertices = [makePoint(data[findex + 0]), makePoint(data[findex + 1]), makePoint(data[findex + 2]), makePoint(data[findex + 3])];
    s.quads = [new Pre3d.QuadFace(0, 1, 2, 3)];
    s.fillColor = makeColor(descr.fill, getRankValue(data, rd) * 0.5 + 0.5);
    s.strokeColor = makeColor(descr.color, getRankValue(data, rd) * 0.5 + 0.5);
    s.ambientLight = 1;

    Pre3d.ShapeUtils.rebuildMeta(s);
    return s;
}

function makeSimpleRecHits_V1(data, rd, descr) {
	return makeSimpleRecHits(data, rd, descr, 4);
}

function makeSimpleRecHits_V2(data, rd, descr) {
	return makeSimpleRecHits(data, rd, descr, 5);
}

function makeCaloTowers(data, rd, descr, pindex) {
	//["et", "double"],["eta", "double"],["phi", "double"],["iphi", "double"],["hadEnergy", "double"],["emEnergy", "double"],
	//["pos", "v3d"],
	//["front_1", "v3d"],["front_2", "v3d"],["front_3", "v3d"],["front_4", "v3d"],["back_1", "v3d"],["back_2", "v3d"],["back_3", "v3d"],["back_4", "v3d"]
	var front = new Array();
	var back = new Array();
	front.push(makePoint(data[pindex + 0]));
	front.push(makePoint(data[pindex + 1]));
	front.push(makePoint(data[pindex + 2]));
	front.push(makePoint(data[pindex + 3]));
	back.push(makePoint(data[pindex + 4]));
	back.push(makePoint(data[pindex + 5]));
	back.push(makePoint(data[pindex + 6]));
	back.push(makePoint(data[pindex + 7]));
	
	return makeTowers(data, rd, descr, front, back, data[4] + data[5]);
}

function makeCaloTowers_V1(data, rd, descr) {
	return makeCaloTowers(data, rd, descr, 7);
}

function makeCaloTowers_V2(data, rd, descr) {
	return makeCaloTowers(data, rd, descr, 11);
}

var MAX_JET_LENGTH = 4; 
	
function makeJet(data, rd, descr) {
	var et = data[0];
	var theta = data[2];
	var phi = data[3];
	var l = MAX_JET_LENGTH * getRankValue(data, rd);
	log("l: " + l);
	var cone = Pre3d.ShapeUtils.makeCone(l, l / 6, 24);
	var t = new Pre3d.Transform();
	log("theta: " + theta*360/2/3.141 + ", phi: " + phi*360/2/3.141);
	t.rotateY(theta);
	t.rotateZ(phi);
	
	var v = new Array();
	for (var i = 0; i < cone.vertices.length; i++) {
		v.push(t.transformPoint(cone.vertices[i]));
	}
	cone.vertices = v;
	cone.fillColor = makeColor(descr.color, 0.4);
	cone.strokeColor = null;
	Pre3d.ShapeUtils.rebuildMeta(cone);
	return cone;
}

function makeDTDigis(data) {
	//["wireNumber", "int"],["layerId", "int"],["superLayerId", "int"],["sectorId", "int"],["stationId", "int"],["wheelId", "int"],
	//["pos", "v3d"],["axis", "v3d"],["angle", "double"],
	//["countsTDC", "int"],["number", "int"],
	//["cellWidth", "double"],["cellLength", "double"],["cellHeight", "double"]]
	var pos = makePoint(data[6]);
	var axis = makePoint(data[7]);
	var len = data[12];
	var angle = data[8];
	var t = new Pre3d.Transform();
	t.rotateAroundAxis(axis, angle);
	var p1 = t.transformPoint(makePoint2(0, - len / 2, 0));
	var p2 = t.transformPoint(makePoint2(0, len / 2, 0));
	
	return {p1: addPoints(pos, p1), p2: addPoints(pos, p2)};
}

function makeDTRecHits(data) {
	//["wireId", "int"],["layerId", "int"],["superLayerId", "int"],["sectorId", "int"],["stationId", "int"],["wheelId", "int"],
	//["digitime", "double"],
	//["wirePos", "v3d"],
	//["lPlusGlobalPos", "v3d"],["lMinusGlobalPos", "v3d"],["rPlusGlobalPos", "v3d"],["rMinusGlobalPos", "v3d"],
	//["lGlobalPos", "v3d"],["rGlobalPos", "v3d"],
	//["axis", "v3d"],["angle", "double"],["cellWidth", "double"],["cellLength", "double"],["cellHeight", "double"]]
	var pos = makePoint(data[7]);
	var axis = makePoint(data[14]);
	var angle = data[15];
	var len = data[17];
	
	var t = new Pre3d.Transform();
	t.rotateAroundAxis(axis, angle);
	var p1 = t.transformPoint(makePoint2(0, - len / 2, 0));
	var p2 = t.transformPoint(makePoint2(0, len / 2, 0));
	
	return {p1: addPoints(pos, p1), p2: addPoints(pos, p2)};
}

function makeDTRecSegments(data) {
	return {p1: makePoint(data[1]), p2: makePoint(data[2])};
}

function makeRPCRecHits(data) {
	return [{p1: makePoint(data[0]), p2: makePoint(data[1])}, 
	        {p1: makePoint(data[2]), p2: makePoint(data[3])}, 
	        {p1: makePoint(data[4]), p2: makePoint(data[5])}];
}

function makeCSCRecHit2Ds_V2 (data) {
	return makeRPCRecHits(data);
}

function firstPoint(assoc, data2) {
	for (var i = 0; i < assoc.length; i++) {
		var asi = assoc[i];
		if (asi[0][1] == 0) {
			return makePoint(data2[asi[1][1]][0]);
		}
	}
} 

function makeGlobalMuons(data, rd, data2, assoc, data3) {
  if (!assoc) {
    throw "No association for " + descr.key;
  }
  var a = new Array();
  for (var i = 0; i < data.length; i++) {
    var last = null;
    for (var j = 0; j < assoc.length; j++) {
      if (assoc[j][0][1] == i) {
	var p = makePoint(data2[assoc[j][1][1]][0]);
	if (last !== null) {
	  a.push({p1: last, p2: p});
	}
	last = p;
      }
    }
  }
  return a;
} 

function makeTrackPoints(data, rd, descr, data2, assoc) {
	//"PFBrems_V1": [["deltaP", "double"],["sigmadeltaP", "double"]] (spec - tracks)
	//"PFBremTrajectoryPoints_V1": [[[43, 0], [42, 25]], (assoc)
	//[[43, 0], [42, 26]], 
	//[[43, 0], [42, 27]], 
	//[[43, 0], [42, 28]],
	//[collectionId, objectId]
	//"PFTrajectoryPoints_V1": [["pos", "v3d"],["dir", "v3d"]] (other - points)
	
	// man, that took me a while
	// so the association is of form [[[_, i], [_, p]]...]
	// where i represents an index into the data array and p represents an index
	// into the track points array
	// to build a track, one needs to add all the points with indices p for which 
	// i is equal to the current index into data
	
	if (!assoc) {
		throw "No association for " + descr.key;
	}

	var a = new Array();
	for (var i = 0; i < data.length; i++) {
		var last = null;
		for (var j = 0; j < assoc.length; j++) {
			if (assoc[j][0][1] == i) {
				var p = makePoint(data2[assoc[j][1][1]][0]);
				if (last !== null) {
					a.push({p1: last, p2: p});
				}
				last = p;
			}
		}
	}
	return a;
}

function makePhotons(data) {
	// tpm: draw a line representing the inferred photon trajectory from the vertex (IP?) to the 
	// extent of the ECAL
	//"Photons_V1": [["energy", "double"],["et", "double"],["eta", "double"],["phi", "double"],["pos", "v3d"]

	var lEB = 3.0;  // half-length of the EB (m)
  	var rEB = 1.24; // inner radius of the EB (m)

	var eta = data[2];
	var phi = data[3];

    var px = Math.cos(phi);
    var py = Math.sin(phi);

    // var pz = Math.sinh(eta);
    var pz = (Math.pow(Math.E, eta) - Math.pow(Math.E, -eta))/2;

    var pt1 = makePoint(data[4]);

    var t = 0.0;

    var x0 = pt1.x;
    var y0 = pt1.y;
    var z0 = pt1.z;

    if ( Math.abs(eta) > 1.48 ) { // i.e. not in the EB, so propagate to ES
      t = Math.abs((lEB - z0)/pz);
    } else { // propagate to EB 
      var a = px*px + py*py;
      var b = 2*x0*px + 2*y0*py;
      var c = x0*x0 + y0*y0 - rEB*rEB;
      t = (-b+Math.sqrt(b*b-4*a*c))/2*a;
    }

	return {p1: pt1, p2: makePoint([x0+px*t, y0+py*t, z0+pz*t])};
}

/*
 * 
 * 
"GsfTrackExtras_V1": [[[37, 0], [38, 0]], 
[[37, 1], [38, 1]]
]

"TrackExtras_V1": [[[2, 0], [3, 0]], 
[[2, 1], [3, 1]]
]

"Extras_V1": [[[0.0401944, -0.0103354, -0.0174814], [923.289, -238.174, 738.918], [1.05821, -0.273628, 0.797378], [917.889, -238.014, 734.835]], 
[[-0.0401818, 0.0104068, -0.0818134], [-955.721, 246.517, -765.15], [-1.03381, 0.266071, -0.877191], [-963.512, 247.307, -771.153]]
]

"GsfExtras_V1": [[[0.0401958, -0.0103279, -0.0174892], [1864.99, -481.33, 1492.84], [1.05821, -0.273637, 0.797469], [649.777, -168.58, 520.271]], 
[[-0.0401819, 0.0104067, -0.0818068], [-1209.66, 311.983, -968.486], [-1.03381, 0.266067, -0.877252], [-680.918, 174.709, -545.014]]
]
 */

/**
 * This ignores control points. I'm not sure what iSpy does, but
 * my curves are visibly curved in some cases when they appear as straight lines
 * in iSpy
 */
function makeTrackPoints2(data, rd, descr, data2, assoc) {
	if (!assoc) {
		throw "No association for " + descr.key;
	}
	
	var lines = new Array();
	
	for (var i = 0; i < data.length; i++) {
		var last = null;
		for (var j = 0; j < assoc.length; j++) {
			if (assoc[j][0][1] == i) {
				var mapped = data2[assoc[j][1][1]];
				var pos1 = makePoint(mapped[0]);
				var pos2 = makePoint(mapped[2]);
				log(descr.key + ": " + pointToStr(pos1) + ", " + pointToStr(pos2));
				if (last !== null) {
					lines.push({p1: last, p2: pos1});
				}
				lines.push({p1: pos1, p2: pos2});
				last = pos2;
			}
		}
	}
	return lines;
}

function makeTrackCurves(data, rd, descr, data2, assoc) {
  if (!assoc) {
    throw "No association for " + descr.key;
  }
	
  var paths = new Array();
	
  for (var i = 0; i < data.length; i++) {
    //var last = null;
    var cnt = 0;
    var path = new Pre3d.Path();
    var points = new Array();
    var curves = new Array();
    
    for (var j = 0; j < assoc.length; j++) {
      if (assoc[j][0][1] == i) {
	var mapped = data2[assoc[j][1][1]];
	var pos1 = makePoint(mapped[0]);
	var dir1 = Pre3d.Math.normalize(makePoint(mapped[1]));
	var pos2 = makePoint(mapped[2]);
	var dir2 = Pre3d.Math.normalize(makePoint(mapped[3]));
	log("pos1 = " + pointToStr(Pre3d.Math.normalize(subPoints(pos2, pos1))) + ", dir1 = " + pointToStr(dir1) + "pos2 = " + pointToStr(pos2) + ", dir2 = " + pointToStr(dir2));
	points.push(pos1);
	points.push(dir1);
	points.push(pos2);
	points.push(dir2);
	curves.push(new Pre3d.Curve(cnt * 4 + 2, cnt * 4 + 1, cnt * 4 + 3)); 
	cnt++;
      }
    }
    path.points = points;
    path.curves = curves;
    path.starting_point = 0;
    paths.push(path);
  }
  return paths;
}

/**
 * ... of unit radius and with a unit advance in the +z direction
 */
function makeHelixArc(angle) {
	var v = [];
	var c = [];
	var count = Math.round(angle * 4 / Math.PI) + 1;
	var rp = 1 / (Math.cos(angle / count / 2));
	var sp = {x: 1, y: 0, z: 0};
	v.push(sp);
	for (var i = 1; i <= count; i++) {
		var ca = i * angle / count;
		var cap = (i - 0.5) * angle / count;
		var cp = {x: rp * Math.cos(cap), y: rp * Math.sin(cap), z: (i - 0.5) / count};
		v.push(cp);
		var ep = {x: Math.cos(ca), y: Math.sin(ca), z: i / count};
		v.push(ep);
		var pi = v.length - 2;
		c.push(new Pre3d.Curve(pi + 1, pi, null));
	}
	
	var path = new Pre3d.Path();
	path.points = v;
	path.starting_point = 0;
	path.curves = c;
	path.drawEndPoints = true;
	return path;
}

function makeLinePath(p1, p2) {
	cp1 = Pre3d.Math.linearInterpolatePoints3d(p1, p2, 0.5);
	var path = new Pre3d.Path();
	path.points = [p1, p2, cp1];
	path.starting_point = 0;
	path.curves = [new Pre3d.Curve(1, 2, null)];
	return path;
}

function makeTrackCurves2(data, rd, descr, data2, assoc) {
  if (!assoc) {
    throw "No association for " + descr.key;
  }
	
  //if ( data.length != assoc.length ) {
  	//throw "data.length != assoc.length for " + descr.key;
  //}

  var l = new Array();
  var dot = Pre3d.Math.dotProduct3d;
  var cross = Pre3d.Math.crossProduct;
  var addPoints = Pre3d.Math.addPoints3d;
  var subPoints = Pre3d.Math.subPoints3d;
  var mulPoint = Pre3d.Math.mulPoint3d;
  var mag = Pre3d.Math.vecMag3d;
  var normalize = Pre3d.Math.normalize;
  var interpolate = Pre3d.Math.linearInterpolatePoints3d;
	
  for (var i = 0; i < data.length; i++) {
    for (var j = 0; j < assoc.length; j++) {
      if (assoc[j][0][1] == i) {
	var mapped = data2[assoc[j][1][1]];
	var p1 = makePoint(mapped[0]);
	var p2 = makePoint(mapped[2]);
	var t1 = normalize(makePoint(mapped[1]));
	var t2 = normalize(makePoint(mapped[3]));
				
	var rt1 = addPoints(p1, t1);
	var rt2 = addPoints(p2, t2);
				
	//so we're dealing with a helix with endpoints in pos1 and pos2 and
	//tangents in t1 and t2				
	var p1p2 = subPoints(p2, p1);
								
	var dot1 = dot(p1p2, t1);
	if (dot1 < 0.000001) { //ie t1 is parallel with p1p2: straight line
	  //though this assumes symmetry of the helix
	  var path = makeLinePath(p1, p2);
	  path.drawEndPoints = true;
	  l.push(path);
	}
	else {
	  //n is perpendicular to both lines
	  //and is the normal of the plane of the spiral (though this is a bit of an approximation
	  //since the tangent to the helix has, at any point, a z component)
	  //so I think this should be fixed to account for that
	  var n = cross(t1, t2);
	  //the height of the helix would then be the sum of
	  //the projections of the points on this normal
	  var height = dot(p1p2, n) / mag(n);
	  //now the arc of the spiral is the magnitude of the projection
	  //of p1p2 on the plane. But we know the distance between them and 
	  //the height, so...
	  var magp1p2 = mag(p1p2);
	  var arclen = Math.sqrt(magp1p2 * magp1p2 - height * height);
					
	  //since t1 and t2 are normalized
	  //t1 . t2 = |t1||t2|cos t <=> t1 . t2 = cos t
	  //though this should probably be projected in the helix plane (which under the
	  //previous assumption is currently the same as the t1t2 plane).
	  var cost = dot(t1, t2);
	  var sint = mag(cross(t1, t2));
					
	  //the angle between tangents is the arc angle
	  var a = Math.atan2(sint, cost);
	  
	  // arclen/2 is also the radius * sin (a / 2)
	  var radius = arclen / Math.sin(a / 2) / 2;

	  //make a unit spiral arc (rotating in the xy plane and translating in the z axis)
	  var helix = makeHelixArc(a);
					
	  var t = new Pre3d.Transform();
	  t.scale(radius, radius, height);

	  //now that it's scaled we need to rotate it such
	  //that p1p2 is the same as the endpoints of the helix
	  var ep1 = t.transformPoint(helix.points[0]);
	  var ep2 = t.transformPoint(helix.points[helix.points.length - 1]);
	  var ep1ep2 = subPoints(ep2, ep1);
	  var axis = cross(ep1ep2, p1p2);
	  if (mag(axis) > 0.00001) {
	    var magp1p2 = mag(p1p2);
	    var magep1ep2 = mag(ep1ep2);
	    var sinphi = mag(axis) / magp1p2 / magep1ep2;
	    var cosphi = dot(ep1ep2, p1p2) / magp1p2 / magep1ep2;
	    var phi = Math.atan2(sinphi, cosphi);
	    t.rotateAroundAxis(axis, phi);
	  } //otherwise no rotation needed
					
	  //also rotate around the p1p2 axis such that
	  //t1 points in the same direction as helix.t1
	  var helixt1 = normalize(t.transformPoint(helix.points[1]));
	  var np1p2 = normalize(p1p2);
					
	  // c1 and c2 are the normals to the planes determined by p1p2 and
	  // (helix.t1, t1) respectively
	  // since we want these planes to coincide, the rotation angle
	  // is the angle between c1 and c2
	  var c1 = normalize(cross(helixt1, np1p2));
	  var c2 = normalize(cross(t1, np1p2));
	  var pc1 = addPoints(p1, c1);
	  var pc2 = addPoints(p1, c2);
					
	  var axis2 = cross(c1, c2);
	  //basically this tests if the two lines are sufficiently parallel (a term which probably only
	  //exists in computer engineering) in which case no rotation is needed
	  if (mag(axis2) > 0.00001) {
	    var sinrho = mag(axis2);
	    var cosrho = dot(c1, c2);
	    var rho = Math.atan2(sinrho, cosrho);
	    
	    //rotate around axis2 instead of p1p2 because
	    //axis2 takes into acount direction of rotation between c1 and c2
	    t.rotateAroundAxis(axis2, rho);
	  }
						
	  //now that p1p2 and the helix endpoints are parallel
	  //just translate by their difference
					
	  var p1rep1 = subPoints(t.transformPoint(helix.points[0]), p1);
	  t.translate(-p1rep1.x, -p1rep1.y, -p1rep1.z);
	  
	  for (var k = 0; k < helix.points.length; k++) {
	    helix.points[k] = t.transformPoint(helix.points[k]);
	  }
	  // I might have done simpler things in my life
	  l.push(helix);
	}				
      }
    }
  }

	return l;
}

function getRankingData(d_event, desc, data) {
	if (!desc.rank) {
		return null;
	}
	var tdata = d_event["Types"][desc.key];
	var index = null;
	for (var i = 0; i < tdata.length; i++) {
		if (desc.rank == tdata[i][0]) {
			index = i;
			break;
		}
	}
	if (index === null) {
		throw "Invalid rank for " + desc.key + ": " + desc.rank;
	}
	var rfn = desc.rankingFunction;
	if (!rfn) {
		rfn = function(data) {
			return data[index];
		};
	}
	var v = new Array();
	var indices = new Array();
	for (var i = 0; i < data.length; i++) {
		var vv = rfn(data[i]);
		if (vv == null) {
			log("Invalid " + desc.rank + " for " + desc.key + "[" + i + "]");
		}
		v.push(vv);
		indices.push([vv, i]);
	}
	v.sort(function(a, b) { return a - b });
	indices.sort(function(a, b) { return a[0] - b[0];});
	var dataOrder = new Array();
	for (var i = 0; i < indices.length; i++) {
		dataOrder.push(indices[i][1]);
	}
	var range = v[v.length - 1];
	log(v);
	var thresholdIndex = Math.round(v.length * GLOBAL_RANK_THRESHOLD);
	var rd = {
		index: index,
		sorted: v,
		dataOrder: dataOrder,
		range: range,
		dirty: true,
		lowCut: document.settings.globalCaloEnergyLowCut,
		highCut: 1.0,
		rfn: rfn,
	};
	log("ranking for " + desc.key + ": index = " + index + ", range = " + range + ", v = " + v.length);
	return rd;
}

function rebuildRankingIndices(rd) {
	rd.lowIndex = findLIndex(rd.sorted, rd.lowCut * rd.range);
	rd.highIndex = findHIndex(rd.sorted, rd.highCut * rd.range);
	rd.dirty = false;
}

function findLIndex(vec, value) {
	for (var i = 0; i < vec.length; i++) {
		if (vec[i] >= value) {
			return i;
		}
	}
	return vec.length;
}

function findHIndex(vec, value) {
	for (var i = 0; i < vec.length; i++) {
		if (vec[i] > value) {
			return i - 1;
		}
	}
	return vec.length - 1;
}

function getRankValue(data, rd) {
	if (rd) {
    	return rd.rfn(data) / rd.range;
    }
	else {
		return null;
	}
}