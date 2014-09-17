function loadIg(filename) {

  var request = $.ajax({
      type: "GET",
      url: filename,
      mimeType: "text/plain; charset=x-user-defined",
      error: function(req, status, error) { console.error(error); }
  }).done(function(data) {

      var zip = new JSZip(data);
      var eventlist = [];

      $.each(zip.files, function(index, zipEntry){
        if ( zipEntry._data !== null && zipEntry.name !== "Header" ) {
          eventlist.push(zipEntry.name);
        }
      });

      document.currentEventList = eventlist;
      //console.log(eventlist);
      document.igdata = zip;
      document.selectedEventIndex = 0;
      loadEvent();
  });

  request.done();
}

function loadEvent() {
  var event = document.currentEventList[document.selectedEventIndex];

  $("#title").html("Loading..."+event);

  try{
      var ed = JSON.parse(cleanupData(document.igdata.file(event).asText()));
      enableNextPrev();
      eventDataLoaded(ed);
    } catch(e) {
      alert(e);
    }

    $("#title").html("Event " + (document.selectedEventIndex+1) + " of " + document.currentEventList.length + ": " + event);
}

function enableNextPrev() {
  if (document.selectedEventIndex > 0) {
    $("#prev-event-button").removeClass("disabled");
  }
  else {
    $("#prev-event-button").addClass("disabled");
  }
  if (document.currentEventList && document.currentEventList.length - 1 > document.selectedEventIndex) {
    $("#next-event-button").removeClass("disabled");
  }
  else {
    $("#next-event-button").addClass("disabled");
  }
}

function nextEvent() {
  if (document.currentEventList && document.currentEventList.length - 1 > document.selectedEventIndex) {
    document.selectedEventIndex++;
    loadEvent();
  }
}

function prevEvent() {
  if (document.currentEventList && document.selectedEventIndex > 0) {
    document.selectedEventIndex--;
    loadEvent();
  }
}

function cleanupData(d) {
  // rm non-standard json bits
  // newer files will not have this problem
  d = d.replace(/\(/g,'[')
      .replace(/\)/g,']')
      .replace(/\'/g, "\"")
      .replace(/nan/g, "0");
  return d;
}
