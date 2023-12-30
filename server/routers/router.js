const express = require('express')
const router = express.Router()
const mockupRouter = require('./mockup.router')

router.use('/mockup', mockupRouter)

module.exports = router