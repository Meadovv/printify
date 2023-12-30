const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');

dotenv.config()

const app = express()
app.use(express.json({
    limit: '50mb'
}))
app.use(morgan('dev'))
app.use('/api/v1', require('./routers/router'))

app.get('/', (req, res) => {
    res.status(200).send({
        success: true,
        message: 'Server is running!'
    })
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Server is running on port ${process.env.SERVER_PORT}`)
})
