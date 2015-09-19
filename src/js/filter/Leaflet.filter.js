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
					polygon: 'Draw a bounding polygon filter',
					polyline: 'Draw a multipoint line',
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
						start: 'Click to draw multiple points.'
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

})();