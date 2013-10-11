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

var WEIGHTS = { 0: 1, 1: 4, 2: 8, 3: 16, 4: 4, 5: 16, 6: 4 };

var d_descr = {
	"Tracker3D_V1": {type: LINES, on: false, group: "Detector", desc: "Tracker",
		fn: makeDetectorPiece, color: [0, 1, 1, 0.5], fill: [0, 1, 1, 0.5], lineWidth: 0.5},
	"Tracker3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "Tracker",
		fn: makeWireframe, color: [1, 1, 0, 0.5], lineWidth: 0.5},

	"TrackerBarrel3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Tracker Barrels",
		fn: makeModelTrackerBarrel, color: [1, 1, 0, 0.3], lineWidth: 1.0},

	"TrackerEndcap3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Tracker Endcaps",
		fn: makeModelTrackerEndcap, color: [1, 1, 0, 0.3], lineWidth: 0.5},

	"EcalBarrel3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "ECAL Barrel",
		fn: makeWireframe, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	"EcalBarrel3D_MODEL": {type: WIREFRAME, on: true, group: "Detector Model", desc: "ECAL Barrel",
		fn: makeModelEcalBarrel, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	"EcalEndcap3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "ECAL Endcaps",
		fn: makeWireframe, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	"EcalEndcap3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "ECAL Endcaps",
		fn: makeModelEcalEndcap, color: [0, 1, 1, 0.5], lineWidth: 0.5},
	"EcalPreshower3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "ECAL Preshower",
		fn: makeModelEcalPreshower, color: [1, 0, 0, 0.5], lineWidth: 0.5},
	"HcalBarrel3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "HCAL Barrel",
		fn: makeWireframe, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalBarrel3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Barrel",
		fn: makeModelHcalBarrel, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalEndcap3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "HCAL Endcaps",
		fn: makeWireframe, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalEndcap3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Endcaps",
		fn: makeModelHcalEndcap, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalOuter3D_VS": {type: WIREFRAME, on: true, group: "Detector", desc: "HCAL Outer",
		fn: makeWireframe, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalOuter3D_MODEL": {type: WIREFRAME, on: true, group: "Detector Model", desc: "HCAL Outer",
		fn: makeModelHcalOuter, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalForward3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "HCAL Forward",
		fn: makeWireframe, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"HcalForward3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "HCAL Forward",
		fn: makeModelHcalForward, color: [0.8, 1, 0, 0.5], lineWidth: 0.5},
	"DTs3D_VS": {type: WIREFRAME, on: true, group: "Detector", desc: "Drift Tubes",
		fn: makeWireframe, color: [1, 0.6, 0, 0.3], lineWidth: 0.8},
	"DTs3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Drift Tubes (muon)",
		fn: makeWireframe, color: [1, 0.6, 0, 0.8], lineWidth: 0.9},
	"CSC3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "Cathode Strip Chambers (muon)",
		fn: makeWireframe, color: [1, 1, 0, 0.3], lineWidth: 0.8},
	"CSC3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Cathode Strip Chambers (muon)",
		fn: makeCSCs, color: [1, 1, 0, 0.5], lineWidth: 0.5},
	"RPC3D_VS": {type: WIREFRAME, on: false, group: "Detector", desc: "Resistive Plate Chambers (muon)",
		fn: makeWireframe, color: [0.2, 1, 0, 0.3], lineWidth: 0.8},
	"RPC3D_MODEL": {type: WIREFRAME, on: false, group: "Detector Model", desc: "Resistive Plate Chambers (muon)",
		fn: makeRPCs, color: [0.8, 1, 0, 0.4], lineWidth: 0.8},
		
	"Tracks_V1": { type: PATHS, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: makeTrackCurves2, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },
	"Tracks_V2": { type: PATHS, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: makeTrackCurves2, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },
	"Tracks_V3": { type: PATHS, on: true, group: "Tracking", desc: "Tracks (reco.)",
		dataref: "Extras_V1", assoc: "TrackExtras_V1",
		fn: makeTrackCurves2, color: [1, 0.7, 0, 0.7], lineCaps: "square", lineWidth: 2 },

	"SiStripDigis_V1": { type: POINT, on: false, group: "Tracking", desc: "Digis (Si Strips)",
		fn: makeSiStripDigis, color: [1, 0.5, 0, 0.6], shape: "+", lineWidth: 0.5 },
	"SiPixelClusters_V1": { type: POINT, on: false, group: "Tracking", desc: "Clusters (Si Pixels)",
		fn: makeSiStripDigis, color: [0.9, 0.6, 0, 1], shape: "x", lineWidth: 1 },
	"SiStripClusters_V1": { type: POINT, on: false, group: "Tracking", desc: "Clusters (Si Strips)",
		fn: makeSiStripDigis, color: [1, 0.6, 0, 1], shape: "x", lineWidth: 1 },
	"SiPixelRecHits_V1": { type: POINT, on: false, group: "Tracking", desc: "Rec. Hits (Si Pixels)", 
		fn: makeSiStripDigis, color: [1, 0, 0, 1], shape: "square", lineWidth: 0.5 },
	"TrackingRecHits_V1": { type: POINT, on: false, group: "Tracking", desc: "Rec. Hits (Tracking)", 
		fn: makeHit, color: [1, 1, 0, 1], fill: [1, 1, 0, 1], shape: "disc", lineWidth: 1 },
		
	"DTDigis_V1": { type: LINE, on: false, group: "Muon", desc: "DT Digis",
		fn: makeDTDigis, color: [0, 1, 0, 1], lineWidth: 1 },
	"DTRecHits_V1": { type: LINE, on: false, group: "Muon", desc: "DT Rec. Hits",
		fn: makeDTRecHits, color: [0, 1, 0, 1], lineWidth: 2 },
	"DTRecSegment4D_V1": { type: LINE, on: true, group: "Muon", desc: "DT Rec. Segments (4D)",
		fn: makeDTRecSegments, color: [1, 1, 0, 1], lineWidth: 3 },
	"CSCSegments_V1": { type: LINE, on: true, group: "Muon", desc: "CSC Segments",
		fn: makeCSCSegments, color: [1, 0.6, 1, 1], lineWidth: 3 },
	"CSCWireDigis_V1": { type: LINE, on: false, group: "Muon", desc: "CSC Wire Digis",
		fn: makeCSCWD, color: [0.8, 0, 0.8, 1], lineWidth: 0.5 },
	"CSCStripDigis_V1": { type: LINE, on: false, group: "Muon", desc: "CSC Strip Digis",
		fn: makeCSCSD, color: [0.8, 0, 0.8, 1], lineWidth: 0.5 },
	"RPCRecHits_V1": { type: LINES, on: false, group: "Muon", desc: "RPC Rec. Hits",
		fn: makeRPCRecHits, color: [0.8, 1, 0, 1], lineWidth: 3 },
	"CSCRecHit2Ds_V2": { type: LINES, on: false, group: "Muon", desc: "CSC Rec. Hits (2D)",
		fn: makeCSCRecHit2Ds_V2, color: [0.6, 1, 0.9, 1], lineWidth: 2 },
  	"MuonChambers_V1": {type: LINES, on: true, group: "Muon", desc: "Matching muon chambers",
		fn: makeChambers, color: [1, 0, 0, 0.5], lineWidth: 0.5},

	"EBRecHits_V1": { type: SHAPE, on: true, group: "ECAL", desc: "Barrel Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.1, 1, 0.1, 1], fill: [0.1, 1, 0.1, 1], lineWidth: 1 },
	"EBRecHits_V2": { type: SHAPE, on: true, group: "ECAL", desc: "Barrel Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.1, 1, 0.1, 1], fill: [0.1, 1, 0.1, 1], lineWidth: 1 },
	"EERecHits_V1": { type: SHAPE, on: false, group: "ECAL", desc: "Endcap Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.1, 1, 0.1, 1], fill: [0.1, 1, 0.1, 1], lineWidth: 1 },
	"EERecHits_V2": { type: SHAPE, on: false, group: "ECAL", desc: "Endcap Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.1, 1, 0.1, 1], fill: [0.1, 1, 0.1, 1], lineWidth: 1 },
	"ESRecHits_V1": { type: SHAPE, on: false, group: "ECAL", desc: "Preshower Rec. Hits", rank: "energy",
		fn: makeSimpleRecHits_V1, color: [1, 0.2, 0, 1], fill: [1, 0.2, 0.2, 1], lineWidth: 1 },
	"ESRecHits_V2": { type: SHAPE, on: false, group: "ECAL", desc: "Preshower Rec. Hits", rank: "energy",
		fn: makeSimpleRecHits_V2, color: [1, 0.2, 0, 1], fill: [1, 0.2, 0.2, 1], lineWidth: 1 },
		
	"HBRecHits_V1": { type: SHAPE, on: true, group: "HCAL", desc: "Barrel Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.2, 0.7, 1, 1], fill: [0.2, 0.7, 1, 1], lineWidth: 0.5 },
	"HBRecHits_V2": { type: SHAPE, on: true, group: "HCAL", desc: "Barrel Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.2, 0.7, 1, 1], fill: [0.2, 0.7, 1, 1], lineWidth: 0.5 },
	"HERecHits_V1": { type: SHAPE, on: true, group: "HCAL", desc: "Endcap Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.2, 0.7, 1, 1], fill: [0.2, 0.7, 1, 1], lineWidth: 0.5 },
	"HERecHits_V2": { type: SHAPE, on: true, group: "HCAL", desc: "Endcap Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.2, 0.7, 1, 1], fill: [0.2, 0.7, 1, 1], lineWidth: 0.5 },
	"HFRecHits_V1": { type: SHAPE, on: true, group: "HCAL", desc: "Forward Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.6, 1, 1, 1], fill: [0.6, 1, 1, 1], lineWidth: 0.5 },
	"HFRecHits_V2": { type: SHAPE, on: true, group: "HCAL", desc: "Forward Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.6, 1, 1, 1], fill: [0.6, 1, 1, 1], lineWidth: 0.5 },
	"HORecHits_V1": { type: SHAPE, on: false, group: "HCAL", desc: "Outer Rec. Hits", rank: "energy",
		fn: makeRecHits_V1, color: [0.2, 0.7, 1, 0.4], fill: [0.2, 0.7, 1, 0.2], lineWidth: 0.5 },
	"HORecHits_V2": { type: SHAPE, on: false, group: "HCAL", desc: "Outer Rec. Hits", rank: "energy",
		fn: makeRecHits_V2, color: [0.2, 0.7, 1, 0.4], fill: [0.2, 0.7, 1, 0.2], lineWidth: 0.5 },
		
	/*
	"GsfPFRecTracks_V1": { type: TRACK, on: false, group: "Particle Flow", desc: "GSF Tracks",
		dataref: "PFTrajectoryPoints_V1", assoc: "GsfPFRecTrackTrajectoryPoints_V1", 
		fn: makeTrackPoints, color: [0, 1, 1, 1], lineCaps: "+", lineWidth: 1},
	"PFEBRecHits_V1": { type: SHAPE, on: false, group: "Particle Flow", desc: "ECAL Barrel Rec. Hits", rank: "energy",
		fn: makeRecHits, color: [1, 0, 1, 1], fill: [1, 0, 1, 1], lineWidth: 0.5},
	"PFEERecHits_V1": { type: SHAPE, on: false, group: "Particle Flow", desc: "ECAL Endcap Rec. Hits", rank: "energy",
		fn: makeRecHits, color: [1, 0, 1, 1], fill: [1, 0, 1, 1], lineWidth: 0.5},
	"PFBrems_V1": { type: TRACK, on: false, group: "Particle Flow", desc: "Bremsstrahlung candidate tangents",
		dataref: "PFTrajectoryPoints_V1", assoc: "PFBremTrajectoryPoints_V1", 
		fn: makeTrackPoints, color: [0, 1, 0.2, 1], lineCaps: "+", lineWidth: 1},
	*/
      
	"GsfElectrons_V1": { type: PATHS, on: true, group: "Physics Objects", desc: "Electron Tracks (GSF)",
		dataref: "Extras_V1", assoc: "GsfElectronExtras_V1", 
		fn: makeTrackCurves2, color: [1, 0.9, 0, 0.9], lineCaps: "square", lineWidth: 2},

	"GsfElectrons_V2": { type: PATHS, on: true, group: "Physics Objects", desc: "Electron Tracks (GSF)",
		dataref: "Extras_V1", assoc: "GsfElectronExtras_V1", 
		fn: makeTrackCurves2, color: [1, 0.9, 0, 0.9], lineCaps: "square", lineWidth: 2},

	/*
	"Photons_V1": { type: LINE, on: false, group: "Physics Objects", desc: "Photons (Reco)",
		 fn: makePhotons, color: [0.8, 0.8, 0, 1], lineWidth: 2},
	*/

	"TrackerMuons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Tracker Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonTrackerPoints_V1", 
		fn: makeTrackPoints, color: [1, 0, 0.2, 1], lineCaps: "-", lineWidth: 2},
	
	"TrackerMuons_V2": {type: PATHS, on: true, group: "Physics Objects", desc: "Tracker Muons (Reco)",
		dataref: "Extras_V1", assoc: "MuonTrackerExtras_V1", 
		fn: makeTrackCurves2, color: [1, 0, 0.2, 1], lineCaps: "-", lineWidth: 2},

	"StandaloneMuons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Stand-alone Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonStandalonePoints_V1", 
		fn: makeTrackPoints, color: [1, 0, 0.2, 1], lineCaps: "square", lineWidth: 2},
	
	"StandaloneMuons_V2": { type: PATHS, on: true, group: "Physics Objects", desc: "Stand-alone Muons (Reco)",
		dataref: "Extras_V1", assoc: "MuonTrackExtras_V1", 
		fn: makeTrackCurves2, color: [1, 0, 0.2, 1], lineCaps: "square", lineWidth: 2},

	"GlobalMuons_V1": { type: TRACK, on: true, group: "Physics Objects", desc: "Global Muons (Reco)",
		dataref: "Points_V1", assoc: "MuonGlobalPoints_V1", 
		fn: makeTrackPoints, color: [1, 0, 0.2, 1], lineCaps: "-", lineWidth: 2},

	"CaloTowers_V1": { type: SHAPE, on: false, group: "Physics Objects", desc: "Calorimeter Energy Towers", rank: "et",
		fn: makeCaloTowers_V1, color: [0, 1, 0, 1], fill: [0, 1, 0, 1], lineWidth: 0.5, 
		rankingFunction: function(data) {return data[4] + data[5];}},
	"CaloTowers_V2": { type: SHAPE, on: false, group: "Physics Objects", desc: "Calorimeter Energy Towers", rank: "et",
		fn: makeCaloTowers_V2, color: [0, 1, 0, 1], fill: [0, 1, 0, 1], lineWidth: 0.5, 
		rankingFunction: function(data) {return data[4] + data[5];}},
	"Jets_V1": { type: SHAPE, on: false, group: "Physics Objects", desc: "Jets", rank: "et",
		fn: makeJet, color: [1, 1, 0, 1], fill: [1, 1, 0, 0.5] },
     "METs_V1": { type: SHAPE, on: false, group: "Physics Objects", desc: "Missing Et (Reco)", rank: "pt",
		fn: makeMET, color: [1, 1, 0, 1], fill: [1, 1, 0, 0.5]}
};

var d_groups = ["Detector Model", "Tracking", "ECAL", "HCAL", "Muon", "Physics Objects"];