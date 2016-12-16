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
- [Credits](#credits)


## Install 
Install the package and its peer dependencies via npm:
```
npm install leaflet
npm install leaflet-draw
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
* **filter:filter** A filter has been applied. The event object contains a ```geo``` field that has the geometry of the filter. This is meant to the be primary event, which fires when filters are created, modified, or removed.
* **filter:filterstart** A filter action has started. This could be when a user has activated one of the filter drawing tools or when a filter is programmtically applied.
* **filter:filterstop** A filter action has stopped. This is when the drawing activity is complete.
* **filter:cleared** A filter has been cleared using the delete button or by programmatically setting the filter to null.
* **filter:created** A filter has been created.

Examples:
```js
map.on('filter:filter', function (e) {
	// e.geo contains the actual geometry of the filter
	console.log({ type: 'filter:filter', event: e });
});
```


## Contribute
PRs accepted. If you are part of Asymmetrik, please make contributions on feature branches off of the ```develop``` branch. If you are outside of Asymmetrik, please fork our repo to make contributions.


## License
See LICENSE in repository for details.


## Credits
**[Leaflet](http://leafletjs.com/)** Is an awesome mapping package.
**[Leaflet Draw](https://github.com/Leaflet/Leaflet.draw)** Is an awesome extension to Leaflet that lets you draw shapes all over your maps.


[travis-url]: https://travis-ci.org/Asymmetrik/leaflet-filter/
[travis-image]: https://travis-ci.org/Asymmetrik/leaflet-filter.svg
