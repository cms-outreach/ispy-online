EVD.getField = function(data, name) {
	if (!data.indices) {
		var indices = {};
		var ev = EVD.event;
		var t = ev["Types"][data.key];
		for (var i = 0; i < t.length; i++) {
			indices[t[i][0]] = i;
		}
		data.indices = indices;
	}
	return data[data.indices[name]];
}

EVD.toggle = function(group, key) {
	EVD.disabled[key] = !EVD.disabled[key]; 

	EVD.scene.getObjectByName(group).children.forEach(function(c) {
		if ( c.name === key ) {
			c.visible = !EVD.disabled[key];
		}
	});
}

EVD.addSwitchRow = function(html) {
	var tbl = document.getElementById("switches");
	tbl.insertRow(tbl.rows.length).innerHTML = html;
}

EVD.clearSwitchRows = function() {
	var tbl = document.getElementById("switches");
	while (tbl.rows.length > 0) {
		tbl.deleteRow(0);
	}
}

// tpm: should make it that the help menu index does not depend on the 
// specific group index
EVD.addSwitchRows = function(data, group, gi) {
	EVD.addSwitchRow('<td colspan="2" class="group">' + group + '<a href="#" class="help-detsystem" onclick="openPopup(event, \'help-detsystem-' + gi + '\', \'cursor\')"><img src="graphics/help-small.png" /></a></td>');

	for ( var key in EVD.data_description ) {
		if (EVD.data_description[key].group != group) {
			continue;
		}
			
		if (!data["Collections"][key]) {
			continue;
		}
			
		var on = !EVD.disabled[key] ? ' checked="true"' : "";
		var count = data["Collections"][key].length;
		var desc = EVD.data_description[key].desc;
			
		if (desc == null) {
			desc = key;
		}
			
		var count = "(" + count + ")";
			
		if (EVD.data_description[key].group === "Detector Model") {
			//don't show count for the model; it doesn't make much sense
			count = "";
		}
            
        /*
        if (! EVD.settings.showCollectionCount ){
        	var count = "";
        }
        */
			
		var html = '<td class="sw">' + desc + count + '</td><td><input type="checkbox" id="' + key + '"' + on + ' onchange="EVD.toggle(\''+ group +'\',\''+ key + '\');">';
			

		// tpm disable this for now
		/*
		if (EVD.data_description[key].rank) {
			html += '</td><td><img src="graphics/range-selector.png" class="range-selector-button" onclick="showRange(event, \'' + key + '\');" />';
		} else {
			html += '</td><td>';
		}
		*/
		html += '</td><td>';
		html += '</td>';
		
		EVD.addSwitchRow(html);
	}

	fleXenv.fleXcrollMain("switches-div");
} 


EVD.addToScene = function(data) {
	// Whether it's geometry or event,
	// the main object key is Collections.
	// We iterate over the keys in EVD.data_description
	// and if they exist in our input data, add to scene

	for ( var key in EVD.data_description ) {
    	
    	var edata = data["Collections"][key];
    	
    	if ( !edata || edata.length == 0 ) {
      		continue;
    	}

    	var desc = EVD.data_description[key];
    	desc.key = key;

    	var fn = desc.fn;

    	var dataref = null;
    	var assoc = null;

    	if (desc.dataref) {
      		dataref = data["Collections"][desc.dataref];
    	}

    	if (desc.assoc) {
    		assoc = data["Associations"][desc.assoc];
    	}

    	// If something is already disabled via the toggle then 
    	// this should override what is from the desc
		var on = !EVD.disabled[key] ? desc.on = true : desc.on = false;   	

    	switch (desc.type) {
    		case CURVES:
    		case PATHS:
      			lines = fn(edata, rd, desc, dataref, assoc);
      			for (var k = 0; k < lines.length; k++) {
					EVD.scene.getObjectByName(desc.group).add(lines[k]);
      			}
      		break;
    
    		case LINES:
    			for (var j = 0; j < edata.length; j++) {
					lines = fn(edata[j], desc);
	  				for (var k = 0; k < lines.length; k++) {
	    				EVD.scene.getObjectByName(desc.group).add(lines[k]);
	  				}
      			}
    		break;

    		case WIREFRAME:
    			for (var i = 0; i < edata.length; i++) {
					var obj = fn(edata[i], desc);
					for ( var j = 0; j < obj.length; j++ ) { 
						var shapes = makeShape(obj[j], desc);
						for ( var k = 0; k < shapes.length; k++ ) {
							EVD.scene.getObjectByName(desc.group).add(shapes[k]);
						}
					}
      			}
      		break;

    		case CUBE:
    			for (var j = 0; j < edata.length; j++ ) {
    				var obj = fn(edata[j], desc);
    				if ( obj != null ) {	
  	  					for ( var k = 0; k < obj.length; k++ ) {
  	  						EVD.scene.getObjectByName(desc.group).add(obj[k]);
  	  					}
    				}
    			}
    		break;

    		case SHAPE:
    			for ( var j = 0; j < edata.length; j++ ) {
    				var obj = fn(edata[j], desc);
    				if ( obj != null ) {
	    				for ( var k = 0; k < obj.length; k++ ) {
		    				EVD.scene.getObjectByName(desc.group).add(obj[k]);
		    			}
		    		}
    			}
    		break;

    		case TRACK:
    			var tracks = fn(edata, desc, dataref, assoc);
      			for (var j = 0; j < tracks.length; j++) {
					EVD.scene.getObjectByName(desc.group).add(tracks[j]);
      			}
      		break;

    		default:
    			for (var j = 0; j < edata.length; j++) {
					var obj = fn(edata[getIndex(rd, j)], rd, desc);
					EVD.scene.getObjectByName(desc.group).add(obj);
      			}
    	}
  	}
}

EVD.loadDetector = function() {
	EVD.clearSwitchRows();
	EVD.addSwitchRows(EVD.detectorModel, "Detector Model", 0);
	EVD.addToScene(EVD.detectorModel);
}

EVD.eventDataLoaded = function(data) {
	EVD.eventData = data;
	enableNextPrev();

	// remove all but the geometry from the
	// scene before rendering
	EVD.scene.children.forEach(function(c) {
		if ( c.name != "Detector Model" ) {
			EVD.scene.getObjectByName(c.name).children.length = 0;
		}
	});

	for ( var i = 0; i < EVD.data_groups.length; i++ ) {
		if ( EVD.data_groups[i] === "Detector Model" ) {
			continue;
		}
		EVD.addSwitchRows(data, EVD.data_groups[i], i);
	}

	EVD.addToScene(data);
}

EVD.hasWebGL = function() {
	// this works, but need to debug why scene
	// rendered by webgl is so slow and crappy looking (on Mac)
	return false;

	var canvas = document.createElement('canvas');

	if ( ! canvas.getContext('webgl') ) {
		console.log('no webgl');
	}

	if ( ! canvas.getContext('experimental-webgl') ) {
		console.log('no experimental-webgl');
	}

	if ( ! window.WebGLRenderingContext ) {
		console.log('no WebGLRenderingContext');
	}

	if ( canvas.getContext('webgl') || canvas.getContext('experimental-webgl') ) {
		if ( ! window.WebGLRenderingContext ) {
			return false;
		} else {
			return true;
		}

	} else {
		return false;
	}
}

EVD.render = function() {
	if ( EVD.renderer !== null ) {
		EVD.renderer.render(EVD.scene, EVD.camera);
	}

	/*
	if ( EVD.inset_renderer != null ) {
		EVD.inset_renderer.render(EVD.inset_scene, EVD.inset_camera);
	}
	*/
}

EVD.animate = function() {
	requestAnimationFrame(EVD.animate);
	EVD.controls.update();

	/*
	EVD.inset_camera.position.subVectors(EVD.camera.position, EVD.controls.target);
	EVD.inset_camera.position.setLength(100);
	EVD.inset_camera.lookAt(EVD.inset_scene.position);
	*/

	EVD.render();
}

EVD.init = function() {
	var screen_canvas = document.getElementById('container');

	var scene = new THREE.Scene();
	EVD.scene = scene;

	var width = 700.0;
	var height = 600.0;

	// width, height, fov, near, far, orthoNear, orthoFar
	var camera = new THREE.CombinedCamera(width, height, 70, 1, 100, 1, 48);
	EVD.camera = camera;
	//EVD.camera.toOrthographic();
	EVD.setCameraHome();
	
	var renderer;
	if ( EVD.hasWebGL() ) {
		//console.log('webgl');
		renderer = new THREE.WebGLRenderer({antialias:true});
	} else {	
		//console.log('canvas');
		renderer = new THREE.CanvasRenderer();
	}

	renderer.setSize(width, height);
	EVD.renderer = renderer;
	screen_canvas.appendChild(EVD.renderer.domElement);

	// The second argument is necessary to make sure that mouse events are 
	// handled only when in the canvas
	var controls = new THREE.TrackballControls(EVD.camera, EVD.renderer.domElement);
	EVD.controls = controls;

	// Add a parent object for each group
	EVD.data_groups.forEach(function(g) {
		var obj_group = new THREE.Object3D();
		obj_group.name = g;
		EVD.scene.add(obj_group);	
	})
	
	var raycaster = new THREE.Raycaster();
	raycaster.linePrecision = 0.05;
	var projector = new THREE.Projector();

	EVD.raycaster = raycaster;
	EVD.projector = projector;

	EVD.renderer.domElement.addEventListener('mousedown', EVD.onDocumentMouseDown, false);

	/* 
		tpm: This needs some debugging
	width = 100.0;
	height = 100.0;

	var inset = document.getElementById('inset');
	var inset_renderer = new THREE.CanvasRenderer();
	inset_renderer.setSize(width,height);
	inset.appendChild(inset_renderer.domElement);
	EVD.inset_renderer = inset_renderer;

	var inset_scene = new THREE.Scene();
	var inset_camera = new THREE.CombinedCamera(width/2, height/2, 70, 1, 1000, 1, 100);
	inset_camera.toPerspective();
	inset_camera.up = camera.up;

	EVD.inset_scene = inset_scene;
	EVD.inset_camera = inset_camera;
	*/
	
	var origin = new THREE.Vector3(0,0,0);
	var length = 10;

	// direction, origin, length, color hex
	var arrowX = new THREE.ArrowHelper(new THREE.Vector3(1,0,0),origin,length,0xff0000);
	var arrowY = new THREE.ArrowHelper(new THREE.Vector3(0,1,0),origin,length,0x00ff00);
	var arrowZ = new THREE.ArrowHelper(new THREE.Vector3(0,0,1),origin,length,0x0000ff);

	//EVD.scene.add(arrowX);
	//EVD.scene.add(arrowY);
	//EVD.scene.add(arrowZ);

	//EVD.inset_scene.add(arrowX);
	//EVD.inset_scene.add(arrowY);
	//EVD.inset_scene.add(arrowZ);

	EVD.loadDetector();
}

EVD.lookAtOrigin = function() {
	EVD.camera.lookAt(new THREE.Vector3(0,0,0));
}

EVD.setCameraHome = function() {
	var home_x = -18.1;
	var home_y = 8.6;
	var home_z = 14.0;

	EVD.camera.position.x = home_x;
	EVD.camera.position.y = home_y;
	EVD.camera.position.z = home_z;

	EVD.camera.setZoom(1);
	EVD.camera.up = new THREE.Vector3(0,1,0);
	EVD.lookAtOrigin();
}

EVD.setXY = function() {
	EVD.camera.position = new THREE.Vector3(0,0,EVD.camera.position.length());
	EVD.camera.up = new THREE.Vector3(0,1,0);
	EVD.lookAtOrigin();
}

EVD.setZX = function() {
	EVD.camera.position = new THREE.Vector3(0,EVD.camera.position.length(),0);
	EVD.camera.up = new THREE.Vector3(1,0,0);
	EVD.lookAtOrigin();
}

EVD.setYZ = function() {
	EVD.camera.position = new THREE.Vector3(-EVD.camera.position.length(),0,0);
	EVD.camera.up = new THREE.Vector3(0,1,0);
	EVD.lookAtOrigin();
}

EVD.setOrthographic = function() {
	EVD.camera.toOrthographic();
}

EVD.setPerspective = function() {
	EVD.camera.toPerspective();
}

EVD.zoom = function(step) {
	var zoom = EVD.camera.zoom;
	EVD.camera.setZoom(zoom+step);
}