(function(){
	"use strict";

	L.Filter.Polyline = L.Filter.Feature.extend({
		
		statics: {
			TYPE: 'polyline'
		},

		Poly: L.Polyline,
		
		options: {
			allowIntersection: true,
			repeatMode: false,
			drawError: {
				color: '#b00b00',
				timeout: 2500
			},
			icon: new L.DivIcon({
				iconSize: new L.Point(8, 8),
				className: 'leaflet-div-icon leaflet-editing-icon'
			}),
			guidelineDistance: 20,
			maxGuideLineLength: 4000,
			shapeOptions: {
				stroke: true,
				color: '#f06eaa',
				weight: 4,
				opacity: 0.5,
				fill: false,
				clickable: true
			},
			metric: true, // Whether to use the metric meaurement system or imperial
			showLength: true, // Whether to display distance in the tooltip
			zIndexOffset: 2000 // This should be > than the highest z-index any map layers
		},

		initialize: function (map, options) {
			this._endLabelText = L.filterLocal.filter.handlers.polyline.tooltip.end;
			
			// Need to set this here to ensure the correct message is used.
			this.options.drawError.message = L.drawLocal.draw.handlers.polyline.error;

			// Merge default drawError options with custom options
			if (options && options.drawError) {
				options.drawError = L.Util.extend({}, this.options.drawError, options.drawError);
			}
			
			L.Filter.Feature.prototype.initialize.call(this, map, options);
		},

		addHooks: function () {
			L.Filter.Feature.prototype.addHooks.call(this);
			if (this._map) {
				
				this._markers = [];

				this._markerGroup = new L.LayerGroup();
				this._map.addLayer(this._markerGroup);

				this._poly = new L.Polyline([], this.options.shapeOptions);

				this._tooltip.updateContent(this._getTooltipText());

				// Make a transparent marker that will used to catch click events. These click
				// events will create the vertices. We need to do this so we can ensure that
				// we can create vertices over other map layers (markers, vector layers). We
				// also do not want to trigger any click handlers of objects we are clicking on
				// while drawing.
				if (!this._mouseMarker) {
					this._mouseMarker = L.marker(this._map.getCenter(), {
						icon: L.divIcon({
							className: 'leaflet-mouse-marker',
							iconAnchor: [20, 20],
							iconSize: [40, 40]
						}),
						opacity: 0,
						zIndexOffset: this.options.zIndexOffset
					});
				}

				this._mouseMarker
					.on('mousedown', this._onMouseDown, this)
					.addTo(this._map);

				this._map
					.on('mousemove', this._onMouseMove, this)
					.on('mouseup', this._onMouseUp, this)
					.on('zoomend', this._onZoomEnd, this);
			}
		},

		removeHooks: function () {
			
			L.Filter.Feature.prototype.removeHooks.call(this);
			if (this._map) {

				//TODO refactor: move cursor to styles
				this._container.style.cursor = '';

				this._map
					.off('mousedown', this._onMouseDown, this)
					.off('mousemove', this._onMouseMove, this);

				L.DomEvent.off(document, 'mouseup', this._onMouseUp, this);
				
				/*
				 * If no markers or polygons have been created, the user has not entered
				 * anything, so there is nothing to delete or remove from the map
				 */
				if(this._markerGroup) {
					this._map.removeLayer(this._markerGroup);
					delete this._markerGroup;
				}
				
				if(this._poly) {
					this._map.removeLayer(this._poly);
					delete this._poly;
				}
			}
			this._isDrawing = false;
		},

		_getTooltipText: function () {
			return {
				text: this._endLabelText
			};
		},
		
		deleteLastVertex: function () {
			if (this._markers.length <= 1) {
				return;
			}

			var lastMarker = this._markers.pop(),
				poly = this._poly,
				latlng = this._poly.spliceLatLngs(poly.getLatLngs().length - 1, 1)[0];

			this._markerGroup.removeLayer(lastMarker);

			if (poly.getLatLngs().length < 2) {
				this._map.removeLayer(poly);
			}

			this._vertexChanged(latlng, false);
		},

		addVertex: function (latlng) {
			var markersLength = this._markers.length;

			if (markersLength > 0 && !this.options.allowIntersection && this._poly.newLatLngIntersects(latlng)) {
				//TODO error state - alert user?
				return;
			}

			this._markers.push(this._createMarker(latlng));

			this._poly.addLatLng(latlng);

			if (this._poly.getLatLngs().length === 2) {
				this._map.addLayer(this._poly);
			}

			this._vertexChanged(latlng, true);
		},

		_finishShape: function () {
			var intersects = this._poly.newLatLngIntersects(this._poly.getLatLngs()[0], true);

			if ((!this.options.allowIntersection && intersects) || !this._shapeIsValid()) {
				//TODO error state - alert user?
				return;
			}

			this._fireCreatedEvent();
			this.disable();
			if (this.options.repeatMode) {
				this.enable();
			}
			
			// Remove the rubberband dashed guide line from the UI
			this._clearGuides();
		},

		//Called to verify the shape is valid when the user tries to finish it
		//Return false if the shape is not valid
		_shapeIsValid: function () {
			return true;
		},

		_onZoomEnd: function () {
			this._updateGuide();
		},

		_onMouseMove: function (e) {
			var newPos = e.layerPoint,
				latlng = e.latlng;

			// Save latlng
			// should this be moved to _updateGuide() ?
			this._currentLatLng = latlng;

			this._updateTooltip(latlng);

			// Update the guide line
			this._updateGuide(newPos);

			// Update the mouse marker position
			this._mouseMarker.setLatLng(latlng);

			L.DomEvent.preventDefault(e.originalEvent);
		},

		_vertexChanged: function (latlng, added) {
			this._updateFinishHandler();

			this._updateRunningMeasure(latlng, added);

			this._clearGuides();

			this._updateTooltip();
		},

		_onMouseDown: function (e) {
			var originalEvent = e.originalEvent;
			this._mouseDownOrigin = L.point(originalEvent.clientX, originalEvent.clientY);
		},

		_onMouseUp: function (e) {
			if (this._mouseDownOrigin) {
				// We detect clicks within a certain tolerance, otherwise let it
				// be interpreted as a drag by the map
				var distance = L.point(e.originalEvent.clientX, e.originalEvent.clientY)
					.distanceTo(this._mouseDownOrigin);
				if (Math.abs(distance) < 9 /* * (window.devicePixelRatio || 1)*/) {
					this.addVertex(e.latlng);
				}
			}
			this._mouseDownOrigin = null;
		},

		_updateFinishHandler: function () {
			var markerCount = this._markers.length;
			// The last marker should have a click handler to close the polyline
			if (markerCount > 1) {
				this._markers[markerCount - 1].on('click', this._finishShape, this);
			}

			// Remove the old marker click handler (as only the last point should close the polyline)
			if (markerCount > 2) {
				this._markers[markerCount - 2].off('click', this._finishShape, this);
			}
		},

		_createMarker: function (latlng) {
			var marker = new L.Marker(latlng, {
				icon: this.options.icon,
				zIndexOffset: this.options.zIndexOffset * 2
			});

			this._markerGroup.addLayer(marker);

			return marker;
		},
		
		_updateGuide: function (newPos) {
			var markerCount = this._markers.length;

			if (markerCount > 0) {
				newPos = newPos || this._map.latLngToLayerPoint(this._currentLatLng);

				// draw the guide line
				this._clearGuides();
				this._drawGuide(
					this._map.latLngToLayerPoint(this._markers[markerCount - 1].getLatLng()),
					newPos
				);
			}
		},
		
		_updateRunningMeasure: function (latlng, added) {
			var markersLength = this._markers.length,
				previousMarkerIndex, distance;

			if (this._markers.length === 1) {
				this._measurementRunningTotal = 0;
			} else {
				previousMarkerIndex = markersLength - (added ? 2 : 1);
				distance = latlng.distanceTo(this._markers[previousMarkerIndex].getLatLng());

				this._measurementRunningTotal += distance * (added ? 1 : -1);
			}
		},

		_updateTooltip: function (latLng) {
			var text = this._getTooltipText();

			if (latLng) {
				this._tooltip.updatePosition(latLng);
			}

			if (!this._errorShown) {
				this._tooltip.updateContent(text);
			}
		},

		_drawGuide: function (pointA, pointB) {
			var length = Math.floor(Math.sqrt(Math.pow((pointB.x - pointA.x), 2) + Math.pow((pointB.y - pointA.y), 2))),
				guidelineDistance = this.options.guidelineDistance,
				maxGuideLineLength = this.options.maxGuideLineLength,
				// Only draw a guideline with a max length
				i = length > maxGuideLineLength ? length - maxGuideLineLength : guidelineDistance,
				fraction,
				dashPoint,
				dash;

			//create the guides container if we haven't yet
			if (!this._guidesContainer) {
				this._guidesContainer = L.DomUtil.create('div', 'leaflet-draw-guides', this._overlayPane);
			}

			//draw a dash every GuildeLineDistance
			for (; i < length; i += this.options.guidelineDistance) {
				//work out fraction along line we are
				fraction = i / length;

				//calculate new x,y point
				dashPoint = {
					x: Math.floor((pointA.x * (1 - fraction)) + (fraction * pointB.x)),
					y: Math.floor((pointA.y * (1 - fraction)) + (fraction * pointB.y))
				};

				//add guide dash to guide container
				dash = L.DomUtil.create('div', 'leaflet-draw-guide-dash', this._guidesContainer);
				dash.style.backgroundColor =
					!this._errorShown ? this.options.shapeOptions.color : this.options.drawError.color;

				L.DomUtil.setPosition(dash, dashPoint);
			}
		},

		_updateGuideColor: function (color) {
			if (this._guidesContainer) {
				for (var i = 0, l = this._guidesContainer.childNodes.length; i < l; i++) {
					this._guidesContainer.childNodes[i].style.backgroundColor = color;
				}
			}
		},

		// removes all child elements (guide dashes) from the guides container
		_clearGuides: function () {
			if (this._guidesContainer) {
				while (this._guidesContainer.firstChild) {
					this._guidesContainer.removeChild(this._guidesContainer.firstChild);
				}
			}
		},
		
		_cleanUpShape: function () {
			if (this._markers.length > 1) {
				this._markers[this._markers.length - 1].off('click', this._finishShape, this);
			}
		},

		_fireCreatedEvent: function () {
			var poly = new this.Poly(this._poly.getLatLngs(), this.options.shapeOptions);
			L.Filter.Feature.prototype._fireCreatedEvent.call(this, poly);
		}
	});

})();