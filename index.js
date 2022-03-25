/*
 * node-tmpl—A template repository for Node.js HTTP servers.
 *
 * Refer to the README in this repository's root for more
 * information.
 *
 * GitHub: https://github.com/kerig-it/node-tmpl
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

let
	client, // (Path name)
	config; // Configuration object --> ./config.json

try {
	config = JSON.parse(fs.readFileSync(
		path.join(__dirname, 'config.json')
	).toString());

	// Is there a client?
	if (config.client) {
		// Resolve the client directory.
		client = path.resolve(config.client.dir);

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
		let query = url.parse(request.url, true);

		// Remove trailing slashes from the path name.
		query.pathname = query.pathname.replace(/^(.+)\/$/, '$1');

		if (request.method === 'GET') {
		
			// Compose an imaginary path name from the supplied query.
			let pathname = path.join(
				// Path name to client directory
				client,

				// Sanitised requested path
				sanitiser(query.pathname).replace(/^\/*/, '')
			);

			// Check if the path name to the (file?) *exists*.
			if (
				fs.existsSync(pathname) &&
				fs.statSync(pathname).isFile()
			) {
				fs.readFile(pathname, (error, data) => {
					if (error) {
						// Log the error.
						console.error(error);

						// End the reponse with 500.
						response.statusCode = 500;
						return reponse.end('500: Internal Server Error');
					}

					// End the reponse with data.
					response.statusCode = 200;
					return response.end(data);
				});
			}

			// Is the path name not a direct specification of a file?
			else {

				// Define a possible `index.html` file.
				let index = path.join(pathname, 'index.html');

				// Declare a possible HTML file.
				let html;

				// Define a list of relevant extensions.
				let extensions = [ 'html', 'htm', 'xhtml', 'xhtm' ];

				for (extension of extensions) {
					// Define a possible variant.
					let variant = pathname.replace(/\/$/, '') + '.' + extension;

					// Check variant's existence.
					if (fs.existsSync(variant)) {
						// Assign the variant to `html`.
						html = variant;
						extensions = extension;
						break;
					}
				}

				// Reassign index/HTML path names to Boolean values
				// based off of their existence in the file system,
				// giving the `index.html` file priority.
				if (fs.existsSync(index)) {
					html = false;
				}
				else if (html) {
					index = false;
				}
				else {
					html = false;
					index = false;
				}

				// Define a pathname or a Boolean value from the
				// `index.html` or HTML file, if applicable.
				let targetFile = index || html;

				// Is there an `index.html` or HTML file?
				if (targetFile) {
					// Read the file.
					fs.readFile(targetFile, (error, data) => {
						if (error) {
							// Log the error.
							console.error(error);

							// End the response with 500.
							response.statusCode = 500;
							return response.end('500: Internal Server Error');
						}

						// End the response with data.
						response.statusCode = 200;
						response.setHeader(
							'Content-Type',
							extensions.at(0) === 'x' ? 'application/xhtml+xml' : 'text/html'
						);
						return response.end(data.toString());
					});
				}

				// Was the requested query some gibberish nonsense?
				else {
					// End the response with 404.
					response.statusCode = 404;
					return response.end('404: Not Found');
				}
			}
		}

		// Methods that shouldn't receive 405.
		else if ([ 'HEAD' ].includes(request.method)) {
			// End the response with 200.
			response.statusCode = 200;
			return response.end('200: OK');
		}

		// Different request method?
		else {
			// End the response with 405.
			response.statusCode = 405;
			return response.end('405: Method Not Allowed');
		}
	});

	// Define an object literal with ports.
	let ports = {
		development: config.devServer?.port,
		production: config.server?.port
	};

	// Make up a port to use.
	let port = ports[config.environment] ?? 80;

	// Initiate the HTTP server.
	server.listen(
		port,
		() => {
			// Print success message.
			console.clear();
			console.log(`HTTP server running at http://127.0.0.1:${port}\n`);
		}
	);
};

try /*one's luck*/ {
	main();
}
catch (error) {
	// Crash the server.
	throw error;
}
