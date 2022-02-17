// Entry point of this Node application.
//
// Refer to the README for more information.
//
// GitHub: https://github.com/kerig-it/node-tmpl

// Node modules
const
	fs = require('fs'),
	http = require('http'),
	path = require('path'),
	sanitiser = require('sanitiser'),
	url = require('url');

// Configuration variable
let config;

try {
	// Read and parse contents from `config.json` to `config`.
	config = JSON.parse(fs.readFileSync(
		'config.json'
	).toString());
}
catch (error) {
	// If there was an error, throw it.
	throw error;
}

// Main function
const main = () => {

	// Define an HTTP server.
	let srv = http.createServer((request, response) => {

		// Define query variables.
		let
			q = url.parse(request.url, true),
			p = q.pathname.replace(/\/?$/, '');

		// Define a possible path name.
		let pathname = path.join(
			config.client.dir, // Client directory
			config.client.public, // Client public path

			// Sanitised requested path
			sanitiser(
				p.replace(/^\/*/, '')
			)
		);

		// Does the requested path exist?
		if (fs.existsSync(pathname)) {

			// Resolve the path name.
			pathname = path.resolve(pathname);

			// Is the requested path a file?
			if (fs.statSync(pathname).isFile()) {
				// Read the requested file.
				fs.readFile(pathname, (error, data) => {

					// Error handling
					if (error) {
						// End the response with 500.
						response.statusCode = 500;
						return response.end('500: Internal Server Error');
					}

					// Return `data` as a string.
					response.statusCode = 200;
					return response.end(data.toString());
				});
			}

			// Is the requested path a directory?
			else if (fs.statSync(pathname).isDirectory()) {

				// Define a possible `index.html` inside the directory.
				let index = path.join(pathname, 'index.html');

				// Does the possible `index.html` file exist?
				if (fs.existsSync(index)) {
					// Read the `index.html` file.
					fs.readFile(index, (error, data) => {

						// Error handling
						if (error) {
							// End the response with 500.
							response.statusCode = 500;
							return response.end('500: Internal Server Error');
						}

						// End the response the `index.html` file.
						response.writeHead(
							200,
							{ 'Content-Type': 'text/html' }
						);
						response.write(data.toString());
						return response.end();
					});
				}
			}
		}

		// Does the requested path not exist?
		else {
			// End the response with 404.
			response.statusCode = 404;
			return response.end('404: Not Found');
		}
	});

	// Initiate the HTTP server.
	srv.listen(
		config.server.port, // Port to listen on
		config.server.host, // Host to host on
		() => {
			// Print success message.
			console.clear();
			console.log(`HTTP server running at http://${config.server.host}:${config.server.port}\n`);
		}
	);
};

try {
	main();
}
catch (error) {
	throw error;
}
