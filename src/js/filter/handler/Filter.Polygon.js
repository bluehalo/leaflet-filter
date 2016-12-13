L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Polygon = L.Draw.Polygon.extend({

	statics: {
		TYPE: 'polygon'
	},

	includes: [ L.Mixin.Events ]

});
