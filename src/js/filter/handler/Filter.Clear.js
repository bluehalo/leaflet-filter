L.Filter = (null != L.Filter) ? L.Filter : {};

L.Filter.Clear = L.EditToolbar.Delete.extend({

	statics: {
		TYPE: 'clear'
	},

	includes: [ L.Mixin.Events ],

	// @method intialize(): void
	initialize: function (map, options) {
		L.EditToolbar.Delete.prototype.initialize.call(this, map, options);

		// Save the type so super can fire, need to do this as cannot do this.TYPE :(
		this.type = L.Filter.Clear.TYPE;
	}


});
