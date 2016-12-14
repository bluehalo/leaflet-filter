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
				polyline: '',
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
					start: '',
					cont: '',
					end: ''
				}
			},
			polygon: {
				tooltip: {
					start: 'Click to start drawing shape.',
					cont: 'Click to continue drawing shape.',
					end: 'Click first point to close this shape.'
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
