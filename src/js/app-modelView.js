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