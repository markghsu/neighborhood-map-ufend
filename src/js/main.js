/** @constructor
 *  @description represents a location and associated data, as returned by foursquare API
 *	@property {string} id - Foursquare venue id. This is unique.
 *  @property {string} name - Location name, pulled from Foursquare.
 *  @property {number} lat - Latitude of location
 *  @property {number} lng - Longitude of location
 *  @property {string} address - Address of location
 *  @property {string} description - Description of location
 *  @property {string} category - Category of location per Foursquare. Used to choose map marker
 *  @property {array} imgs - Array of images, in format returned by Foursquare
 */
var Location = function(id, name, lat, lng, address, description, category, imgs){
	this.id = id//_.uniqueId(); now using foursquare venue ids
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.address = address;
	this.description = description;
	this.category = category;
	this.imgs = imgs; // array here
};

/** @method Opens the google maps infoWindow associated with the list.
 */
Location.prototype.openInfo = function(){
		googleMap.showInfo(this.id);
	}

/** @description KO ModelView controlling all non-map functions
 *	@property {array} allLocations - contains all locations returned by foursquare
 *	@property {array} locations - contains all locations currently displayed on map/list (after filter is applied)
 *	@property {string} searchPhrase - string to filter through names/descriptions.
 */
var LocationsMV = function(){
	
	var self = this;
	self.allLocations = ko.observableArray([]);
	self.locations = ko.observableArray([]);
	self.searchPhrase = ko.observable('');

	if(!localStorage.locations) {
		localStorage.locations = JSON.stringify([]);
	}

	var foursquareURL = "https://api.foursquare.com/v2/venues/explore?";
	var clientid = "client_id=SATQVTWJMMSVYMQXT5F2DHYONKZEAH42NFYLOQEGPKSU4MTZ&client_secret=GCO1VDDV2GJGEGS4DAWSCXQIOMRGGCQIL4CMQOUKJFUMWFX2&v=20160323";
	var exploreParams ="&near=santa%20monica&query=surfing";
	var pictureURL = "https://api.foursquare.com/v2/venues/";

	//use foursquare explore API to find surf sites near Santa Monica
	$.getJSON(foursquareURL+clientid+exploreParams).done(function(data){
		var items = data.response.groups[0].items;
		_.each(items, function(item){
			var venue = item.venue;
			var name = venue.name;
			var lat = venue.location.lat;
			var lng = venue.location.lng;
			var address = venue.location.formattedAddress[0];
			var description = item.tips[0].text;
			var category = venue.categories[0].name;
			var loc = new Location(venue.id, name, lat, lng, address, description, category);
			self.allLocations.push(loc);
			self.locations.push(loc);

			//load pictures in background -- if this fails, don't add photos
			$.getJSON(pictureURL+venue.id+"/photos?"+clientid+"&limit=6").done(function(data){
				var photos = data.response.photos;
				self.allLocations().find(function(l){
					return l.id === venue.id;
				}).imgs = photos;

				//show photos in infowindow
				googleMap.addPhotos(venue.id, photos);

				localStorage.locations = JSON.stringify(self.allLocations());
			});
		});
		localStorage.locations = JSON.stringify(self.allLocations());
		self.allLocations().forEach(googleMap.addMarker);
	})
	.fail(function() {
		$('header').append("<div class='alert alert-warning col-md-12' role='alert'>Error, couldn't connect to Foursquare API. Results may not be up to date.</div>");
		self.allLocations(JSON.parse(localStorage.locations));
		self.allLocations().forEach(googleMap.addMarker);
		self.locations = ko.observableArray(self.allLocations());
	});

	/** @method Filter through all locations so only those with name/description appear. 
	 */
	self.searchLocations = function(form){
		var filtered = _.filter(self.allLocations(), function(loc){
			var lower = self.searchPhrase().toLowerCase();
			return loc.name.toLowerCase().includes(lower) || loc.description.toLowerCase().includes(lower);
		});
		self.locations(filtered);
		googleMap.setLocations(_.pluck(filtered,'id'));
	};

	/** @method Clear the search bar, show all locations again.
	 */
	self.clearSearch = function(){
		self.searchPhrase('');
		self.locations(self.allLocations());
		googleMap.showAllMarkers();
	}

};

$(document).ready(function(){
	ko.applyBindings(new LocationsMV());
});
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
// Used to toggle offcanvas sidebar
$(document).ready(function () {
  $('[data-toggle="offcanvas"]').click(function () {
    $('.row-offcanvas').toggleClass('active')
  });
});