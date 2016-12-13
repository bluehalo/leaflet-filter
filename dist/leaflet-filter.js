/*! @asymmetrik/leaflet-filter-1.0.0 - Copyright Asymmetrik, Ltd. 2007-2017 - All Rights Reserved.*/
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(factory((global.leafletD3 = global.leafletD3 || {})));
}(this, (function (exports) { 'use strict';

L.filterLocal = {
	filter: {
		toolbar: {
			actions: {
				title: 'Cancel drawing',
				text: 'Cancel'
			},
			buttons: {
				rectangle: 'Draw a bounding box filter',
				polygon: 'Draw a bounding polygon filter',
				circle: 'Draw a bounding circle filter',
				disabled: 'Filter already applied',
				clear: 'Clear current filter',
				clearDisabled: 'No active filter'
			}
		},
		handlers: {
			simpleshape: {
				tooltip: {
					end: 'Release mouse to finish drawing.'
				}
			},
			rectangle: {
				tooltip: {
					start: 'Click and drag to draw rectangle.'
				}
			},
			polyline: {
				tooltip: {
					start: 'Not used',
				}
			},
			polygon: {
				tooltip: {
					start: 'Click to draw polygon points.'
				}
			},
			circle: {
				tooltip: {
					start: 'Click and drag to draw circle.'
				}
			}
		}
	}
};

L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Polygon = L.Draw.Polygon.extend({

	statics: {
		TYPE: 'polygon'
	},

	includes: [ L.Mixin.Events ]

});

L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Circle = L.Draw.Circle.extend({

	statics: {
		TYPE: 'circle'
	},

	includes: [ L.Mixin.Events ]

});

L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Rectangle = L.Draw.Rectangle.extend({

	statics: {
		TYPE: 'rectangle'
	},

	includes: [ L.Mixin.Events ]

});

L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Clear = L.EditToolbar.Delete.extend({

	statics: {
		TYPE: 'clear'
	},

	includes: [ L.Mixin.Events ],

	// @method intialize(): void
	initialize: function (map, options) {
		L.EditToolbar.Delete.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Filter.Clear.TYPE;
	}


});

/**
 * Filter Control
 * This control utilizes the Leaflet Draw plugin, allowing users to draw one shape and firing events
 * when the filter state changes from filtered to not filtered based on the presence or absence of
 * a shape.
 *
 * L is defined by the Leaflet library, see git://github.com/Leaflet/Leaflet.git for documentation
 */
L.Control.Filter = L.Control.extend({

	options: {
		position: 'topleft',
		filter: {
			rectangle: {},
			polygon: {},
			circle: {},
			featureGroup: null
		}
	},

	initialize: function (options) {
		L.Control.prototype.initialize.call(this, options);

		// Initialize toolbars
		if (L.FilterToolbar && this.options.filter) {
			this._toolbar = new L.FilterToolbar(this.options.filter);
		}
	},

	onAdd: function (map) {
		var container = L.DomUtil.create('div', 'leaflet-draw'),
			topClassName = 'leaflet-draw-toolbar-top',
			toolbarContainer;

		toolbarContainer = this._toolbar.addToolbar(map);

		if (toolbarContainer) {
			// Add class to the first toolbar to remove the margin
			if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
				L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
			}
			container.appendChild(toolbarContainer);
		}

		// register for create events
		map.on('filter:created', this._filterCreatedHandler, this);
		map.on('filter:cleared', this._filterClearedHandler, this);

		return container;
	},

	onRemove: function (map) {
		// unregister create events
		map.off('filter:created', this._filterCreatedHandler, this);
		map.off('filter:cleared', this._filterClearedHandler, this);

		if (null != this._featureGroup) {
			// Unregister for the edit events
			this._featureGroup.shape.off('edit', this._filterUpdatedHandler, this);
		}

		this._toolbar.removeToolbar();
	},

	equals: function(shape1, shape2) {
		return this._toolbar.equals(shape1, shape2);
	},

	// Public method to programatically set the state of the filter
	setFilter: function(filter) {
		// Check to see if a change is being applied
		var shape1 = (null != this._featureGroup)? this._getGeo(this._featureGroup.type, this._featureGroup.shape) : undefined;

		// If there is no change, then we're just going to short circuit out of here
		if(this._toolbar.equals(shape1, filter)) {
			return;
		}

		var filterObject;
		if (null != filter) {
			// Ask the handler for the filter object
			filterObject = this._toolbar.setFilter(filter);
		}
		if (null != filterObject) {
			// Clear the old filter
			this._clearFilter(true);

			// Create the new filter
			this._createFilter(filterObject);
		}
		else {
			this._clearFilter();
		}
	},

	_createFilter: function(filter, suppressEvent) {
		//Add the created shape to the filter group
		this.options.featureGroup.addLayer(filter.layer);

		// Store the internal representation of the filter state
		this._featureGroup = { shape: filter.layer, type: filter.type };

		// Register for the edit events on the filter shape
		this._featureGroup.shape.on('edit', this._filterUpdatedHandler, this);

		// Fire the event that we've updated the filter
		if (!suppressEvent) { this._map.fire('filter:filter', { geo : this._getGeo(filter.type, filter.layer) }); }

		// Set the filtered state on the toolbar
		this._toolbar.setFiltered(true);
	},

	_clearFilter: function(suppressEvent) {
		// Remove the filter shape
		this.options.featureGroup.clearLayers();
		this._featureGroup = undefined;

		// Fire the event
		if (!suppressEvent) { this._map.fire('filter:filter', { geo: undefined }); }

		// Update the toolbar state
		this._toolbar.setFiltered(false);
	},

	_filterCreatedHandler: function(e) {
		this._createFilter({ type: e.layerType, layer: e.layer});
	},

	_filterUpdatedHandler: function() {
		// Only process updates when we have a stored filter shape
		if (null != this._featureGroup) {
			var payload = {
				geo: this._getGeo(this._featureGroup.type, this._featureGroup.shape)
			};
			// Only need to fire event - no need to update the toolbar
			this._map.fire('filter:filter', payload);
		}
	},

	_filterClearedHandler: function() {
		this._clearFilter();
	},

	_getGeo: function(layerType, layer) {
		return this._toolbar.getGeo(layerType, layer);
	},

	setFilteringOptions: function (options) {
		this._toolbar.setOptions(options);
	}
});

L.Map.mergeOptions({
	drawControlTooltips: true,
	filterControl: false
});

L.Map.addInitHook(function () {
	if (this.options.filterControl) {
		this.filterControl = new L.Control.Filter();
		this.addControl(this.filterControl);
	}
});

L.control.filter = function(options) {
	return new L.Control.Filter(options);
};

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
				// The two draw buttons are disabled when we are filtered
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
				// The two draw buttons are enabled when there are no filters
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

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=leaflet-filter.js.map
