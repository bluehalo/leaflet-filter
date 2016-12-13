L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Circle = L.Draw.Circle.extend({

	statics: {
		TYPE: 'circle'
	},

	includes: [ L.Mixin.Events ]

});
