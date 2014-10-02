(function(){
	"use strict";

	L.Filter = L.Filter || {};

	L.Filter.Rectangle = L.Filter.SimpleShape.extend({
		statics: {
			TYPE: 'rectangle'
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
			metric: true // Whether to use the metric meaurement system or imperial
		},

		initialize: function (map, options) {
			// Save the type so super can fire, need to do this as cannot do this.TYPE :(
			this.type = L.Filter.Rectangle.TYPE;
			this._initialLabelText = L.filterLocal.filter.handlers.rectangle.tooltip.start;
			L.Filter.SimpleShape.prototype.initialize.call(this, map, options);
		},

		getGeo: function(layer){
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

		_drawShape: function (latlng) {
			if (!this._shape) {
				this._shape = new L.Rectangle(new L.LatLngBounds(this._startLatLng, latlng), this.options.shapeOptions);
				this._map.addLayer(this._shape);
			} else {
				this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
			}
		},

		_fireCreatedEvent: function () {
			var rectangle = new L.Rectangle(this._shape.getBounds(), this.options.shapeOptions);
			L.Filter.SimpleShape.prototype._fireCreatedEvent.call(this, rectangle);
		},

		_getTooltipText: function () {
			var tooltipText = L.Filter.SimpleShape.prototype._getTooltipText.call(this),
				shape = this._shape,
				latLngs, area, subtext;

			if (shape) {
				latLngs = this._shape.getLatLngs();
				area = L.GeometryUtil.geodesicArea(latLngs);
				subtext = L.GeometryUtil.readableArea(area, this.options.metric);
			}

			return {
				text: tooltipText.text,
				subtext: subtext
			};
		}

	});

})();