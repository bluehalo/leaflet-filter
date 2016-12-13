L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Rectangle = L.Draw.Rectangle.extend({

	statics: {
		TYPE: 'rectangle'
	},

	includes: [ L.Mixin.Events ]

});
