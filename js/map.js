var map = null;
var gmapRequestTimeout;
var markers = {};
function initMap() {
	map = new google.maps.Map(document.getElementById('map'), {
	  center: {lat: 34.01945, lng: -118.49119},
	  zoom: 12
	});
	clearTimeout(gmapRequestTimeout);
	$(document).trigger("maploaded");
}

function addMarker(loc) {
	if(!map){//wait for map to be initialized prior to adding marker.
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
		marker.addListener('click', function(){
			marker.setAnimation(google.maps.Animation.BOUNCE);
			setTimeout(function(){
		        marker.setAnimation(null);
		    },1000);
			infowindow.open(map, marker);
		});
		marker.setMap(map);
		markers[loc.id] = marker;
	}
}

function setLocations(ids){
	_.each(markers,function(marker){
		marker.setMap(null);
	});
	ids.forEach(function(i){
		markers[i].setMap(map);
	});
}

function showAllMarkers(){
	_.each(markers,function(marker){
		marker.setMap(map);
	});
}

function showInfo(id){
	google.maps.event.trigger(markers[id], 'click');
}

$(document).ready(function () {
	//timeout if map doesn't load.
	gmapRequestTimeout = setTimeout(function(){
        $('#map').text("Failed to get Google Map. Please check your connection.");
    },8000);
});