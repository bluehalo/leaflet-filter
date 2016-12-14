# @asymmetrik/leaflet-filter

[![Build Status][travis-image]][travis-url]

> Leaflet plugin that leverages the Leaflet.draw plugin to allow you to draw a single shape-based filter on a map.
> You can only draw one filter at a time and you can clear the filter by clicking on the trash can icon. Additionally, you can subscribe to an event that is fired each time the filter is created/modified/destroyed.
> This plugin supprots Leaflet v1.0.x and requires Leaflet Draw 0.4.x

## Table of Contents
- [Install](#install)
- [Usage](#usage)
- [API](#api)
- [Contribute](#contribute)
- [License](#license)


## Install 
Install the package via npm:
```
npm install @asymmetrik/leaflet-filter
```

## Usage
You will need to include both the styles and JavaScript for this project. Dependencies include Font Awesome, Leaflet, and Leaflet-draw. See below for an example.

```html
<link rel="stylesheet" href="node_modules/font-awesome/css/font-awesome.css" />
<link rel="stylesheet" href="node_modules/leaflet/dist/leaflet.css" />
<link rel="stylesheet" href="node_modules/leaflet-draw/dist/leaflet.draw-src.css" />

<link rel="stylesheet" href="dist/leaflet-filter.css" />

<script src="node_modules/leaflet/dist/leaflet-src.js"></script>
<script src="node_modules/leaflet-draw/dist/leaflet.draw-src.js"></script>

<script src="dist/leaflet-filter.js"></script>
```

The primary method of interacting with the plugin is via the ```L.Control.Filter``` control.

### Basic Example
A basic example simply involves adding the filter control to the map and registering for the filter-specific events.

```js
var drawnItems = L.featureGroup();
drawnItems.addTo(map);

var control = L.control.filter({
	position: 'topright',
	filter: {
		rectangle: {},
		polygon: {},
		circle: {},
	},
	featureGroup: drawnItems
});
control.addTo(map);

map.on('filter:filter', function (e) {
	console.log(e);
});
```

### Programmatic Example
You can also programmatically alter the filter state.

```js
var drawnItems = L.featureGroup();
drawnItems.addTo(map);

var control = new L.control.filter({
	position: 'topright',
	filter: {
		circle: {}
	},
	featureGroup: drawnItems
});

control.addTo(map);

map.on('filter:filter', function (e) {
	console.log(e);
});

control.setFilter({
	type: 'circle',
	center: [ 38.991709, -76.886109 ],
	radius: 40000
});
```

## API

### Filter Control Creation
To create the filter control, use the factory method.

```js
var control = L.control.filter(options);
```

And add it to the map

```js
control.addTo(map);
```

### Configuration
The Filter Control options extend the standard control options.

Example:
```js
var options = {
	position: 'topright',
	filter: {
		rectangle: {},
		polygon: {},
		circle: {},
	},
	featureGroup: drawnItems
};
var control = L.control.filter(options);
```

#### featureGroup (required)
You must provide a featureGroup layer to the plugin. This is the layer in which the plugin will place all drawn filter shapes. You must add the feature group to the map yourself.

```js
var featureGroup = L.featureGroup();
featureGroup.addTo(map);

var control = L.control.filter({
	featureGroup: featureGroup
});
```

#### position
Determines the position on the map where the control will be placed.

Possible values: 'topright' | **'topleft'** | 'bottomleft' | 'bottomright'


#### filter
Used to configure the various filter types.

Possible properties: **circle** | **rectangle** | **polygon**

If you omit the filter object entirely, all filter types will be enabled by default.

```js
// All filter types enabled
var options = {
	position: 'topright',
	featureGroup: drawnItems
};
```

Alternatively, if you only specify a subset of the filter types, only those specified will be enabled.

```js
// Only circle and rectangle are enabled
var options = {
	position: 'topright',
	filter: {
		circle: {},
		rectangle: {}
	},
	featureGroup: drawnItems
};
```

### Interaction
Users can interact directly with the controls to create and manipulate the state of the filters. The creation/modification/deletion of filters is propagated using events. Filters can also be created and cleared programmatically.

#### setFilter(shape)

```js
// Circle shape
control.setFilter({
	type: 'circle',
	center: [ 38.991709, -76.886109 ],
	radius: 40000
});
```

```js
// Rectangle shape
control.setFilter({
	type: 'rectangle',
	northEast: { lat: 39, lng: -76 },
	southWest: { lat: 38, lng: -77 }
});
```

```js
// Polygon shape
control.setFilter({
	type: 'polygon',
	latlngs: [
		[ 39, -77 ],
		[ 40, -76 ],
		[ 38, -76 ],
		[ 39, -77 ]
	]
});
```

#### Events
Register for filter state events on the map object.

* **filter:filterstart** A filter action has started. This could be when a user has activated one of the filter drawing tools or when a filter is programmtically applied.
* **filter:filter** A filter has been applied. The event object contains a ```geo``` field that has the geometry of the filter.
* **filter:filterstop** A filter action has stopped. This is when the drawing activity is complete.
* **filter:cleared** A filter has been cleared using the delete button or by programmatically setting the filter to null.

Examples:
```js
map.on('filter:filter', function (e) {
	// e.geo contains the actual geometry of the filter
	console.log({ type: 'filter:filter', event: e });
});

map.on('filter:clear', function (e) {
	console.log({ type: 'filter:clear', event: e });
});

map.on('filter:filterstart', function (e) {
	console.log({ type: 'filter:filterstart', event: e });
});

map.on('filter:filterstop', function (e) {
	console.log({ type: 'filter:filterstop', event: e });
});
```


## Contribute
PRs accepted. If you are part of Asymmetrik, please make contributions on feature branches off of the ```develop``` branch. If you are outside of Asymmetrik, please fork our repo to make contributions.


## License
See LICENSE in repository for details.


## How do I use it?


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
