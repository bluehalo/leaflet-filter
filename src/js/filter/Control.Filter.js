L.Control.Filter = L.Control.extend({

	options: {
		position: 'topleft',
		filter: {
			rectangle: {},
			polygon: {},
			circle: {}
		}
	},

	initialize: function (options) {
		L.Control.prototype.initialize.call(this, options);

		if (null == options.featureGroup || !(options.featureGroup instanceof L.FeatureGroup)) {
			throw new Error('options.featureGroup must be an L.FeatureGroup');
		}

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

		if (null != this._filterState) {
			// Unregister for the edit events
			this._filterState.shape.off('edit', this._filterUpdatedHandler, this);
		}

		this._toolbar.removeToolbar();
	},

	equals: function(shape1, shape2) {
		return this._toolbar.equals(shape1, shape2);
	},

	// Public method to programatically set the state of the filter
	setFilter: function(filter, options) {

		// Default the options
		options = options || { suppressEvents: false, fitBounds: false };

		// Check to see if a change is being applied
		var shape = (null != this._filterState)?
			this._getGeo(this._filterState.type, this._filterState.shape)
			: undefined;

		// If there is no change, then we're just going to short circuit out of here
		if(this._toolbar.equals(shape, filter)) {
			return;
		}

		if(null != filter) {
			// Clear the old filter
			this._clearFilter(true);

			// Ask the handler for the filter object
			var filterObject = this._toolbar.setFilter(filter, options.suppressEvents);

			// Create the new filter
			this._createFilter(filterObject, options.suppressEvents);
			if(options.fitBounds) {
				this._map.fitBounds(filterObject.layer.getBounds());
			}

		}
		else {
			this._clearFilter();
		}

		return this;
	},

	/**
	 * Programatically set the filtered state of the toolbar. This should only be
	 * used if you want to override the behavior of the control. All this will do
	 * is change the enabled state of the various controls. It will not change the
	 * filter state.
	 */
	setFiltered: function(filtered) {
		this._toolbar.setFiltered(filtered);

		return this;
	},

	/**
	 * Fitbounds on the currently applied filter (if cleared, does nothing)
	 */
	fitBounds: function(options) {
		if(null != this._filterState) {
			this._map.fitBounds(this.options.featureGroup.getBounds(), options);
		}
		return this;
	},

	_createFilter: function(filter, suppressEvent) {
		//Add the created shape to the filter group
		this.options.featureGroup.addLayer(filter.layer);

		// Store the internal representation of the filter state
		this._filterState = { shape: filter.layer, type: filter.type };

		// Register for the edit events on the filter shape
		this._filterState.shape.on('edit', this._filterUpdatedHandler, this);

		// Fire the event that we've updated the filter
		if(!suppressEvent) {
			this._map.fire('filter:filter', { geo : this._getGeo(filter.type, filter.layer) });
		}

		// Set the filtered state on the toolbar
		this._toolbar.setFiltered(true);
	},

	_clearFilter: function(suppressEvent) {
		// Remove the filter shape
		try {
			this.options.featureGroup.clearLayers();
		}
		catch (err) {
			// suppress circle remove error
		}

		this._filterState = undefined;

		// Fire the event
		if(!suppressEvent) { this._map.fire('filter:filter', { geo: undefined }); }

		// Update the toolbar state
		this._toolbar.setFiltered(false);
	},

	_filterCreatedHandler: function(e) {
		this._createFilter({ type: e.layerType, layer: e.layer});
	},

	_filterUpdatedHandler: function() {
		// Only process updates when we have a stored filter shape
		if(null != this._filterState) {
			var payload = {
				geo: this._getGeo(this._filterState.type, this._filterState.shape)
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
	drawControlTooltips: false,
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
