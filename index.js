/*
 * node-http-template—A template repository for Node.js HTTP servers.
 *
 * Refer to the README in this repository's root for more
 * information.
 *
 * GitHub: https://github.com/kerig-it/node-http-template
 *
 * Made with ❤️ by Kerig.
*/

// Modules, packages and libraries
const
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	responseHandler = require('response-handler'),
	sanitiser = require('sanitiser'),
	url = require('url');

let config; // Configuration object --> ./config.json

try {
	// Parse the configuration object.
	config = JSON.parse(fs.readFileSync(
		path.join(__dirname, 'config.json')
	).toString());

	// Is there a client?
	if (config.client) {
		// Resolve the client directory.
		let client = path.resolve(config.client.dir);

		// Check if the client (directory?) does *not* exists.
		if (!(
			fs.existsSync(client) &&
			fs.statSync(client).isDirectory()
		)) {
			// If so, raise an error.
			throw new Error('The client directory is seemingly devoid.');
		}
	}
}
catch (error) {
	// Crash the server.
	throw error;
}

// Main function
const main = () => {

	// Define an HTTP server.
	let server = http.createServer((request, response) => {

		// Define a Boolean value of whether the HEAD method is used.
		let head = request.method === 'HEAD';

		// Declare a query.
		let query;

		try {
			query = url.parse(request.url, true, false);
		}
		catch (error) {
			// End the response with 400.
			return responseHandler(response, '400 Bad Request', {}, request.method);
		}

		// Remove trailing slashes from the path name.
		query.pathname = query.pathname.replace(/^(.+)\/$/, '$1');

		// CORS
		if (request.headers['origin']) {
			if (config.cors.domains.includes(
				request.headers['origin']
					.toString()
					.replace(/^https?:\/\//, '')
			)) {
				// Set CORS header.
				response.setHeader(
					'Access-Control-Allow-Origin',
					request.headers['origin']
				);
			}
		}

		// Is the request method supported?
		if (config.methods.includes(request.method)) {

			// Request handling
			if ([ 'GET', 'HEAD' ].includes(request.method)) {

				// Declare a path name that will be a composed
				// imaginary path name from the supplied query.
				let pathname;

				try {
					pathname = path.join(
						// Path name to client directory
						config.client.dir,

						// Sanitised requested path
						sanitiser(query.pathname).replace(/^\/*/, '')
					);
				}
				catch (error) {
					// End the response with 500.
					return responseHandler(response, '500 Internal Server Error', {}, request.method);
				}

				// Does the path name to the (file?) exists?
				if (
					fs.existsSync(pathname) &&
					fs.statSync(pathname).isFile()
				) {
					// Read the file from the file system.
					return fs.readFile(pathname, (error, data) => {
						if (error) {
							// End the response with 500.
							return responseHandler(response, '500 Internal Server Error', {}, request.method);
						}

						// End the response with data.
						responseHandler(response, '200 OK', {}, request.method, data);
					});
				}

				// Not a direct specification of a file?
				else {

					// Define a possible index.html file.
					let index = path.join(pathname, 'index.html');

					// Does the index file exist?
					if (fs.existsSync(index)) {
						// Read the index file.
						return fs.readFile(index, (error, data) => {
							if (error) {
								// End the response with 500.
								return responseHandler(response, '500 Internal Server Error', {}, request.method);
							}

							// End the response with data.
							responseHandler(
								response,
								'200 OK',
								{ 'Content-Type': 'text/html' },
								request.method,
								data
							);
						});
					}

					// Was the requested query some gibberish nonsense?
					else {
						// End the response with 404.
						return responseHandler(response, '404 Not Found', {}, request.method);
					}
				}
			}

			else if (request.method === 'OPTIONS') {
				// End the response with 200.
				return responseHandler(
					response,
					'200 OK',
					{ 'Allow': config.methods.join(', ') },
					request.method
				);
			}
		}

		// Unsupported request method?
		else {
			// End the response with 501.
			return responseHandler(response, '501 Not Implemented', {}, request.method);
		}

		// Define an object literal with timeouts.
		let timeouts = {
			development: config.devServer.timeout,
			production: config.server.timeout
		};

		// Make up a timeout to use.
		let timeout = timeouts[config.environment] ?? 60000;

		// Set a response timeout to prevent infinite response times
		// due to the server not handling a particular request method
		// and/or something else.
		response.setTimeout(timeout, () => {
			// End the response with 500.
			responseHandler(response, '500 Internal Server Error', {}, request.method);
		});
	});

	// Define an object literal with ports.
	let ports = {
		development: config.devServer?.port,
		production: config.server?.port
	};

	// Make up a port to use.
	let port = ports[config.environment] ?? 80;

	// Initiate the HTTP server.
	server.listen(port, () => {
		// Print success message.
		console.clear();
		console.log(`HTTP server running at http://127.0.0.1:${port}\n`);
	});
};

try /*one's luck*/ {
	main();
}
catch (error) {
	// Crash the server.
	throw error;
}
