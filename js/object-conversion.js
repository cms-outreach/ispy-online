EVD.makeMET = function(data, descr) {    
    /*
      "METs_V1": [["phi", "double"],["pt", "double"],["px", "double"],["py", "double"],["pz", "double"]]
    */
    var pt = data[1];
    var px = data[2];
    var py = data[3];

    var dir = new THREE.Vector3(px,py,0);
    dir.normalize();

    var color = new THREE.Color();
    color.setRGB(descr.color[0], descr.color[1], descr.color[2]);

    // dir, origin, length, hex, headLength, headWidth
    var origin = new THREE.Vector3(0,0,0);
    var length = pt*0.1;
 
    var met = new THREE.ArrowHelper(dir,origin,length,color.getHex(),0.25,0.15);
    met.name = descr.name;
    met.visible = descr.on;

    return [met];
}

EVD.makeJet = function(data, descr) {
  var et = data[0];
  var theta = data[2];
  var phi = data[3];

  var ct = Math.cos(theta);
  var st = Math.sin(theta);

  var maxZ = 4.0;
  var maxR = 2.0;

  var length1 = ct ? maxZ / Math.abs(ct) : maxZ;
  var length2 = st ? maxR / Math.abs(st) : maxR;
  var length = length1 < length2 ? length1 : length2;
  var radius = 0.3 * (1.0 /(1 + 0.001));

  var geometry = new THREE.CylinderGeometry();
  geometry.radiusTop = radius;
  geometry.radiusBottom = 0.0;
  geometry.height = length;
  geometry.openEnded = true;

  geometry.position = new THREE.Vector3(0,0,0);
  
  var mcolor = new THREE.Color();
  mcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.MeshBasicMaterial({color:mcolor, opacity:descr.color[3]});
  material.side = THREE.DoubleSide;

  var jet = new THREE.Mesh(geometry, material);
  jet.name = descr.key;
  jet.visible = descr.on;

  return [jet];
}

EVD.makeRecHit_V2 = function(data, descr) {
  var energy = data[0];
  if ( energy > 0.5 ) {
    return EVD.makeScaledSolidBox(data, descr, 5, descr.scale*energy);
    //return EVD.makeScaledWireframeBox(data, descr, descr.scale);
  }
}

EVD.makeCSC = function(data, descr) {
  return EVD.makeWireframeBox(data, descr, 1);
}

EVD.makeDT = function(data, descr) {
  return EVD.makeWireframeBox(data, descr, 1);
}

EVD.makeMuonChamber = function(data, descr) {
  return EVD.makeWireframeBox(data, descr, 1);
}

EVD.makeSolidBox = function(data, descr, ci) {
  var f1 = new THREE.Vector3(data[ci][0],   data[ci][1],   data[ci][2]);
  var f2 = new THREE.Vector3(data[ci+1][0], data[ci+1][1], data[ci+1][2]);
  var f3 = new THREE.Vector3(data[ci+2][0], data[ci+2][1], data[ci+2][2]);
  var f4 = new THREE.Vector3(data[ci+3][0], data[ci+3][1], data[ci+3][2]);
                  
  var b1 = new THREE.Vector3(data[ci+4][0], data[ci+4][1], data[ci+4][2]);
  var b2 = new THREE.Vector3(data[ci+5][0], data[ci+5][1], data[ci+5][2]);
  var b3 = new THREE.Vector3(data[ci+6][0], data[ci+6][1], data[ci+6][2]);
  var b4 = new THREE.Vector3(data[ci+7][0], data[ci+7][1], data[ci+7][2]);

  var front = new THREE.Geometry();

  front.vertices.push(f1);
  front.vertices.push(f2);
  front.vertices.push(f3);
  front.vertices.push(f4);

  front.faces.push(new THREE.Face3(0,1,2));
  front.faces.push(new THREE.Face3(0,2,3));

  front.computeCentroids();
  front.computeFaceNormals();
  front.computeVertexNormals();

  var back = new THREE.Geometry();

  back.vertices.push(b1);
  back.vertices.push(b2);
  back.vertices.push(b3);
  back.vertices.push(b4);

  back.faces.push(new THREE.Face3(0,1,2));
  back.faces.push(new THREE.Face3(0,2,3));
  
  back.computeCentroids();
  back.computeFaceNormals();
  back.computeVertexNormals();

  var top = new THREE.Geometry();

  top.vertices.push(f1);
  top.vertices.push(b1);
  top.vertices.push(b2);
  top.vertices.push(f2);

  top.faces.push(new THREE.Face3(0,1,2));
  top.faces.push(new THREE.Face3(0,2,3));
  
  top.computeCentroids();
  top.computeFaceNormals();
  top.computeVertexNormals();

  var bottom = new THREE.Geometry();

  bottom.vertices.push(f4);
  bottom.vertices.push(b4);
  bottom.vertices.push(b3);
  bottom.vertices.push(f3);

  bottom.faces.push(new THREE.Face3(0,1,2));
  bottom.faces.push(new THREE.Face3(0,2,3));
  
  bottom.computeCentroids();
  bottom.computeFaceNormals();
  bottom.computeVertexNormals();

  var left = new THREE.Geometry();

  left.vertices.push(f2);
  left.vertices.push(b2);
  left.vertices.push(b3);
  left.vertices.push(f3);

  left.faces.push(new THREE.Face3(0,1,2));
  left.faces.push(new THREE.Face3(0,2,3));
  
  left.computeCentroids();
  left.computeFaceNormals();
  left.computeVertexNormals();

  var right = new THREE.Geometry();

  right.vertices.push(f1);
  right.vertices.push(b1);
  right.vertices.push(b4);
  right.vertices.push(f4);

  right.faces.push(new THREE.Face3(0,1,2));
  right.faces.push(new THREE.Face3(0,2,3));
  
  right.computeCentroids();
  right.computeFaceNormals();
  right.computeVertexNormals();

  var wfcolor = new THREE.Color();
  wfcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.MeshBasicMaterial({color:wfcolor, 
                                              opacity:descr.color[3]});
  
  material.side = THREE.DoubleSide;

  var fr = new THREE.Mesh(front, material);
  fr.name = descr.key;
  fr.visible = descr.on;

  var bk = new THREE.Mesh(back, material);
  bk.name = descr.key;
  bk.visible = descr.on;

  var tp = new THREE.Mesh(top, material);
  tp.name = descr.key;
  tp.visible = descr.on;

  var bm = new THREE.Mesh(bottom, material);
  bm.name = descr.key;
  bm.visible = descr.on;

  var lf = new THREE.Mesh(left, material);
  lf.name = descr.key;
  lf.visible = descr.on;

  var rt = new THREE.Mesh(right, material);
  rt.name = descr.key;
  rt.visible = descr.on;

  return [fr,bk,tp,bm,lf,rt];
}

EVD.makeScaledSolidBox = function(data, descr, ci, scale) {
  var f1 = new THREE.Vector3(data[ci][0],   data[ci][1],   data[ci][2]);
  var f2 = new THREE.Vector3(data[ci+1][0], data[ci+1][1], data[ci+1][2]);
  var f3 = new THREE.Vector3(data[ci+2][0], data[ci+2][1], data[ci+2][2]);
  var f4 = new THREE.Vector3(data[ci+3][0], data[ci+3][1], data[ci+3][2]);
                  
  var b1 = new THREE.Vector3(data[ci+4][0], data[ci+4][1], data[ci+4][2]);
  var b2 = new THREE.Vector3(data[ci+5][0], data[ci+5][1], data[ci+5][2]);
  var b3 = new THREE.Vector3(data[ci+6][0], data[ci+6][1], data[ci+6][2]);
  var b4 = new THREE.Vector3(data[ci+7][0], data[ci+7][1], data[ci+7][2]);

  var front = new THREE.Geometry();

  front.vertices.push(f1);
  front.vertices.push(f2);
  front.vertices.push(f3);
  front.vertices.push(f4);

  front.faces.push(new THREE.Face3(0,1,2));
  front.faces.push(new THREE.Face3(0,2,3));

  front.computeCentroids();
  front.computeFaceNormals();
  front.computeVertexNormals();

  b1.sub(f1);
  b2.sub(f2);
  b3.sub(f3);
  b4.sub(f4);

  b1.normalize();
  b2.normalize();
  b3.normalize();
  b4.normalize();

  b1.multiplyScalar(scale); 
  b2.multiplyScalar(scale);
  b3.multiplyScalar(scale);
  b4.multiplyScalar(scale);

  b1.addVectors(f1,b1);
  b2.addVectors(f2,b2);
  b3.addVectors(f3,b3);
  b4.addVectors(f4,b4);

  var back = new THREE.Geometry();

  back.vertices.push(b1);
  back.vertices.push(b2);
  back.vertices.push(b3);
  back.vertices.push(b4);

  back.faces.push(new THREE.Face3(0,1,2));
  back.faces.push(new THREE.Face3(0,2,3));
  
  back.computeCentroids();
  back.computeFaceNormals();
  back.computeVertexNormals();

  var top = new THREE.Geometry();

  top.vertices.push(b1);
  top.vertices.push(b2);
  top.vertices.push(f2);
  top.vertices.push(f1);

  top.faces.push(new THREE.Face3(0,1,2));
  top.faces.push(new THREE.Face3(0,2,3));
  
  top.computeCentroids();
  top.computeFaceNormals();
  top.computeVertexNormals();

  var bottom = new THREE.Geometry();

  bottom.vertices.push(f3);
  bottom.vertices.push(b3);
  bottom.vertices.push(b4);
  bottom.vertices.push(f4);

  bottom.faces.push(new THREE.Face3(0,1,2));
  bottom.faces.push(new THREE.Face3(0,2,3));
  
  bottom.computeCentroids();
  bottom.computeFaceNormals();
  bottom.computeVertexNormals();

  var left = new THREE.Geometry();

  left.vertices.push(f2);
  left.vertices.push(b2);
  left.vertices.push(b3);
  left.vertices.push(f3);

  left.faces.push(new THREE.Face3(0,1,2));
  left.faces.push(new THREE.Face3(0,2,3));
  
  left.computeCentroids();
  left.computeFaceNormals();
  left.computeVertexNormals();

  var right = new THREE.Geometry();

  right.vertices.push(b1);
  right.vertices.push(f1);
  right.vertices.push(f4);
  right.vertices.push(b4);

  right.faces.push(new THREE.Face3(0,1,2));
  right.faces.push(new THREE.Face3(0,2,3));
  
  right.computeCentroids();
  right.computeFaceNormals();
  right.computeVertexNormals();

  var mcolor = new THREE.Color();
  mcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.MeshBasicMaterial({color:mcolor, 
                                              opacity:descr.color[3]});
  material.side = THREE.DoubleSide;
  
  var fr = new THREE.Mesh(front, material);
  fr.name = descr.key;
  fr.visible = descr.on;

  var bk = new THREE.Mesh(back, material);
  bk.name = descr.key;
  bk.visible = descr.on;

  var tp = new THREE.Mesh(top, material);
  tp.name = descr.key;
  tp.visible = descr.on;

  var bm = new THREE.Mesh(bottom, material);
  bm.name = descr.key;
  bm.visible = descr.on;

  var lf = new THREE.Mesh(left, material);
  lf.name = descr.key;
  lf.visible = descr.on;

  var rt = new THREE.Mesh(right, material);
  rt.name = descr.key;
  rt.visible = descr.on;

  return [fr,bk,tp, bm,lf,rt];
}

EVD.makeWireframeBox = function(data, descr, ci) {
	var f1 = new THREE.Vector3(data[ci][0],   data[ci][1],   data[ci][2]);
  var f2 = new THREE.Vector3(data[ci+1][0], data[ci+1][1], data[ci+1][2]);
  var f3 = new THREE.Vector3(data[ci+2][0], data[ci+2][1], data[ci+2][2]);
  var f4 = new THREE.Vector3(data[ci+3][0], data[ci+3][1], data[ci+3][2]);
                  
  var b1 = new THREE.Vector3(data[ci+4][0], data[ci+4][1], data[ci+4][2]);
  var b2 = new THREE.Vector3(data[ci+5][0], data[ci+5][1], data[ci+5][2]);
  var b3 = new THREE.Vector3(data[ci+6][0], data[ci+6][1], data[ci+6][2]);
  var b4 = new THREE.Vector3(data[ci+7][0], data[ci+7][1], data[ci+7][2]);

  var wfcolor = new THREE.Color();
  wfcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineBasicMaterial({color:wfcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});
   	
  var front = new THREE.Geometry();
  front.vertices.push(f1);
  front.vertices.push(f2);
	front.vertices.push(f3);
	front.vertices.push(f4);
	front.vertices.push(f1);

	var back = new THREE.Geometry();
  back.vertices.push(b1);
	back.vertices.push(b2);
	back.vertices.push(b3);
	back.vertices.push(b4);
  back.vertices.push(b1);

  var s1 = new THREE.Geometry();
  s1.vertices.push(f1);
  s1.vertices.push(b1);

  var s2 = new THREE.Geometry();
  s2.vertices.push(f2);
  s2.vertices.push(b2);

  var s3 = new THREE.Geometry();
  s3.vertices.push(f3);
  s3.vertices.push(b3);

  var s4 = new THREE.Geometry();
  s4.vertices.push(f4);
  s4.vertices.push(b4);

  var box = [new THREE.Line(front,material), 
             new THREE.Line(back,material), 
             new THREE.Line(s1,material), 
             new THREE.Line(s2,material), 
             new THREE.Line(s3,material), 
             new THREE.Line(s4,material)];
  
  box.forEach(function(l) {
    l.name = descr.key;
    l.visible = descr.on;
  });

  return box;
}

EVD.makeScaledWireframeBox = function(data, descr, ci, scale) {
  var f1 = new THREE.Vector3(data[ci][0],   data[ci][1],   data[ci][2]);
  var f2 = new THREE.Vector3(data[ci+1][0], data[ci+1][1], data[ci+1][2]);
  var f3 = new THREE.Vector3(data[ci+2][0], data[ci+2][1], data[ci+2][2]);
  var f4 = new THREE.Vector3(data[ci+3][0], data[ci+3][1], data[ci+3][2]);
                  
  var b1 = new THREE.Vector3(data[ci+4][0], data[ci+4][1], data[ci+4][2]);
  var b2 = new THREE.Vector3(data[ci+5][0], data[ci+5][1], data[ci+5][2]);
  var b3 = new THREE.Vector3(data[ci+6][0], data[ci+6][1], data[ci+6][2]);
  var b4 = new THREE.Vector3(data[ci+7][0], data[ci+7][1], data[ci+7][2]);

  b1.sub(f1);
  b2.sub(f2);
  b3.sub(f3);
  b4.sub(f4);

  b1.normalize();
  b2.normalize();
  b3.normalize();
  b4.normalize();

  b1.multiplyScalar(scale); 
  b2.multiplyScalar(scale);
  b3.multiplyScalar(scale);
  b4.multiplyScalar(scale);

  b1.addVectors(f1,b1);
  b2.addVectors(f2,b2);
  b3.addVectors(f3,b3);
  b4.addVectors(f4,b4);

  var wfcolor = new THREE.Color();
  wfcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineBasicMaterial({color:wfcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});

  var front = new THREE.Geometry();
  front.vertices.push(f1);
  front.vertices.push(f2);
  front.vertices.push(f3);
  front.vertices.push(f4);
  front.vertices.push(f1);

  var back = new THREE.Geometry();
  back.vertices.push(b1);
  back.vertices.push(b2);
  back.vertices.push(b3);
  back.vertices.push(b4);
  back.vertices.push(b1);

  var s1 = new THREE.Geometry();
  s1.vertices.push(f1);
  s1.vertices.push(b1);

  var s2 = new THREE.Geometry();
  s2.vertices.push(f2);
  s2.vertices.push(b2);

  var s3 = new THREE.Geometry();
  s3.vertices.push(f3);
  s3.vertices.push(b3);

  var s4 = new THREE.Geometry();
  s4.vertices.push(f4);
  s4.vertices.push(b4);

  var box = [new THREE.Line(front,material), 
             new THREE.Line(back,material), 
             new THREE.Line(s1,material), 
             new THREE.Line(s2,material), 
             new THREE.Line(s3,material), 
             new THREE.Line(s4,material)];
  
  box.forEach(function(l) {
    l.name = descr.key;
    l.visible = descr.on;
  });

  return box;
}

EVD.makeDTRecHits = function(data, descr) {
  /*
    ["wireId", "int"],["layerId", "int"],["superLayerId", "int"],["sectorId", "int"],["stationId", "int"],["wheelId", "int"],
    ["digitime", "double"],["wirePos", "v3d"],
    ["lPlusGlobalPos", "v3d"],["lMinusGlobalPos", "v3d"],["rPlusGlobalPos", "v3d"],["rMinusGlobalPos", "v3d"],
    ["lGlobalPos", "v3d"],["rGlobalPos", "v3d"],
    ["axis", "v3d"],["angle", "double"],["cellWidth", "double"],["cellLength", "double"],["cellHeight", "double"]]
  */
  var lcolor = new THREE.Color();
  lcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineBasicMaterial({color:lcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});

  var pos = new THREE.Vector3(data[7][0], data[7][1], data[7][2]);
  var axis = new THREE.Vector3(data[14][0], data[14][1], data[14][2]);
  var angle = data[15];
  var len = data[17];

  var p1 = new THREE.Vector3(0, -len/2, 0);
  var p2 = new THREE.Vector3(0, len/2, 0);

  //console.log(p1,p2);

  p1.applyAxisAngle(axis, angle);
  p2.applyAxisAngle(axis, angle);

  //console.log(p1,p2);

  var geometry = new THREE.Geometry();
  geometry.vertices.push(pos.add(p1));
  geometry.vertices.push(pos.add(p2));

  var line = new THREE.Line(geometry, material);
  line.name = descr.key;
  line.visible = descr.on;

  //console.log(line);

  return [line];
}

EVD.makeDTRecSegments = function(data, descr) {
  var lcolor = new THREE.Color();
  lcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineBasicMaterial({color:lcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});

  //console.log(data[1],data[2]);

  var geometry = new THREE.Geometry();
  geometry.vertices.push(new THREE.Vector3(data[1][0], data[1][1], data[1][2]));
  geometry.vertices.push(new THREE.Vector3(data[2][0], data[2][1], data[2][2]));

  var line = new THREE.Line(geometry, material);
  line.name = descr.key;
  line.visible = descr.on;

  //console.log(line);

  return [line];
}

EVD.makeRPCRecHits = function(data, descr) {
  var lcolor = new THREE.Color();
  lcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineBasicMaterial({color:lcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});

  var g1 = new THREE.Geometry();
  g1.vertices.push(new THREE.Vector3(data[0][0], data[0][1], data[0][2]));
  g1.vertices.push(new THREE.Vector3(data[1][0], data[1][1], data[1][2]));

  var g2 = new THREE.Geometry();
  g2.vertices.push(new THREE.Vector3(data[2][0], data[2][1], data[2][2]));
  g2.vertices.push(new THREE.Vector3(data[3][0], data[3][1], data[3][2]));
  
  var g3 = new THREE.Geometry();
  g3.vertices.push(new THREE.Vector3(data[4][0], data[4][1], data[4][2]));
  g3.vertices.push(new THREE.Vector3(data[5][0], data[5][1], data[5][2]));

  var lines = [new THREE.Line(g1,material), new THREE.Line(g2,material), new THREE.Line(g3,material)];

  lines.forEach(function(l) {
    l.name = descr.key;
    l.visible = descr.on;
  })

  return lines;
}

EVD.makeCSCSegments = function(data, descr) {
  return EVD.makeDTRecSegments(data, descr);
}

EVD.makeCSCRecHit2Ds_V2 = function(data, descr) {
	return EVD.makeRPCRecHits(data, descr);
}

EVD.makeTrackPoints = function(data, descr, data2, assoc) {
  if ( ! assoc ) {
    throw "No association for " + descr.key;
  }
	
  var wfcolor = new THREE.Color();
  wfcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  /*
  var material = new THREE.LineBasicMaterial({color:wfcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});
	*/
  var muons = [];
  for ( var i = 0; i < data.length; i++ ) {
    muons[i] = new THREE.Geometry();
  }

  var mi = 0;
  for ( var j = 0; j < assoc.length; j++ ) {
    mi = assoc[j][0][1];
    pi = assoc[j][1][1];
    muons[mi].vertices.push(new THREE.Vector3(data2[pi][0][0],data2[pi][0][1],data2[pi][0][2]));
  }
  
  var lines = [];
  for ( var k = 0; k < muons.length; k++ ) {
    var material = new THREE.LineBasicMaterial({color:wfcolor, 
                                              linewidth:descr.lineWidth, 
                                              opacity:descr.color[3]});
    lines.push(new THREE.Line(muons[k], material));
  }

  lines.forEach(function(l) {
    l.name = descr.key;
    l.visible = descr.on;
  });

  return lines;
}

EVD.makeTrackCurves = function(tracks, descr, extras, assocs) {
  if ( ! assocs ) {
    throw "No association for " + descr.key;
  }

  var wfcolor = new THREE.Color();
  wfcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var ti, ei;
  var p1, d1, p2, d2;
  var distance, scale, curve;
  var geometry;

  var curves = [];

  for ( var i = 0; i < assocs.length; i++ ) {
    ti = assocs[i][0][1];
    ei = assocs[i][1][1];

    p1 = new THREE.Vector3(extras[ei][0][0],extras[ei][0][1],extras[ei][0][2]);
    d1 = new THREE.Vector3(extras[ei][1][0],extras[ei][1][1],extras[ei][1][2]);
    d1.normalize();

    p2 = new THREE.Vector3(extras[ei][2][0],extras[ei][2][1],extras[ei][2][2]);
    d2 = new THREE.Vector3(extras[ei][3][0],extras[ei][3][1],extras[ei][3][2]);
    d2.normalize();

    // What's all this then?
    // Well, we know the beginning and end points of the track as well
    // as the directions at each of those points. This in-principle gives 
    // us the 4 control points needed for a cubic bezier spline. 
    // The control points from the directions are determined by moving along 0.25
    // of the distance between the beginning and end points of the track. 
    // This 0.25 is nothing more than a fudge factor that reproduces closely-enough
    // the NURBS-based drawing of tracks done in iSpy. At some point it may be nice
    // to implement the NURBS-based drawing but I value my sanity.

    distance = p1.distanceTo(p2);
    scale = distance*0.25;

    p3 = new THREE.Vector3(p1.x+scale*d1.x, p1.y+scale*d1.y, p1.z+scale*d1.z);
    p4 = new THREE.Vector3(p2.x-scale*d2.x, p2.y-scale*d2.y, p2.z-scale*d2.z);

    curve = new THREE.CubicBezierCurve3(p1,p3,p4,p2);
    geometry = new THREE.Geometry();
    geometry.vertices = curve.getPoints(16);

    var material = new THREE.LineBasicMaterial({color:wfcolor, 
                                              linewidth:descr.lineWidth,
                                              linecap:'butt', 
                                              opacity:descr.color[3]});

    curves.push(new THREE.Line(geometry,material));
  }

  curves.forEach(function(c) {
    c.name = descr.key;
    c.visible = descr.on;
  });

  return curves;
}

EVD.makePhotons = function(data, descr) {
	/*
     Draw a line representing the inferred photon trajectory from the vertex (IP?) to the extent of the ECAL
	   "Photons_V1": [["energy", "double"],["et", "double"],["eta", "double"],["phi", "double"],["pos", "v3d"]
  */
	
  var lEB = 3.0;  // half-length of the EB (m)
  var rEB = 1.24; // inner radius of the EB (m)

	var eta = data[2];
	var phi = data[3];

  var px = Math.cos(phi);
  var py = Math.sin(phi);
  var pz = (Math.pow(Math.E, eta) - Math.pow(Math.E, -eta))/2;

  var t = 0.0;

  var x0 = data[4][0];
  var y0 = data[4][1];
  var z0 = data[4][2];

  if ( Math.abs(eta) > 1.48 ) { // i.e. not in the EB, so propagate to ES
    t = Math.abs((lEB - z0)/pz);
  } else { // propagate to EB 
    var a = px*px + py*py;
    var b = 2*x0*px + 2*y0*py;
    var c = x0*x0 + y0*y0 - rEB*rEB;
    t = (-b+Math.sqrt(b*b-4*a*c))/2*a;
  }

  var pt1 = new THREE.Vector3(x0, y0, z0);
  var pt2 = new THREE.Vector3(x0+px*t, y0+py*t, z0+pz*t);

  var lcolor = new THREE.Color();
  lcolor.setRGB(descr.color[0], descr.color[1], descr.color[2]); 

  var material = new THREE.LineDashedMaterial({color:lcolor, 
                                              linewidth:descr.lineWidth,
                                              opacity:descr.color[3]});

  var geometry = new THREE.Geometry();
  geometry.vertices.push(pt1);
  geometry.vertices.push(pt2);

  var line = new THREE.Line(geometry, material);
  line.name = descr.key;
  line.visible = descr.on;

  return [line];
}