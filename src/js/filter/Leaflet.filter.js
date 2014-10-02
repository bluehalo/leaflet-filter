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