functions = require('firebase-functions/v2')

export const helloWorldV2  = functions.https.onRequest((request, response) => {
    return response.json({ message: 'hello, world!' })
})