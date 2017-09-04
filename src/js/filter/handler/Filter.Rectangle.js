import 'leaflet';

L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Rectangle = L.Filter.SimpleShape.extend({
	statics: {
		TYPE: 'rectangle'
	},

	options: {
		enabled: true,
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
		this.type = L.Filter.Rectangle.TYPE;
		this._initialLabelText = L.filterLocal.filter.handlers.rectangle.tooltip.start;
		L.Filter.SimpleShape.prototype.initialize.call(this, map, options);
	},

	// Get the geo representation of the current filter box
	getGeo: function(layer) {
		return {
			type: 'rectangle',
			northEast: {
				lat: layer.getBounds()._northEast.lat,
				lng: layer.getBounds()._northEast.lng,
			},
			southWest: {
				lat: layer.getBounds()._southWest.lat,
				lng: layer.getBounds()._southWest.lng,
			}
		};
	},

	// Programmatic way to draw a filter rectangle (bit of a hack)
	setFilter: function(filter) {
		this._startLatLng = filter.northEast;

		var shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, filter.southWest), this.options.shapeOptions);
		return { type: 'rectangle', 'layer': shape };
	},

	equals: function(shape1, shape2) {
		if(shape1.type != shape2.type) {
			return false;
		}

		return (shape1.northEast.lat === shape2.northEast.lat &&
				shape1.northEast.lng === shape2.northEast.lng &&
				shape1.southWest.lat === shape2.southWest.lat &&
				shape1.southWest.lng === shape2.southWest.lng);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		}
		else {
			this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
		}

		return { type: 'rectangle', layer: this._shape };
	},

	_fireCreatedEvent: function () {
		var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
		L.Filter.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
	},

	_getTooltipText: function () {
		var tooltipText = L.Filter.SimpleShape.prototype._getTooltipText.call(this);
		var shape = this._shape;
		var latLngs, bounds, area, subtext;

		if (shape) {
			bounds = this._shape.getBounds();
			latLngs = [
				bounds.getNorthWest(),
				bounds.getNorthEast(),
				bounds.getSouthEast(),
				bounds.getSouthWest()
			];

			area = L.GeometryUtil.geodesicArea(latLngs) / 4 * Math.PI;
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}

});
