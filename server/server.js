const express = require('express')
const app = express()



module.exports = {
    start(port, window) {
        app.get('/', (req, res) => res.send('Hello World!'))

        app.listen(port, () => console.log(`Server running on port: ${port}`))
    }
}