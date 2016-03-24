var Location = function(name, lat, lon, address, description, imgs){
	this.name = name;
	this.lat = lat;
	this.lon = lon;
	this.address = address;
	this.description = description;
	this.imgs = imgs; // array here
};
var LocationsMV = function(){
	
	var self = this;
	self.allLocations = ko.observableArray([]);
	self.allLocations.push(new Location('Hello','210 n','100 w','1359 Tustin Ranch, Tustin, CA 92780','Fake description here',[]));
	self.allLocations.push(new Location('goodbye','210 n','100 w','shilllt','2nd description description here',[]));
	self.allLocations.push(new Location('asdfads','210 n','100 w','1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
	self.allLocations.push(new Location('testing array shit','210 n','100 w','1359 Tustin Ranch, Tustin, CA 92780','3rd description here',[]));
	self.locations = ko.observableArray(self.allLocations());
	self.searchPhrase = ko.observable('');

	self.searchLocations = function(form){
		var filtered = _.filter(self.allLocations(), function(loc){
			return loc.name.toLowerCase().includes(self.searchPhrase().toLowerCase());
		});
		self.locations(filtered);
	};

	self.clearSearch = function(){
		self.searchPhrase('');
		self.locations(self.allLocations());
	}
};

ko.applyBindings(new LocationsMV());