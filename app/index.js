const express = require('express')
const app = express()
app.use(bodyParser.json())
app.use('/api/products', products)
app.use('/api/orders', orders)
module.exports = app