import 'leaflet';

L.Filter = (null != L.Filter) ? L.Filter : {};

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

			this._map
				.on('mousedown', this._onMouseDown, this)
				.on('mousemove', this._onMouseMove, this)
				.on('touchstart', this._onMouseDown, this)
				.on('touchmove', this._onMouseMove, this);
		}
	},

	removeHooks: function () {
		L.Filter.Feature.prototype.removeHooks.call(this);
		this._isDrawing = false;

		if (this._map) {
			if (this._mapDraggable) {
				this._map.dragging.enable();
			}

			//TODO refactor: move cursor to styles
			this._container.style.cursor = '';

			this._map
				.off('mousedown', this._onMouseDown, this)
				.off('mousemove', this._onMouseMove, this)
				.off('touchstart', this._onMouseDown, this)
				.off('touchmove', this._onMouseMove, this);

			L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
			L.DomEvent.off(document, 'touchend', this._onMouseUp, this);

			// If the box element doesn't exist they must not have moved the mouse, so don't need to destroy/return
			if (this._shape) {
				try {
					this._map.removeLayer(this._shape);
				}
				catch (err) {
					// Suppress the error on removing circle
				}

				delete this._shape;
			}
		}

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
			.on(document, 'touchend', this._onMouseUp, this)
			.preventDefault(e.originalEvent);
	},

	_onMouseMove: function (e) {
		var latlng = e.latlng;

		this._tooltip.updatePosition(latlng);
		if (this._isDrawing) {
			this._drawShape(latlng);
			this._tooltip.updateContent(this._getTooltipText());
		}
		else {
			this._tooltip.updateContent({ text: this._initialLabelText });
		}
	},

	_onMouseUp: function () {
		if (this._shape) {
			this._fireCreatedEvent();
		}

		this.disable();
	}
});
