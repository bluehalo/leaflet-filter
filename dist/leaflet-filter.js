/*! leaflet-filter Version: 0.2.4 */
(function(){
	"use strict";

	L.FontAwesomeToolbar = L.Class.extend({
		includes: [L.Mixin.Events],

		initialize: function (options) {
			L.setOptions(this, options);

			this._modes = {};
			this._actionButtons = [];
			this._activeMode = null;
		},

		enabled: function () {
			return this._activeMode !== null;
		},

		disable: function () {
			if (!this.enabled()) { return; }

			this._activeMode.handler.disable();
		},

		addToolbar: function (map) {
			var container = L.DomUtil.create('div', 'leaflet-draw-section'),
				buttonIndex = 0,
				buttonClassPrefix = this._toolbarClass || '',
				modeHandlers = this.getModeHandlers(map),
				i;

			this._toolbarContainer = L.DomUtil.create('div', 'leaflet-draw-toolbar leaflet-fa-toolbar leaflet-bar');
			this._map = map;

			for (i = 0; i < modeHandlers.length; i++) {
				if (modeHandlers[i].enabled) {
					this._initModeHandler(
						modeHandlers[i].handler,
						this._toolbarContainer,
						buttonIndex++,
						buttonClassPrefix,
						modeHandlers[i].title,
						modeHandlers[i].icon
					);
				}
			}

			// if no buttons were added, do not add the toolbar
			if (!buttonIndex) {
				return;
			}

			// Save button index of the last button, -1 as we would have ++ after the last button
			this._lastButtonIndex = --buttonIndex;

			// Create empty actions part of the toolbar
			this._actionsContainer = L.DomUtil.create('ul', 'leaflet-draw-actions');

			// Add draw and cancel containers to the control container
			container.appendChild(this._toolbarContainer);
			container.appendChild(this._actionsContainer);

			return container;
		},

		removeToolbar: function () {
			// Dispose each handler
			for (var handlerId in this._modes) {
				if (this._modes.hasOwnProperty(handlerId)) {
					// Unbind handler button
					this._disposeButton(
						this._modes[handlerId].button,
						this._modes[handlerId].handler.enable,
						this._modes[handlerId].handler
					);
	
					// Make sure is disabled
					this._modes[handlerId].handler.disable();
	
					// Unbind handler
					this._modes[handlerId].handler
						.off('enabled', this._handlerActivated, this)
						.off('disabled', this._handlerDeactivated, this);
				}
			}
			this._modes = {};
	
			// Dispose the actions toolbar
			for (var i = 0, l = this._actionButtons.length; i < l; i++) {
				this._disposeButton(
					this._actionButtons[i].button,
					this._actionButtons[i].callback,
					this
				);
			}
			this._actionButtons = [];
			this._actionsContainer = null;
		},
	
		_initModeHandler: function (handler, container, buttonIndex, classNamePredix, buttonTitle, buttonIcon) {
			var type = handler.type;
	
			this._modes[type] = {};
	
			this._modes[type].handler = handler;
	
			this._modes[type].button = this._createButton({
				title: buttonTitle,
				icon: buttonIcon,
				className: classNamePredix + '-' + type,
				container: container,
				callback: this._modes[type].handler.enable,
				context: this._modes[type].handler
			});
	
			this._modes[type].buttonIndex = buttonIndex;
	
			this._modes[type].handler
				.on('enabled', this._handlerActivated, this)
				.on('disabled', this._handlerDeactivated, this);
		},
	
		_createButton: function (options) {
			var link = L.DomUtil.create('a', options.className || '', options.container);
			if(null != options.icon){
				L.DomUtil.create('i', options.icon, link);
			}

			link.href = '#';

			if (options.text) {
				link.innerHTML = options.text;
			}

			if (options.title) {
				link.title = options.title;
			}

			L.DomEvent
				.on(link, 'click', L.DomEvent.stopPropagation)
				.on(link, 'mousedown', L.DomEvent.stopPropagation)
				.on(link, 'dblclick', L.DomEvent.stopPropagation)
				.on(link, 'click', L.DomEvent.preventDefault)
				.on(link, 'click', options.callback, options.context);

			return link;
		},

		_disposeButton: function (button, callback) {
			L.DomEvent
				.off(button, 'click', L.DomEvent.stopPropagation)
				.off(button, 'mousedown', L.DomEvent.stopPropagation)
				.off(button, 'dblclick', L.DomEvent.stopPropagation)
				.off(button, 'click', L.DomEvent.preventDefault)
				.off(button, 'click', callback);
		},

		_handlerActivated: function (e) {
			// Disable active mode (if present)
			this.disable();

			// Cache new active feature
			this._activeMode = this._modes[e.handler];

			L.DomUtil.addClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

			this._showActionsToolbar();

			this.fire('enable');
		},

		_handlerDeactivated: function () {
			this._hideActionsToolbar();

			L.DomUtil.removeClass(this._activeMode.button, 'leaflet-draw-toolbar-button-enabled');

			this._activeMode = null;

			this.fire('disable');
		},

		_createActions: function (handler) {
			var container = this._actionsContainer,
				buttons = this.getActions(handler),
				l = buttons.length,
				li, di, dl, button;

			// Dispose the actions toolbar (todo: dispose only not used buttons)
			for (di = 0, dl = this._actionButtons.length; di < dl; di++) {
				this._disposeButton(this._actionButtons[di].button, this._actionButtons[di].callback);
			}
			this._actionButtons = [];

			// Remove all old buttons
			while (container.firstChild) {
				container.removeChild(container.firstChild);
			}

			for (var i = 0; i < l; i++) {
				if ('enabled' in buttons[i] && !buttons[i].enabled) {
					continue;
				}

				li = L.DomUtil.create('li', '', container);

				button = this._createButton({
					title: buttons[i].title,
					text: buttons[i].text,
					container: li,
					callback: buttons[i].callback,
					context: buttons[i].context
				});

				this._actionButtons.push({
					button: button,
					callback: buttons[i].callback
				});
			}
		},

		_showActionsToolbar: function () {
			var buttonIndex = this._activeMode.buttonIndex,
				lastButtonIndex = this._lastButtonIndex,
				toolbarPosition = this._activeMode.button.offsetTop - 1;

			// Recreate action buttons on every click
			this._createActions(this._activeMode.handler);

			// Correctly position the cancel button
			this._actionsContainer.style.top = toolbarPosition + 'px';

			if (buttonIndex === 0) {
				L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
				L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-top');
			}

			if (buttonIndex === lastButtonIndex) {
				L.DomUtil.addClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
				L.DomUtil.addClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
			}

			this._actionsContainer.style.display = 'block';
		},

		_hideActionsToolbar: function () {
			this._actionsContainer.style.display = 'none';

			L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-notop');
			L.DomUtil.removeClass(this._toolbarContainer, 'leaflet-draw-toolbar-nobottom');
			L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-top');
			L.DomUtil.removeClass(this._actionsContainer, 'leaflet-draw-actions-bottom');
		}
	});

})();
(function(){
	"use strict";

	L.filterLocal = {
		filter: {
			toolbar: {
				actions: {
					title: 'Cancel drawing',
					text: 'Cancel'
				},
				buttons: {
					rectangle: 'Draw a bounding box filter',
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
				}
			}
		}
	};

})();
(function(){
	"use strict";

	L.Filter = {};

	L.Filter.Feature = L.Handler.extend({
		includes: L.Mixin.Events,

		initialize: function (map, options) {
			this._map = map;
			this._container = map._container;
			this._overlayPane = map._panes.overlayPane;
			this._popupPane = map._panes.popupPane;

			// Merge default shapeOptions options with custom shapeOptions
			if (options && options.shapeOptions) {
				options.shapeOptions = L.Util.extend({}, this.options.shapeOptions, options.shapeOptions);
			}
			L.setOptions(this, options);
		},

		enable: function () {
			if (this._enabled || this.isLocked()) { return; }
			L.Handler.prototype.enable.call(this);
			this.fire('enabled', { handler: this.type });
			this._map.fire('filter:filterstart', { layerType: this.type });
		},

		disable: function () {
			if (!this._enabled) { return; }
			L.Handler.prototype.disable.call(this);
			this._map.fire('filter:filterstop', { layerType: this.type });
			this.fire('disabled', { handler: this.type });
		},

		lock: function(){
			this._locked = true;
		},

		unlock: function(){
			this._locked = false;
		},

		isLocked: function(){
			return (null != this._locked && this._locked);
		},
	
		addHooks: function () {
			var map = this._map;
	
			if (map) {
				L.DomUtil.disableTextSelection();
				map.getContainer().focus();
				this._tooltip = new L.Tooltip(this._map);
				L.DomEvent.on(this._container, 'keyup', this._cancelDrawing, this);
			}
		},

		removeHooks: function () {
			if (this._map) {
				L.DomUtil.enableTextSelection();

				this._tooltip.dispose();
				this._tooltip = null;

				L.DomEvent.off(this._container, 'keyup', this._cancelDrawing, this);
			}
		},

		setOptions: function (options) {
			L.setOptions(this, options);
		},

		_fireCreatedEvent: function (layer) {
			this._map.fire('filter:created', { layer: layer, layerType: this.type });
		},

		// Cancel drawing when the escape key is pressed
		_cancelDrawing: function (e) {
			if (e.keyCode === 27) {
				this.disable();
			}
		}
	});

})();
(function(){
	"use strict";

	L.Filter.SimpleShape = L.Filter.Feature.extend({
		options: {
		},

		initialize: function (map, options) {
			this._endLabelText = L.filterLocal.filter.handlers.simpleshape.tooltip.end;
			L.Filter.Feature.prototype.initialize.call(this, map, options);
		},

		addHooks: function () {
			L.Filter.Feature.prototype.addHooks.call(this);
			if (this._map) {
				this._mapDraggable = this._map.dragging.enabled();

				if (this._mapDraggable) {
					this._map.dragging.disable();
				}

				//TODO refactor: move cursor to styles
				this._container.style.cursor = 'crosshair';
				this._tooltip.updateContent({ text: this._initialLabelText });

				this._map
					.on('mousedown', this._onMouseDown, this)
					.on('mousemove', this._onMouseMove, this);
			}
		},

		removeHooks: function () {
			L.Filter.Feature.prototype.removeHooks.call(this);
			if (this._map) {
				if (this._mapDraggable) {
					this._map.dragging.enable();
				}

				//TODO refactor: move cursor to styles
				this._container.style.cursor = '';

				this._map
					.off('mousedown', this._onMouseDown, this)
					.off('mousemove', this._onMouseMove, this);

				L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);

				// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
				if (this._shape) {
					this._map.removeLayer(this._shape);
					delete this._shape;
				}
			}
			this._isDrawing = false;
		},

		_getTooltipText: function () {
			return {
				text: this._endLabelText
			};
		},

		_onMouseDown: function (e) {
			this._isDrawing = true;
			this._startLatLng = e.latlng;

			L.DomEvent
				.on(document, 'mouseup', this._onMouseUp, this)
				.preventDefault(e.originalEvent);
		},

		_onMouseMove: function (e) {
			var latlng = e.latlng;

			this._tooltip.updatePosition(latlng);
			if (this._isDrawing) {
				this._tooltip.updateContent(this._getTooltipText());
				this._drawShape(latlng);
			}
		},

		_onMouseUp: function () {
			if (this._shape) {
				this._fireCreatedEvent();
			}

			this.disable();
		}
	});

})();
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

		// Get the geo representation of the current filter box
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

		// Programmatic way to draw a filter rectangle (bit of a hack)
		setFilter: function(filter) {
			this.enable();

			// init
			this._isDrawing = true;
			this._startLatLng = filter.northEast;

			// Update
			var shape = this._drawShape(filter.southWest);

			// Finish
			this.disable();

			return shape;
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
			} else {
				this._shape.setBounds(new L.LatLngBounds(this._startLatLng, latlng));
			}

			return { type: 'rectangle', layer: this._shape };
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
(function(){
	"use strict";

	L.Filter = L.Filter || {};

	L.Filter.Clear = L.Handler.extend({
		statics: {
			TYPE: 'clear'
		},

		includes: L.Mixin.Events,

		initialize: function (map, options) {
			L.Handler.prototype.initialize.call(this, map);
			L.Util.setOptions(this, options);
			this.type = L.Filter.Clear.TYPE;
		},

		lock: function(){
			this._locked = true;
		},

		unlock: function(){
			this._locked = false;
		},

		isLocked: function(){
			return (null != this._locked && this._locked);
		},
	
		enable: function () {
			if(!this.isLocked()){
				this._map.fire('filter:cleared');
			}
		},

		disable: function () {
		}

	});

})();
(function(){
	"use strict";

	L.Control.Filter = L.Control.extend({

		options: {
			position: 'topleft',
			filter: {
				rectangle: {}
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
			map.on('filter:created', this._filterCreatedHandler, this);
			map.on('filter:cleared', this._filterClearedHandler, this);

			return container;
		},

		onRemove: function (map) {
			// unregister create events
			map.off('filter:created', this._filterCreatedHandler, this);
			map.off('filter:cleared', this._filterClearedHandler, this);

			if (null != this._filterGroup) {
				// Unregister for the edit events
				this._filterGroup.shape.off('edit', this._filterUpdatedHandler, this);
			}

			this._toolbar.removeToolbar();
		},

		equals: function(shape1, shape2){
			return this._toolbar.equals(shape1, shape2);
		},

		// Public method to programatically set the state of the filter
		setFilter: function(filter){
			// Check to see if a change is being applied
			var shape1 = (null != this._filterGroup)? this._getGeo(this._filterGroup.type, this._filterGroup.shape) : undefined;
			// If there is no change, then we're just going to short circuit out of here
			if(this._toolbar.equals(shape1, filter)) {
				return;
			}

			if(null != filter) {
				// Ask the handler for the filter object
				var filterObject = this._toolbar.setFilter(filter);

				// Clear the old filter
				this._clearFilter(true);

				// Create the new filter
				this._createFilter(filterObject);
			} else {
				this._clearFilter();
			}
		},

		_createFilter: function(filter, suppressEvent) {
			//Add the created shape to the filter group
			this.options.filterGroup.addLayer(filter.layer);

			// Store the internal representation of the filter state
			this._filterGroup = { shape: filter.layer, type: filter.type };

			// Register for the edit events on the filter shape
			this._filterGroup.shape.on('edit', this._filterUpdatedHandler, this);

			// Fire the event that we've updated the filter
			if(!suppressEvent) { this._map.fire('filter:filter', { geo : this._getGeo(filter.type, filter.layer) }); }

			// Set the filtered state on the toolbar
			this._toolbar.setFiltered(true);
		},

		_clearFilter: function(suppressEvent) {
			// Remove the filter shape
			this.options.filterGroup.clearLayers();
			this._filterGroup = undefined;

			// Fire the event
			if(!suppressEvent) { this._map.fire('filter:filter', { geo: undefined }); }

			// Update the toolbar state
			this._toolbar.setFiltered(false);
		},

		_filterCreatedHandler: function(e){
			this._createFilter({ type: e.layerType, layer: e.layer});
		},

		_filterUpdatedHandler: function(){
			// Only process updates when we have a stored filter shape
			if(null != this._filterGroup){
				var payload = {
					geo: this._getGeo(this._filterGroup.type, this._filterGroup.shape)
				};
				// Only need to fire event - no need to update the toolbar
				this._map.fire('filter:filter', payload);
			}
		},

		_filterClearedHandler: function(){
			this._clearFilter();
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
(function(){
	"use strict";

	L.FilterToolbar = L.FontAwesomeToolbar.extend({

		options: {
			rectangle: {}
		},

		initialize: function (options) {
			// Ensure that the options are merged correctly since L.extend is only shallow
			for (var type in this.options) {
				if (this.options.hasOwnProperty(type)) {
					if (options[type]) {
						options[type] = L.extend({}, this.options[type], options[type]);
					}
				}
			}

			this._toolbarClass = 'leaflet-draw-filter';
			L.FontAwesomeToolbar.prototype.initialize.call(this, options);
		},

		getModeHandlers: function (map) {
			var handlers = [];
			if(null != L.Filter.Rectangle){
				handlers.push({
					enabled: this.options.rectangle,
					handler: new L.Filter.Rectangle(map, this.options.rectangle),
					title: L.filterLocal.filter.toolbar.buttons.rectangle,
					icon: 'fa fa-square-o'
				});
			}
			if(null != L.Filter.Clear){
				handlers.push({
					enabled: true,
					handler: new L.Filter.Clear(map, this.options.clear),
					title: L.filterLocal.filter.toolbar.buttons.clear,
					icon: 'fa fa-trash-o'
				});
			}

			return handlers;
		},

		// Get the actions part of the toolbar
		getActions: function () {
			return [
				{
					title: L.filterLocal.filter.toolbar.actions.title,
					text: L.filterLocal.filter.toolbar.actions.text,
					callback: this.disable,
					context: this
				}
			];
		},

		setOptions: function (options) {
			L.setOptions(this, options);

			for (var type in this._modes) {
				if (this._modes.hasOwnProperty(type) && options.hasOwnProperty(type)) {
					this._modes[type].handler.setOptions(options[type]);
				}
			}
		},

		addToolbar: function (map) {
			var container = L.FontAwesomeToolbar.prototype.addToolbar.call(this, map);
			this.setFiltered(false);
			return container;
		},

		setFiltered: function(filtered){
			var type;

			if(filtered){
				for(type in this._modes) {
					// The two draw buttons are disabled when we are filtered
					L.DomUtil.addClass(this._modes[type].button, 'leaflet-disabled');
					this._modes[type].button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.disabled);
					this._modes[type].handler.lock();
				}

				// Clear button is enabled
				L.DomUtil.removeClass(this._modes.clear.button, 'leaflet-disabled');
				this._modes.clear.button.setAttribute('title', L.filterLocal.filter.toolbar.buttons.clear);
				this._modes.clear.handler.unlock();

			} else {
				for(type in this._modes){
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
			if(null != this._modes[filter.type]) {
				return this._modes[filter.type].handler.setFilter(filter);
			} else {
				console.error('Unsupported filter type: ' + filter.type);
			}
		},

		getGeo: function(layerType, layer) {
			return this._modes[layerType].handler.getGeo(layer);
		},

		equals: function(shape1, shape2) {
			if(shape1 == null || shape1.type == null) {
				shape1 = null;
			}
			if(shape2 == null || shape2.type == null) {
				shape2 = null;
			}

			if(shape1 == null && shape2 == null) {
				return true;
			} else if(shape1 == null || shape2 == null) {
				return false;
			}

			return this._modes[shape1.type].handler.equals(shape1, shape2);
		}

	});

})();	