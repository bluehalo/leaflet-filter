/// <reference types="leaflet" />
/// <reference types="leaflet-draw" />

declare namespace L {

	namespace Control {

		/**
		 * Circle-based filter.
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
			setFilter(): void;

			/**
			 * Set a circle-based filter
			 * @param FilterCircle
			 */
			setFilter(filter: FilterCircle): void;

			/**
			 * Set a rectangle-based filter
			 * @param FilterRectangle
			 */
			setFilter(filter: FilterRectangle): void;

			/**
			 * Set a polygon-based filter
			 * @param FilterPolygon
			 */
			setFilter(filter: FilterPolygon): void;

			/**
			 * Add the control to the map
			 * @param map The map to which to add the control
			 */
			addTo(map: L.Map): this;
		}

		/**
		 * Options that determine how the filtering mechanism behaves
		 */
		interface FilterOptions {

			/**
			 * Configuration for circle filters. Omit to disable.
			 */
			circle?: DrawOptions.CircleOptions,

			/**
			 * Configuration for rectangle filters. Omit to disable.
			 */
			rectangle?: DrawOptions.RectangleOptions,

			/**
			 * Configuration for polygon filters. Omit to disable.
			 */
			polygon?: DrawOptions.PolygonOptions
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
