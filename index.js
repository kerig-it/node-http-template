/*
 * This is the server's source code, aka the entry point, aka the main
 * script.
 *
 * Refer to the README in this repository's root for more
 * information or to the wiki for a complete reference on tweaking
 * this server to your needs.
 *
 * GitHub: https://github.com/kerig-it/node-http-template
 * Wiki:   https://github.com/kerig-it/node-http-template/wiki
 *
 * Made with ❤️ by Kerig.
*/

// Packages and libraries
const
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	sanitiser = require('sanitiser'),
	url = require('url');

let config; // Configuration object --> ./config.json

try {
	// Parse the configuration object.
	config = JSON.parse(fs.readFileSync(
		path.join(__dirname, 'config.json')
	).toString());

	// Check if this server has a client.
	if (config.client) {
		// Resolve the specified client directory in the file system.
		let client = path.resolve(config.client.dir);

		// Check if the client directory doesn't exist.
		if (!(
			fs.existsSync(client) &&
			fs.statSync(client).isDirectory()
		)) {
			throw new Error('The client directory is seemingly devoid.');
		}
	}
}
catch (error) {
	// Crash the server.
	throw error;
}

// Returns a status string from the response object.
const status = response => {
	if (!response)
		return;

	if (!response.statusMessage)
		response.writeHead(200);

	// Return a string with the status (default: '200 OK').
	return `${response.statusCode} ${response.statusMessage}`;
};

// Main function (HTTP server)
const main = async (request, response) => {
	let
		// Boolean value of the HTTP HEAD method utilisation
		head = request.method === 'HEAD',
		query;

	try {
		// Parse the request query object.
		query = url.parse(request.url, true, false);
	}
	catch (error) {
		// End the response with 400 Bad Request.
		return response
			.writeHead(400)
			.end(!head && status(response));
	}

	// Validate the query path name.
	if (!query.pathname || typeof(query.pathname) !== 'string') {
		query.pathname = '/';
	}
	else {
		// Path name sanitisation.
		query.pathname = sanitiser(query.pathname, {
			trailingSlashes: false
		});
	}

	// CORS
	if (config.cors.enabled) {
		let origin = request.headers['origin'];

		if (origin && typeof(origin) === 'string') {
			if (config.cors.domains.includes(
				origin.replace(
					/^((https?):\/\/)?(\w{1,253})(:\d{1,6})?$/i,
					'$3$4'
				)
			)) {
				// Set the Allow-Origin header.
				response.setHeader(
					'Access-Control-Allow-Origin',
					origin
				);
			}
		}
	}

	// Is the HTTP method supported?
	if (config.methods.includes(request.method)) {
		if ([ 'GET', 'HEAD' ].includes(request.method)) {

			// Declare a path name that will be a composed imaginary
			// path name from the supplied query.
			let pathname;

			try {
				// File from client directory
				pathname = path.join(
					config.client.dir,
					query.pathname.replace(/^\/*/, '')
				);
			}
			catch (error) {
				// End the response with 500 Internal Server Error.
				return response
					.writeHead(500)
					.end(!head && status(response));
			}

			let
				// Define a path to an index file.
				index = path.join(pathname, 'index.html'),
				file  = [ index, pathname ].find(fs.existsSync);

			// Does the target file exist?
			if (file && fs.statSync(file).isFile()) {
				try {
					// Read the target file.
					const chunk = await fs.promises.readFile(file);

					// Set a Content-Type header if necessary.
					if (file === index)
						response.setHeader('Content-Type', 'text/html');

					// End the response with data.
					return response
						.writeHead(200, {
							'Content-Length': Buffer.byteLength(chunk)
						})
						.end(!head && chunk);
				}
				catch (error) {
					// End the response with 500 Internal Server Error.
					return response
						.writeHead(500)
						.end(!head && status(response));
				}
			}

			// Was the requested query (apparently) some gibberish nonsense?
			else {
				// End the response with 404 Not Found.
				return response
					.writeHead(404)
					.end(!head && status(response));
			}
		}

		else if (request.method === 'OPTIONS') {
			// End the response with the allowed options.
			return response
				.writeHead(200, {
					'Allow': config.methods.join(', ')
				})
				.end(status(response));
		}
	}

	// Unsupported request method?
	else {
		// End the response with 501 Not Implemented.
		return response
			.writeHead(501)
			.end(status(response));
	}

	// Define an object literal with response timeouts (in ms).
	let timeouts = {
		development: config.devServer.timeout,
		production: config.server.timeout
	};

	// Make up a timeout to use.
	let timeout = timeouts[config.environment] ?? 60000;

	// Set a response timeout to prevent infinite response times from
	// the server.
	response.setTimeout(timeout, () => {
		// End the response with 500 Internal Server Error.
		return response
			.writeHead(500)
			.end(status(response));
	});
};

try {
	// Define an object literal with ports.
	let ports = {
		development: config.devServer?.port,
		production: config.server?.port
	};

	// Make up a port to use.
	let port = ports[config.environment] ?? 80;

	// Initiate the HTTP server.
	http.createServer(main).listen(port, () => {
		// Print success message.
		console.clear();
		console.log(`HTTP server running at http://127.0.0.1:${port}\n`);
	});
}
catch (error) {
	// Crash the server.
	throw error;
}
