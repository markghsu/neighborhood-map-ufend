# Front-End Nanodegree - P6.1: Neighborhood Map
This webpage queries the Foursquare API in order to find surf spots near Santa Monica, CA. It plots these locations using the Google Maps Javascript API (v3). This app was built using KnockoutJS as a framework. This project was created for the Udacity Front-End Web Developer Nanodegree.

##Running the App
To run this app, open the dist/index.html webpage in a browser. You can use the "Search" input to filter locations. Note that this does not re-query the API, it only searches from locations already on the page. Clicking on either the markers on the map or the location in the list will open the infowindow on the map over the marker, which contains a name, description, and images of the location.

##Building the App
Run the default gulp task, which will build a production version of this webpage in the "dist" folder. It will also keep a watch on existing files to rebuild when they are changed.

##Future Todo
- Add loading for more locations/searching through API.
- Update to pull information from other API - e.g. Yelp, Google StreetView