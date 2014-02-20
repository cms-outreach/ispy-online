/*
	tpm: Should clean these categories up.
	Many are not needed and redundant.
	They even may not be necessary at all.
*/

var POINT = 0;
var LINE = 1;
var SURFACE = 2;
var SHAPE = 3;
var LINES = 4;
var TRACK = 5;
var CURVES = 6;
var PATHS = 7;
var RECT = 8;
var RECTS = 9;
var WIREFRAME = 10;
var CUBE = 11;

EVD.data_description = {
	
	"TrackerBarrel3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Tracker Barrels",
		fn: makeModelTrackerBarrel, color: [1, 1, 0, 0.3], lineWidth: 1.0},

	"TrackerEndcap3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Tracker Endcaps",
		fn: makeModelTrackerEndcap, color: [1, 1, 0, 0.3], lineWidth: 0.5},
	
	"EcalBarrel3D_MODEL": {type: WIREFRAME, on: true, group: "Detector Model", desc: "ECAL Barrel",
		fn: makeModelEcalBarrel, color: [0, 1, 1, 0.5], lineWidth: 0.5},

	"EcalEndcap3D_plus": {type: WIREFRAME, on: false, group: "Detector Model", desc: "ECAL Endcap (+)",
		fn: makeModelEcalEndcapPlus, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	
	"EcalEndcap3D_minus": {type: WIREFRAME, on: false, group: "Detector Model", desc: "ECAL Endcap (-)",
		fn: makeModelEcalEndcapMinus, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	
	"HcalBarrel3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Barrel",
		fn: makeModelHcalBarrel, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	
	"HcalEndcap3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Endcaps",
		fn: makeModelHcalEndcap, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},

	"HcalOuter3D_MODEL": {type: WIREFRAME, on: true, group: "Detector Model", desc: "HCAL Outer",
		fn: makeModelHcalOuter, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	
	"HcalForward3D_plus": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Forward (+)",
		fn: makeModelHcalForwardPlus, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	
	"HcalForward3D_minus": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Forward (-)",
		fn: makeModelHcalForwardMinus, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	
	"DTs3D_VS": {type: CUBE, on: false, group: "Detector Model", desc: "Drift Tubes (muon)",
		fn: EVD.makeDT, color: [1, 0.6, 0, 0.3], lineWidth: 0.9},

	"CSC3D_VS": {type: CUBE, on: false, group: "Detector Model", desc: "Cathode Strip Chambers (muon)",
		fn: EVD.makeCSC, color: [0.6, 0.7, 0, 0.3], lineWidth: 0.8},
		
	"RPC3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Resistive Plate Chambers (muon)",
		fn: makeRPC, color: [0.8, 1, 0, 0.4], lineWidth: 0.8},

	"EBRecHits_V2": { type: SHAPE, on: true, group: "ECAL", desc: "Barrel Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.1, 1.0, 0.1, 0.5], lineWidth: 1, scale: 0.05 },
	
	"EERecHits_V2": { type: SHAPE, on: true, group: "ECAL", desc: "Endcap Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.1, 1.0, 0.1, 0.5], lineWidth: 1, scale: 0.05 },
	
	"ESRecHits_V2": { type: SHAPE, on: false, group: "ECAL", desc: "Preshower Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [1, 0.2, 0, 0.5], lineWidth: 1, scale: 0.05 },
		
	"HBRecHits_V2": { type: SHAPE, on: true, group: "HCAL", desc: "Barrel Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.2, 0.7, 1, 0.5], lineWidth: 0.5, scale: 0.1 },
	
	"HERecHits_V2": { type: SHAPE, on: true, group: "HCAL", desc: "Endcap Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.2, 0.7, 1, 0.5], lineWidth: 0.5, scale: 0.1 },
	
	"HFRecHits_V2": { type: SHAPE, on: false, group: "HCAL", desc: "Forward Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.6, 1, 1, 0.5], lineWidth: 0.5, scale: 0.1 },
	
	"HORecHits_V2": { type: SHAPE, on: false, group: "HCAL", desc: "Outer Rec. Hits",
		fn: EVD.makeRecHit_V2, color: [0.2, 0.7, 1, 0.5], lineWidth: 0.5, scale: 0.1 },

	"Tracks_V1": { type: TRACK, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: EVD.makeTrackCurves, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },

	"Tracks_V2": { type: TRACK, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: EVD.makeTrackCurves, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },

	"Tracks_V3": { type: TRACK, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: EVD.makeTrackCurves, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },

	/*
		need to fix these
	"DTRecHits_V1": { type: LINES, on: true, group: "Muon", desc: "DT Rec. Hits",
		fn: EVD.makeDTRecHits, color: [0, 1, 0, 1], lineWidth: 2 },
	*/

	"DTRecSegment4D_V1": { type: LINES, on: true, group: "Muon", desc: "DT Rec. Segments (4D)",
		fn: EVD.makeDTRecSegments, color: [1, 1, 0, 1], lineWidth: 3 },
	
	"CSCSegments_V1": { type: LINES, on: true, group: "Muon", desc: "CSC Segments",
		fn: EVD.makeCSCSegments, color: [1, 0.6, 1, 1], lineWidth: 3 },
	
	"RPCRecHits_V1": { type: LINES, on: true, group: "Muon", desc: "RPC Rec. Hits",
		fn: EVD.makeRPCRecHits, color: [0.8, 1, 0, 1], lineWidth: 3 },

	"CSCRecHit2Ds_V2": { type: LINES, on: true, group: "Muon", desc: "CSC Rec. Hits (2D)",
		fn: EVD.makeCSCRecHit2Ds_V2, color: [0.6, 1, 0.9, 1], lineWidth: 2 },

	"MuonChambers_V1": {type: SHAPE, on: true, group: "Muon", desc: "Matching muon chambers",
		fn: EVD.makeMuonChamber, color: [1, 0, 0, 0.3], lineWidth: 0.8},

	"GsfElectrons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Electron Tracks (GSF)",
		dataref: "Extras_V1", assoc: "GsfElectronExtras_V1", 
		fn: EVD.makeTrackCurves, color: [0.1, 1.0, 0.1, 0.9], lineWidth: 2},

	"GsfElectrons_V2": { type: PATHS, on: true, group: "Physics Objects", desc: "Electron Tracks (GSF)",
		dataref: "Extras_V1", assoc: "GsfElectronExtras_V1", 
		fn: EVD.makeTrackCurves, color: [0.1, 1.0, 0.1, 0.9], lineWidth: 2},

	"Photons_V1": { type: LINES, on: false, group: "Physics Objects", desc: "Photons (Reco)",
		 fn: EVD.makePhotons, color: [0.8, 0.8, 0, 1], lineWidth: 2},

	"TrackerMuons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Tracker Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonTrackerPoints_V1", 
		fn: EVD.makeTrackPoints, color: [1, 0, 0.2, 1], lineWidth: 2},
	
	"StandaloneMuons_V1": { type: TRACK, on: false, group: "Physics Objects", desc: "Stand-alone Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonStandalonePoints_V1", 
		fn: EVD.makeTrackPoints, color: [1, 0, 0.2, 1], lineWidth: 2},

	"StandaloneMuons_V2": { type: TRACK, on: false, group: "Physics Objects", desc: "Stand-alone Muons (Reco)",
		dataref: "Extras_V1", assoc: "MuonTrackExtras_V1", 
		fn: EVD.makeTrackCurves, color: [1, 0, 0.2, 1], lineWidth: 2},

	"GlobalMuons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Global Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonGlobalPoints_V1", 
		fn: EVD.makeTrackPoints, color: [1, 0, 0.2, 1], lineWidth: 2},

	"METs_V1": { type: SHAPE, on: false, group: "Physics Objects", desc: "Missing Et (Reco)",
		fn: EVD.makeMET, color: [1, 1, 0, 1]},

	"Jets_V1": { type: SHAPE, on: false, group: "Physics Objects", desc: "Jets",
		fn: EVD.makeJet, color: [1, 1, 0, 1]}
};
	
EVD.data_groups = ["Detector Model", "Tracking", "ECAL", "HCAL", "Muon", "Physics Objects"];
EVD.disabled = new Array();

for (var key in EVD.data_description) {
	if (!EVD.data_description[key].on) {
		EVD.disabled[key] = true;
	}
}



