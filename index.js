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

let config; // Configuration object --> ./config.json

try {
	// Read and parse the configuration object.
	config = JSON.parse(fs.readFileSync(
		path.join(__dirname, 'config.json')
	).toString());

	// Check if the client directory exists.
	if (!fs.existsSync(path.resolve(config.client.dir))) {
		// If not, throw an error.
		throw new Error('The client directory is seemingly devoid.');
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

		// Define some query variables.
		let
			query = url.parse(request.url, true),
			p = query.pathname === '/' ? '/' : query.pathname.replace(/\/?$/, '');

		// Is the requested method 'GET'?
		if (request.method === 'GET') {
		
			// Define a possible path name.
			let pathname = path.join(
				config.client.dir, // Client directory
				config.client.public, // Client public path

				// Sanitised requested path
				sanitiser(
					p.replace(/^\/*/, '')
				)
			);

			// Does the possible path name exist and is it a file?
			if (
				fs.existsSync(pathname) &&
				fs.statSync(pathname).isFile()
			) {
				// Read the file.
				fs.readFile(pathname, (error, data) => {

					// Error handling.
					if (error) {
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
				let index = path.join(
					config.client.dir, // Client directory
					config.client.public, // Client public path

					// Sanitised requested path
					sanitiser(
						p.replace(/^\/*/, '')
					),

					// `index.html` file
					'index.html'
				);

				// Define possible HTML file for supplied path name.
				let html = path.join(
					config.client.dir, // Client directory
					config.client.public, // Client public path

					// Sanitised requested path (as HTML)
					sanitiser(
						p.replace(/^\/*/, '')
					) + '.html'
				);

				// Reassign index/HTML path names to Boolean values
				// based off of their existence in the file system,
				// giving the `index.html` file priority.
				if (fs.existsSync(index)) {
					html = false;
				}
				else if (fs.existsSync(html)) {
					index = false;
				}
				else {
					html = false;
					index = false;
				}

				// Define a pathname or a Boolean value from the
				// `index.html` or HTML file, if applicable.
				let pathname = index || html;

				// Is there an `index.html` or HTML file?
				if (pathname) {
					// Read the file.
					fs.readFile(pathname, (error, data) => {

						// Error handling
						if (error) {
							// End the response with 500.
							response.statusCode = 500;
							return response.end('500: Internal Server Error');
						}

						// End the response with data.
						response.writeHead(
							// Status code
							200,

							// Headers
							{ 'Content-Type': 'text/html' }
						);
						response.write(data.toString());
						return response.end();
					});
				}

				// Do none of the files exist?
				else {
					// End the response with 404.
					response.statusCode = 404;
					return response.end('404: Not Found');
				}
			}
		}

		// Different request method?
		else {
			// End the response.
			return response.end();
		}
	});

	// Initiate the HTTP server.
	server.listen(
		config.server.port, // Port to listen on
		config.server.host, // Host to host on
		() => {
			// Print success message.
			console.clear();
			console.log(`HTTP server running at http://${config.server.host}:${config.server.port}\n`);
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
