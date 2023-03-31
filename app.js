require('dotenv/config')
const express = require('express')
const bodyParser = require('body-parser')
const morgan = require('morgan')
const mongoose = require('mongoose')
const productsRouter = require('./routes/products')
const categoriesRouter = require('./routes/categories')
const ordersRouter = require('./routes/orders')
const usersRouter = require('./routes/users')
const cors = require('cors')
const api = process.env.API_URL
const app = express()
const authJwt = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')

app.use(cors())
app.options('*', cors())

//middleware
app.use(express.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use('/public/uploads', express.static(__dirname + '/public/uploads'))
app.use(errorHandler)

//routes
app.use(`${api}/products`, productsRouter)
app.use(`${api}/categories`, categoriesRouter)
app.use(`${api}/orders`, ordersRouter)
app.use(`${api}/users`, usersRouter)

// database
mongoose
    .set('strictQuery', true)
    .connect(process.env.CONNECTION_STRING_LOCAL, {
        dbName: process.env.DB_NAME,
    })
    .then(() => {
        console.log('Database connection is ready...')
    })
    .catch((err) => {
        console.log(err)
    })

//server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`server is running in port ${PORT}`)
})
