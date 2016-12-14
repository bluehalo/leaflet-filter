L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Circle = L.Filter.SimpleShape.extend({
	statics: {
		TYPE: 'circle'
	},

	options: {
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
		showRadius: true,
		metric: true // Whether to use the metric meaurement system or imperial
	},

	initialize: function (map, options) {
		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Filter.Circle.TYPE;
		this._initialLabelText = L.filterLocal.filter.handlers.circle.tooltip.start;
		L.Filter.SimpleShape.prototype.initialize.call(this, map, options);
	},

	// Get the geo representation of the current filter box
	getGeo: function(layer) {
		var center = layer.getLatLng();
		var radius = layer.getRadius();
		return {
			type: 'circle',
			center: center,
			radius: radius
		};
	},

	// Programmatic way to draw a filter circle
	setFilter: function(filter) {
		// Set startLatLng so edits remember the starting point
		this._startLatLng = filter.center;

		// We don't need to add the circle since it's only added while editing. In this case, we just create a shape and return it
		var shape = new L.Circle(filter.center, filter.radius, this.options.shapeOptions);

		return { type: 'circle', 'layer': shape };
	},

	equals: function(shape1, shape2) {
		if(shape1.type != shape2.type) {
			return false;
		}

		return (shape1.center.lat === shape2.center.lat &&
				shape1.center.lng === shape2.center.lng &&
				shape1.radius === shape2.radius);
	},

	_drawShape: function (latlng) {
		if (!this._shape) {
			this._shape = new L.Circle(this._startLatLng, this._startLatLng.distanceTo(latlng), this.options.shapeOptions);
			this._map.addLayer(this._shape);
		}
		else {
			this._shape.setRadius(this._startLatLng.distanceTo(latlng));
		}
		return { type: 'circle', layer: this._shape };
	},

	_fireCreatedEvent: function () {
		var circle = new L.Circle(this._shape.getLatLng(), this._shape.getRadius(), this.options.shapeOptions);
		L.Filter.SimpleShape.prototype._fireCreatedEvent.call(this, circle);
	},

	_getTooltipText: function () {
		var tooltipText = L.Filter.SimpleShape.prototype._getTooltipText.call(this),
			shape = this._shape,
			latLngs, area, subtext;

		if (shape) {
			latLngs = this._shape.getBounds();
			area = L.GeometryUtil.geodesicArea(latLngs) / 4 * Math.PI;
			subtext = L.GeometryUtil.readableArea(area, this.options.metric);
		}

		return {
			text: tooltipText.text,
			subtext: subtext
		};
	}

});
