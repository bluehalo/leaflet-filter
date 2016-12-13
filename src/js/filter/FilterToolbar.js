L.FilterToolbar = L.DrawToolbar.extend({

	statics: {
		TYPE: 'filter'
	},

	options: {
		polygon: {},
		rectangle: {},
		circle: {}
	},

	initialize: function (options) {
		L.DrawToolbar.prototype.initialize.call(this, options);
		this._toolbarClass = 'leaflet-draw-draw';
	},

	getModeHandlers: function (map) {
		return [
			{
				enabled: this.options.polygon,
				handler: new L.Filter.Polygon(map, this.options.polygon),
				title: L.drawLocal.draw.toolbar.buttons.polygon
			},
			{
				enabled: this.options.rectangle,
				handler: new L.Filter.Rectangle(map, this.options.rectangle),
				title: L.drawLocal.draw.toolbar.buttons.rectangle
			},
			{
				enabled: this.options.circle,
				handler: new L.Filter.Circle(map, this.options.circle),
				title: L.drawLocal.draw.toolbar.buttons.circle
			},
			{
				enabled: true,
				handler: new L.Filter.Clear(map, { featureGroup: this.options.featureGroup }),
				title: L.drawLocal.draw.toolbar.buttons.circle
			}
		];
	},

	// Get the actions part of the toolbar
	getActions: function (handler) {
		return L.DrawToolbar.prototype.getActions(handler);
	},

	setOptions: function (options) {
		L.DrawToolbar.prototype.setOptions(options);
	},

	addTo: function (map) {
		var container = map.addToolbar(this);
		this.setFiltered(false);
		return container;
	},

	setFiltered: function(filtered) {
		var type;

		if (filtered) {
			for (type in this._modes) {
				// The draw buttons are disabled when we are filtered
				L.DomUtil.addClass(this._modes[type].button, 'leaflet-disabled');
				this._modes[type].button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.disabled);
				this._modes[type].handler.lock();
			}

			// Clear button is enabled
			L.DomUtil.removeClass(this._modes.clear.button, 'leaflet-disabled');
			this._modes.clear.button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.clear);
			this._modes.clear.handler.unlock();

		}
		else {
			for (type in this._modes) {
				// The draw buttons are enabled when there are no filters
				L.DomUtil.removeClass(this._modes[type].button, 'leaflet-disabled');
				this._modes[type].button.setAttribute('title', L.filterLocal.filter.toolbar.buttons[type]);
				this._modes[type].handler.unlock();
			}

			// Clear button is disabled
			L.DomUtil.addClass(this._modes.clear.button, 'leaflet-disabled');
			this._modes.clear.button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.clearDisabled);
			this._modes.clear.handler.lock();
		}
	},

	setFilter: function(filter) {
		if (null != this._modes[filter.type]) {
			return this._modes[filter.type].handler.setFilter(filter);
		}
		else {
			console.error('Unsupported filter type: ' + filter.type);
		}
	},

	getGeo: function(layerType, layer) {
		return this._modes[layerType].handler.getGeo(layer);
	},

	equals: function(shape1, shape2) {
		if (shape1 == null || shape1.type == null) {
			shape1 = null;
		}
		if (shape2 == null || shape2.type == null) {
			shape2 = null;
		}

		if (shape1 == null && shape2 == null) {
			return true;
		}
		else if (shape1 == null || shape2 == null) {
			return false;
		}

		return this._modes[shape1.type].handler.equals(shape1, shape2);
	}

});
