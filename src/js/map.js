/** @description Object to contain all googlemap variables/methods
 *  @property {object} map - contains the Map object from google maps API
 *  @property {timeout} gmapRequestTimeout - used to track if the map has loaded or not
 *  @property {array} markers - contains all markers on the map, indexed by their location id
 *  @property {array} infowindows - contains all infowindows on the map, indexed by their location id
 */
var googleMap = {
	map: null,
	gmapRequestTimeout: null,
	markers: {},
	infowindows: {},

	/** @method initializes the map, centered around Santa Monica.
	 *  Fires a maploaded event when done.
	 */
	initMap: function() {
		googleMap.map = new google.maps.Map(document.getElementById('map'), {
		  center: {lat: 34.01945, lng: -118.49119},
		  zoom: 12
		});
		clearTimeout(googleMap.gmapRequestTimeout);
		$(document).trigger("maploaded");
	},

	/** @method adds a marker to the map, using location info
	 *  Fires a markerload event when done.
	 */
	addMarker: function (loc) {
		if(!googleMap.map){//wait for map to be initialized prior to adding marker.
			$(document).bind("maploaded",function(){
				googleMap.addMarker(loc);
			});
		}
		else {
			var info = "<div class='text-center'><h4>"+loc.name+"</h4><p>"+loc.description+"</p></div>";
			var infowindow = new google.maps.InfoWindow({
			    content: info
			  });
			var myLatlng = {lat:Number(loc.lat), lng: Number(loc.lng)};

			// used different icons based on Foursquare category
			var icon;
			switch (loc.category) {
				case 'Beach':
					icon = "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
					break;
				case 'Resort':
					icon = "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
					break;
				case 'Café':
					icon = "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png";
					break;
				default:
					icon = "http://maps.google.com/mapfiles/ms/icons/red-dot.png";
					break;
			}
			var marker = new google.maps.Marker({
				icon: icon,
			    position: myLatlng,
			    title:"Hello World!"
			});

			//open infoWindow onclick
			marker.addListener('click', function(){
				marker.setAnimation(google.maps.Animation.BOUNCE);
				setTimeout(function(){
			        marker.setAnimation(null);
			    },1400);
				infowindow.open(googleMap.map, marker);
			});
			marker.setMap(googleMap.map);
			googleMap.markers[loc.id] = marker;
			googleMap.infowindows[loc.id] = infowindow;
			$(document).trigger("markerload"+loc.id);
		}
	},

	/** @method shows all locations listed on map
	 *  @param {array} ids - list of location ids to show
	 */
	setLocations: function(ids){
		_.each(googleMap.markers,function(marker){
			marker.setMap(null);
		});
		ids.forEach(function(i){
			googleMap.markers[i].setMap(googleMap.map);
		});
	},

	/** @method shows all locations on map
	 */
	showAllMarkers: function(){
		_.each(googleMap.markers,function(marker){
			marker.setMap(googleMap.map);
		});
	},

	/** @method appends photos to infowindow
	 *	@param {string} id - ID of location
	 *	@param {object} photos - foursquare photo array - includes necessary info to get a picture
	 */
	addPhotos: function(id, photos){
		if(!googleMap.markers[id]){//wait for marker to initialize prior to adding marker
			$(document).bind("markerload"+id,function(){
				googleMap.addPhotos(id,photos);
			});
		}
		else {
			var content = $.parseHTML(googleMap.infowindows[id].getContent());
			_.each(photos.items, function(photo){
				//console.log(photo);	
				$(content).append('<img src ="'+photo.prefix+'200x100'+photo.suffix+'">');
			});
			googleMap.infowindows[id].setContent($(content).prop("outerHTML"));
		}
	},

	/** @method Opens infowindow
	 *	@param {string} id - ID of location
	 */
	showInfo: function(id){
		google.maps.event.trigger(googleMap.markers[id], 'click');
	}
};

$(document).ready(function () {
	//timeout if map doesn't load.
	googleMap.gmapRequestTimeout = setTimeout(function(){
        $('#map').text("Failed to get Google Map. Please check your connection.");
    },8000);
});