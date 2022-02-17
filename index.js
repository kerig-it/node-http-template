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
			p = q.pathname === '/' ? '/' : q.pathname.replace(/\/?$/, '');

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
					config.client.pages, // Client pages, if applicable

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
					// Read the `index.html` or HTML file.
					fs.readFile(pathname, (error, data) => {

						// Error handling
						if (error) {
							// End the response with 500.
							response.statusCode = 500;
							return response.end('500: Internal Server Error');
						}

						// End the response with data.
						response.writeHead(
							200,
							{
								'Content-Type': 'text/html'
							}
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

		// Is the requested method not one of the above?
		else {
			// End the response.
			return response.end();
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
