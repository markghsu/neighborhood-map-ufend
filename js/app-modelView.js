

var Location = function(name, lat, lng, address, description, imgs){
	this.id = _.uniqueId();
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.address = address;
	this.description = description;
	this.imgs = imgs; // array here
	this.openInfo = function(){
		
		showInfo(this.id);
	}
};

//use foursquare api

var LocationsMV = function(){
	
	var self = this;
	self.allLocations = ko.observableArray([]);
	self.locations = ko.observableArray([]);
	self.searchPhrase = ko.observable('');

	if(!localStorage.locations) {
		localStorage.locations = JSON.stringify([]);
	}

	//load locations from API
	var myURL = "https://api.foursquare.com/v2/venues/explore?client_id=SATQVTWJMMSVYMQXT5F2DHYONKZEAH42NFYLOQEGPKSU4MTZ&client_secret=GCO1VDDV2GJGEGS4DAWSCXQIOMRGGCQIL4CMQOUKJFUMWFX2&v=20160323&near=santa%20monica&query=surfing";
	$.getJSON(myURL).done(function(data){
		var items = data.response.groups[0].items;
		_.each(items, function(item){
			var venue = item.venue;
			var name = venue.name;
			var lat = venue.location.lat;
			var lng = venue.location.lng;
			var address = venue.location.formattedAddress[0];
			var description = item.tips[0].text;
			var loc = new Location(name, lat, lng, address, description);
			self.allLocations.push(loc);
			self.locations.push(loc);
			//load pictures in background rather than immediately?
		});
		localStorage.locations = JSON.stringify(self.allLocations());
		self.allLocations().forEach(addMarker);
		//self.locations = ko.observableArray(self.allLocations());
	})
	.fail(function() {
		$('header').append("<div class='alert alert-warning col-md-12' role='alert'>Error, couldn't connect to Foursquare API. Results may not be up to date.</div>");
		console.log("Error, couldn't connect to API.");
		self.allLocations(JSON.parse(localStorage.locations));
		self.allLocations().forEach(addMarker);
		self.locations = ko.observableArray(self.allLocations());
//		self.allLocations.push(new Location('Hello',-34.397,150.644,'1359 Tustin Ranch, Tustin, CA 92780','Fake description here',[]));
//		self.allLocations.push(new Location('goodbye',-34.3,150,'shilllt','2nd description description here',[]));
//		self.allLocations.push(new Location('asdfads',-34.2,150.4,'1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
//		self.allLocations.push(new Location('testing array shit',-34.67,150.7,'1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
		//localStorage.locations = JSON.stringify(self.allLocations());
	});

	self.searchLocations = function(form){
		var filtered = _.filter(self.allLocations(), function(loc){
			return loc.name.toLowerCase().includes(self.searchPhrase().toLowerCase());
		});
		self.locations(filtered);
		setLocations(_.pluck(filtered,'id'));
	};

	self.clearSearch = function(){
		self.searchPhrase('');
		self.locations(self.allLocations());
		showAllMarkers();
	}

};

$(document).ready(function(){
	ko.applyBindings(new LocationsMV());
});