function saveCanvasData() {
	var oCanvas = document.getElementById("canvas");
	Canvas2Image.saveAsPNG(oCanvas);
}

function renderCanvasData() {
	var oCanvas = document.getElementById("canvas");
	var imageBase64Data = oCanvas.toDataURL("image/png");  
	
	window.open(imageBase64Data, "_blank", "toolbar=no", "location=no", "directories=no", "status=no", "menubar=yes")
}