L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Polygon = L.Filter.Polyline.extend({
	statics: {
		TYPE: 'polygon'
	},

	Poly: L.Polygon,

	options: {
		enabled: true,
		showArea: false,
		shapeOptions: {
			stroke: true,
			color: '#f06eaa',
			weight: 4,
			opacity: 0.5,
			fill: true,
			fillColor: null, //same as color by default
			fillOpacity: 0.2,
			clickable: true,
			editable: true
		},
		metric: true // Whether to use the metric meaurement system or imperial
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Filter.Polygon.TYPE;

		L.Filter.Polyline.prototype.initialize.call(this, map, options);

		this._initialLabelText = L.filterLocal.filter.handlers.polygon.tooltip.start;
		this._endLabelText = L.filterLocal.filter.handlers.polygon.tooltip.end;
	},

	// Programmatic way to draw a filter rectangle (bit of a hack)
	setFilter: function(filter) {

		// Create a poly and return it
		var poly = new L.Polygon(filter.latlngs, this.options.shapeOptions);
		return { type: 'polygon', layer: poly };

	},

	equals: function(shape1, shape2) {
		if(shape1.type != shape2.type) {
			return false;
		}

		// maintain order of nested arrays by serializing to a string, then comparing
		var shape1LatLng = JSON.stringify(shape1.latlngs),
			shape2LatLng = JSON.stringify(shape2.latlngs);

		return (shape1LatLng == shape2LatLng);
	},

	// Get the geo representation of the current filter box
	getGeo: function(layer) {

		return {
			type: 'polygon',
			latlngs: layer.getLatLngs()
		};

	},

	_drawShape: function (latlngs) {
		if (!this._poly) {
			this._poly = new L.Polygon(latlngs, this.options.shapeOptions);
			this._map.addLayer(this._poly);
		}
		else {
			this._poly.setLatLngs(latlngs);
		}

		return { type: 'polygon', layer: this._poly };
	},

	_fireCreatedEvent: function () {
		var polygon = new L.Polygon(this._poly.getLatLngs(), this.options.shapeOptions);
		L.Filter.Polyline.prototype._fireCreatedEvent.call(this, polygon);
	},

	_getTooltipText: function () {
		var tooltipText = L.Filter.Polyline.prototype._getTooltipText.call(this),
			shape = this._poly,
			latLngs, area, subtext;

		if (shape) {
			latLngs = shape.getLatLngs();
			area = L.GeometryUtil.geodesicArea(latLngs);
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	},

	_updateFinishHandler: function () {
		var markerCount = this._markers.length;

		// The first marker should have a click handler to close the polygon
		if (markerCount === 1) {
			this._markers[0].on('click', this._finishShape, this);
		}

		// Add and update the double click handler
		if (markerCount > 2) {
			this._markers[markerCount - 1].on('dblclick', this._finishShape, this);
			// Only need to remove handler if has been added before
			if (markerCount > 3) {
				this._markers[markerCount - 2].off('dblclick', this._finishShape, this);
			}
		}
	},

	_getMeasurementString: function () {
		var area = this._area;

		if (!area) {
			return null;
		}

		return L.GeometryUtil.readableArea(area, this.options.metric);
	},

	_shapeIsValid: function () {
		return this._markers.length >= 3;
	},

	_vertexChanged: function (latlng, added) {
		var latLngs;

		// Check to see if we should show the area
		if (!this.options.allowIntersection && this.options.showArea) {
			latLngs = this._poly.getLatLngs();

			this._area = L.GeometryUtil.geodesicArea(latLngs);
		}

		L.Filter.Polyline.prototype._vertexChanged.call(this, latlng, added);
	},

	_cleanUpShape: function () {
		var markerCount = this._markers.length;

		if (markerCount > 0) {
			this._markers[0].off('click', this._finishShape, this);

			if (markerCount > 2) {
				this._markers[markerCount - 1].off('dblclick', this._finishShape, this);
			}
		}
	}

});
