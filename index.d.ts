/// <reference types="leaflet" />
/// <reference types="leaflet-draw" />

declare namespace L {

	namespace Control {

		/**
		 * Circle-based filter
		 * type is 'circle'
		 */
		interface FilterCircle extends L.Circle {}

		/**
		 * Rectangle-based filter
		 * type is 'rectangle'
		 */
		interface FilterRectangle extends L.Rectangle {}

		/**
		 * Plygon-based filter, requires at least three points. Doesn't need to be closed.
		 * type is 'polygon'
		 */
		interface FilterPolygon extends L.Polygon {}

		/**
		 * Filter control. Main point of interaction with the filter mechanism.
		 */
		interface FilterControl extends L.Control {
			/**
			 * Clear the filter
			 */
			setFilter(): this;

			/**
			 * * Set a circle-based filter
			 * @param filter
			 * @param options
			 */
			setFilter(filter: FilterCircle, options?: SetFilterOptions): this;

			/**
			 * Set a rectangle-based filter
			 * @param filter
			 * @param options
			 */
			setFilter(filter: FilterRectangle, options? : SetFilterOptions): this;

			/**
			 * Set a polygon-based filter
			 * @param filter
			 * @param options
			 */
			setFilter(filter: FilterPolygon, options? : SetFilterOptions): this;

			/**
			 * Fit the current filter on the map (if it's set)
			 * @param options
			 */
			fitBounds(options?: L.FitBoundsOptions) : this;
		}

		/**
		 * Options that determine the behavior of a setFilter action
		 */
		interface SetFilterOptions {
			/**
			 * Do not fire the filter events associated with this filter being applied
			 */
			suppressEvents: boolean;

			/**
			 * Immediately zoom to the set filter
			 */
			fitBounds: boolean;
		}

		/**
		 * Options that determine how the filtering mechanism behaves
		 */
		interface FilterOptions {

			/**
			 * Configuration for circle filters. Omit to disable.
			 */
			circle?: L.DrawOptions.CircleOptions,

			/**
			 * Configuration for rectangle filters. Omit to disable.
			 */
			rectangle?: L.DrawOptions.RectangleOptions,

			/**
			 * Configuration for polygon filters. Omit to disable.
			 */
			polygon?: L.DrawOptions.PolygonOptions
		}

		/**
		 * Options that determine how the filter control appears and behaves
		 */
		interface FilterControlOptions {
			/**
			 * Map position for the control. Defaults to 'topright'
			 * 'topleft', 'topright', 'bottomleft', 'bottomright'
			 */
			position?: string,

			/**
			 * Options for determining how the filter controls will behave and which are enabled.
			 * Default behavior is to allow all filter control types.
			 */
			filter?: FilterOptions,

			/**
			 * The layer in which to store the filter shapes
			 */
			featureGroup: L.FeatureGroup

		}

	}

	namespace control {
		/**
		 * Create a filter control
		 * @param FilterControlOptions
		 */
		function filter(options: L.Control.FilterControlOptions) : L.Control.FilterControl;
	}

}
