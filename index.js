/*
 * This is the server's source code, aka the entry point, aka the main
 * script.
 *
 * Refer to the README in this repository's root for more
 * information or to the wiki for a complete reference on tweaking
 * this server to your needs.
 *
 * All regular expression were checked against:
 * https://devina.io/redos-checker
 *
 * GitHub: https://github.com/kerig-it/node-http-template
 * Wiki:   https://github.com/kerig-it/node-http-template/wiki
 *
 * Made with ❤️ by Kerig.
*/

// Dependencies
const
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	sanitiser = require('sanitiser');

let config; // Configuration object --> ./config.json

try {
	// Parse configuration object.
	config = JSON.parse(fs.readFileSync(
		path.join(__dirname, 'config.json')
	).toString());

	// Does this server have a client?
	if (config.client) {
		// Resolve client directory on file system.
		let client = path.resolve(config.client?.dir);

		// Does the client directory not exist?
		if (!(
			fs.existsSync(client) &&
			fs.statSync(client).isDirectory()
		)) {
			// Unsupport HTTP methods GET and HEAD.
			config.methods = config.methods.filter(method =>
				![ 'GET', 'HEAD' ].includes(method)
			);

			// Raise an error.
			throw new Error('The client directory is seemingly devoid. HTTP methods GET and HEAD will be dismissed.');
		}

		// Assign absolute path.
		config.client.dir = client;
	}
}
catch (error) {
	// Log errors.
	console.warn('An error arose ante server initiation:\n%O\n', error);
}

// Returns a status string from the response object.
const status = response => {
	if (!response)
		// Default
		return '200 OK';

	if (!response.statusMessage)
		response.writeHead(200);

	return `${response.statusCode} ${response.statusMessage}`;
};

// Main function (HTTP server)
const main = async (request, response) => {
	let
		// Boolean value of the HTTP HEAD method utilisation
		head = request.method === 'HEAD',
		query;

	try {
		// Parse the request query URL.
		query = new URL(request.url, `http://${request.headers.host}`);

		// Validate supplied path name.
		query.pathname = sanitiser(query.pathname, {
			path: true,
			trailingSlashes: false
		});
	}
	catch (error) {
		// End the response with 400 Bad Request.
		return response
			.writeHead(400)
			.end(!head && status(response));
	}

	// Is CORS enabled?
	if (config.cors?.enabled) {
		let origin = request.headers['origin'];

		// Validate the Origin header.
		if (typeof origin === 'string') {
			if (config.cors.domains.includes(
				origin.replace(
					//               (host name      )  (port   )
					/(https?:)?\/?\/?([\w\-\.]{1,253}):?(\d{1,6})?/i,
					'$2' // Second group matches the host name
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

			// Paths to resources/index files
			let
				resource = path.join(
					config.client.dir,
					query.pathname.replace(/^\/*/, '')
				),
				index = path.join(resource, 'index.html'),
				root = path.join(config.client.dir, 'index.html');

				// One of the two
				target  = [ resource, index, root ].find(item =>
					fs.existsSync(item) && fs.statSync(item).isFile()
				);

			// Does the target file exist?
			if (target && fs.statSync(target).isFile()) {
				try {
					// Read the target file.
					const chunk = await fs.promises.readFile(target);

					// Set a Content-Type header if necessary.
					if (target === index)
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
				.end(status());
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
		console.log('HTTP server running at http://127.0.0.1:%d\n', port);
	});
}
catch (error) {
	// Log errors.
	console.error('An error arose per server initiation:\n%O\n', error);
	process.exit(1);
}
