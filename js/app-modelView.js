
var Location = function(name, lat, lng, address, description, imgs){
	this.id = _.uniqueId();
	this.name = name;
	this.lat = lat;
	this.lng = lng;
	this.address = address;
	this.description = description;
	this.imgs = imgs; // array here
};
var LocationsMV = function(){
	
	var self = this;
	self.allLocations = ko.observableArray([]);

	if(!localStorage.locations) {
		localStorage.locations = JSON.stringify([]);
	}

	//load locations from API
	if(false){

	}
	else {
		console.log("Error, couldn't connect to API.");
//		self.allLocations(JSON.parse(localStorage.locations));
		self.allLocations.push(new Location('Hello',-34.397,150.644,'1359 Tustin Ranch, Tustin, CA 92780','Fake description here',[]));
		self.allLocations.push(new Location('goodbye',-34.3,150,'shilllt','2nd description description here',[]));
		self.allLocations.push(new Location('asdfads',-34.2,150.4,'1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
		self.allLocations.push(new Location('testing array shit',-34.67,150.7,'1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
		localStorage.locations = JSON.stringify(self.allLocations());
		self.allLocations().forEach(addMarker);
	}
	
	self.locations = ko.observableArray(self.allLocations());
	self.searchPhrase = ko.observable('');

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