const functions = require('firebase-functions/v2');
const { logger } = require('firebase-functions');

exports.helloWorldV2 = functions.https.onRequest((request, response) => {
    if (request.method === 'GET') {
        logger.info('GET request received!');
        return response.json({ message: 'hello, world!' });
    } else {
        logger.warn('Unsupported request method!');
        return response.status(405).json({ error: 'Method Not Allowed' });
    }
});
