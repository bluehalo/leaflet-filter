import 'leaflet';

L.Filter = (null != L.Filter) ? L.Filter : {};

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

	lock: function() {
		this._locked = true;
	},

	unlock: function() {
		this._locked = false;
	},

	isLocked: function() {
		return (null != this._locked && this._locked);
	},

	enable: function () {
		if(!this.isLocked()) {
			this._map.fire('filter:cleared');
		}
	},

	disable: function () {
	}

});
