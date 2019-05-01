const
	path = require('path'),
	pkg = require('./package.json');

export default {
	input: path.posix.resolve('src/index.js'),
	external: [
		'leaflet',
		'leaflet-draw'
	],
	output: {
		banner: `/*! ${pkg.name} - ${pkg.version} - ${pkg.copyright} + */`,
		file: path.posix.join('./dist', `${pkg.artifactName}.js`),
		format: 'umd',
		globals: {
			'leaflet': 'L',
			'leaflet-draw': 'L'
		},
		name: pkg.moduleName,
		sourcemap: true
	}
};
