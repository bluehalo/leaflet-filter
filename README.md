# Leaflet Filter Plugin

[![Build Status][travis-image]][travis-url]

## What is it?
This is a Leaflet plugin that leverages the Leaflet.draw plugin to allow you to draw a single rectangle bounding box filter on a map.
You can only draw one bounding box at a time and you can clear the filter by clicking on the trash can icon. Additionally, you can subscribe to an event that is fired each time the filter is created/modified/destroyed.

## How do I use it?

```js
// First create a layer onto which the filter geometry will be drawn and add it to the map
var drawnItems = new L.FeatureGroup();
map.addLayer(drawnItems);

// Create the filter control with its configuration and add to the map
var control = new L.Control.Filter({
	position: 'topright',
	filter: {
		rectangle: {}
	},
	filterGroup: drawnItems
});
map.addControl(control);

// Register for the filter event and do something!
map.on('filter:filter', function (e) {
	console.log(e);
});

```

If you would like to use this plugin with the [Angular Leaflet Directive](https://github.com/tombatossals/angular-leaflet-directive), use the [Angular Directive Extension project](https://github.com/Asymmetrik/angular-leaflet-directive-ext)

## How do I include this plugin in my project?
The easiest way to include this plugin in your project, use [Bower](http://bower.io)

```bash
bower install -S leaflet-filter
```

Alternatively, you can download the source or minified javascript files yourself from the GitHub repository (they are contained in the dist directory).

Alter-alternatively, you can clone this repo and build it yourself.

## How do I build this project?
There are several tools you will need to install to build this project:
* [Node](http://nodejs.org/)
* [Gulp](http://http://gulpjs.com/)
* [Bower](http://bower.io)

If you're on Mac OS, check out [Homebrew](https://github.com/mxcl/homebrew) to get node up and running easily. It's as simple as `brew install node`

First, you will need to install the build dependencies for the project using node. If you want to use the examples, you will need to install the javascript dependencies for the project using bower. Finally, to build the project and generate the artifacts in the /dist directory, you will need to build the project using gulp. 

```bash
npm install
bower install
gulp
```

## Credits


[travis-url]: https://travis-ci.org/Asymmetrik/leaflet-filter/
[travis-image]: https://travis-ci.org/Asymmetrik/leaflet-filter.svg
