(function(){
	"use strict";

	L.Control.Filter = L.Control.extend({

		options: {
			position: 'topleft',
			filter: {}
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
				addedTopClass = false,
				topClassName = 'leaflet-draw-toolbar-top',
				toolbarContainer;

			toolbarContainer = this._toolbar.addToolbar(map);
	
			if (toolbarContainer) {
				// Add class to the first toolbar to remove the margin
				if (!addedTopClass) {
					if (!L.DomUtil.hasClass(toolbarContainer, topClassName)) {
						L.DomUtil.addClass(toolbarContainer.childNodes[0], topClassName);
					}
					addedTopClass = true;
				}
				container.appendChild(toolbarContainer);
			}

			// register for create events
			map.on('filter:created', this._filterCreated, this);
			map.on('filter:cleared', this._filterCleared, this);

			return container;
		},

		onRemove: function (map) {
			// unregister create events
			map.off('filter:created', this._filterCreated, this);
			map.off('filter:cleared', this._filterCleared, this);

			if (null != this._filterGroup) {
				// Unregister for the edit events
				this._filterGroup.shape.off('edit', this._filterUpdated, this);
			}

			this._toolbar.removeToolbar();
		},

		_filterCreated: function(e){
			//Add the created shape to the filter group
			this.options.filterGroup.addLayer(e.layer);

			// Store the internal representation of the filter state
			this._filterGroup = { shape: e.layer, type: e.layerType };

			// Register for the edit events on the filter shape
			this._filterGroup.shape.on('edit', this._filterUpdated, this);

			// Fire the event that we've updated the filter
			this._map.fire('filter:filter', { geo : this._getGeo(e.layerType, e.layer) });

			// Set the filtered state on the toolbar
			this._toolbar.setFiltered(true);
		},

		_filterUpdated: function(){
			// Only process updates when we have a stored filter shape
			if(null != this._filterGroup){
				var payload = {
					geo: this._getGeo(this._filterGroup.type, this._filterGroup.shape)
				};
				// Only need to fire event - no need to update the toolbar
				this._map.fire('filter:filter', payload);
			}
		},

		_filterCleared: function(){
			// Remove the filter shape
			this.options.filterGroup.clearLayers();

			// Fire the event
			this._map.fire('filter:filter', { geo: undefined });

			// Update the toolbar state
			this._toolbar.setFiltered(false);
		},

		_getGeo: function(layerType, layer){
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

})();