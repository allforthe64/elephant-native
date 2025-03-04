functions = require('firebase-functions/v2')

exports.helloWorldV2  = functions.https.onRequest((request, response) => {
    return response.json({ message: 'hello, world!' })
})