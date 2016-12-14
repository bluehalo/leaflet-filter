/// <reference types="leaflet" />
/// <reference types="leaflet-draw" />

declare namespace L {

	namespace control {

		/**
		 * Circle-based filter.
		 * type is 'circle'
		 */
		interface IFilterCircle extends L.Circle {}

		/**
		 * Rectangle-based filter
		 * type is 'rectangle'
		 */
		interface IFilterRectangle extends L.Rectangle {}

		/**
		 * Plygon-based filter, requires at least three points. Doesn't need to be closed.
		 * type is 'polygon'
		 */
		interface IFilterPolygon extends L.Polygon {}

		/**
		 * Filter control. Main point of interaction with the filter mechanism.
		 */
		interface IFilterControl {
			/**
			 * Clear the filter
			 */
			setFilter(): void;

			/**
			 * Set a circle-based filter
			 * @param IFilterCircle
			 */
			setFilter(IFilterCircle): void;

			/**
			 * Set a rectangle-based filter
			 * @param IFilterRectangle
			 */
			setFilter(IFilterRectangle): void;

			/**
			 * Set a polygon-based filter
			 * @param IFilterPolygon
			 */
			setFilter(IFilterPolygon): void;

		}

		/**
		 * Options that determine how the filtering mechanism behaves
		 */
		interface IFilterOptions {

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
		interface IFilterControlOptions {
			/**
			 * Map position for the control. Defaults to 'topright'
			 * 'topleft', 'topright', 'bottomleft', 'bottomright'
			 */
			position?: string,

			/**
			 * Options for determining how the filter controls will behave and which are enabled.
			 * Default behavior is to allow all filter control types.
			 */
			filter?: IFilterOptions,

			/**
			 * The layer in which to store the filter shapes
			 */
			featureGroup: L.Layer

		}

		/**
		 * Create a filter control
		 * @param IFilterControlOptions
		 */
		export function filter(IFilterControlOptions) : IFilterControl;

	}


}
