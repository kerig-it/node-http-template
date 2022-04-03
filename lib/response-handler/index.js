// Prototype module of the response handler to handle outgoing
// messages in the HTTP server.

// Ends responses (#1)
const responseHandler = (response, status = '200 OK', headers = {}, method = 'GET', body) => {

	// Response object validation
	if (typeof(response) === 'object') {

		// Parse the status string + assignment.
		response.statusCode = parseInt(status.substring(0, 3));
		response.statusMessage = status.substring(4);

		// Loop over and set headers.
		for (const [ key, value ] of Object.entries(headers)) {
			response.setHeader(key, value);
		}

		// Define the response chunk.
		let chunk = body ?? status;
		response.setHeader('Content-Length', chunk.length);

		// Write the chunk if applicable.
		if (method !== 'HEAD') {
			response.write(chunk);
		}

		// End the response.
		return response.end();
	}
};

module.exports = responseHandler;
