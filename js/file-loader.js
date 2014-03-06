function hasFileAPI() {
	if ( window.FileReader && window.File && window.FileList && window.FileSystem ) {
  		return true;
  	} else {
  		console.log("FileReader", window.FileReader);
  		console.log("File", window.File);
  		console.log("FileList", window.FileList);
  		console.log("FileSystem", window.FileSystem);
  		return false;
  	}
}
    
function loadFile() {
	var fileList = document.getElementById('file-selector').files;
	document.currentFileList = fileList;
	showEventBrowser();
}



  