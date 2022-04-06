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

// Returns a status string from a response.
const status = response => {
	if (!response)
		return;

	if (!response.statusMessage)
		response.writeHead(200);

	return `${response.statusCode} ${response.statusMessage}`;
};

// Main function
const main = () => {

	// Define an HTTP server.
	let server = http.createServer(async (request, response) => {

		// Define a Boolean value of whether the HEAD method is used.
		let head = request.method === 'HEAD';

		// Declare a query.
		let query;

		try {
			query = url.parse(request.url, true, false);
		}
		catch (error) {
			// End the response with 400 Bad Request.
			return response
				.writeHead(400)
				.end(!head && status(response));
		}

		// Remove trailing slashes from the path name.
		query.pathname = query.pathname.replace(/^(.+)\/$/, '$1');

		// CORS
		let origin = request.headers['origin'];

		if (origin) {
			if (config.cors.domains.includes(
				origin
					.toString()
					.replace(/^https?:\/\//, '')
			)) {
				// Set Allow-Origin header (CORS).
				response.setHeader(
					'Access-Control-Allow-Origin',
					origin
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
					// File from client directory
					pathname = path.join(
						config.client.dir,
						sanitiser(query.pathname).replace(/^\/*/, '')
					);
				}
				catch (error) {
					// End the response with 500 Internal Server Error.
					return response
						.writeHead(500)
						.end(!head && status(response));
				}

				// Does the file (?) exists?
				if (
					fs.existsSync(pathname) &&
					fs.statSync(pathname).isFile()
				) {
					try {
						const chunk = await fs.promises.readFile(pathname);

						// End the response with the chunk.
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

				// Not a direct specification of a file?
				else {

					// Append an index file.
					pathname = path.join(pathname, 'index.html');

					// Does the index file exist?
					if (fs.existsSync(pathname)) {
						try {
							const chunk = await fs.promises.readFile(pathname);

							// End the response with the chunk.
							return response
								.writeHead(200, {
									'Content-Length': Buffer.byteLength(chunk),
									'Content-Type': 'text/html'
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

					// Was the requested query some gibberish nonsense?
					else {
						// End the response with 404 Not Found.
						return response
							.writeHead(404)
							.end(!head && status(response));
					}
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
			// End the response with 501 Not Implemented
			return response
				.writeHead(501)
				.end(status(response));
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
