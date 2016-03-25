var map = null;
var gmapRequestTimeout;
var markers = {};
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: -34.397, lng: 150.644},
	  zoom: 8
	});
	clearTimeout(gmapRequestTimeout);
	$(document).trigger("maploaded");
}

function addMarker(loc) {
	if(!map){//wait for map to be initialized prior to adding marker.
		console.log("adding event "+ JSON.stringify(loc));
		$(document).bind("maploaded",function(){
			addMarker(loc);
		});
	}
	else {
		var info = "<div><h4>"+loc.name+"</h4><p>"+loc.description+"</p></div>";
		var infowindow = new google.maps.InfoWindow({
		    content: info//this should probably be a template of some kind.
		  });
		var myLatlng = {lat:Number(loc.lat), lng: Number(loc.lng)};
		var marker = new google.maps.Marker({
		    position: myLatlng,
		    title:"Hello World!"
		});
		console.log("adding "+loc.id);
		marker.addListener('click', function(){
			infowindow.open(map, marker);
		});
		marker.setMap(map);
		markers[loc.id] = marker;
	}
}

function setLocations(ids){
	_.each(markers,function(marker){
		console.log(marker);
		marker.setMap(null);
	});
	ids.forEach(function(i){
		markers[i].setMap(map);
	});
}

function showAllMarkers(){
	_.each(markers,function(marker){
		console.log(marker);
		marker.setMap(map);
	});
}

$(document).ready(function () {
	//timeout if map doesn't load.
	gmapRequestTimeout = setTimeout(function(){
        $('#map').text("Failed to get Google Map. Please check your connection.");
    },8000);
});