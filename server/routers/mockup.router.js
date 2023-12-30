const express = require('express')
const router = express.Router()
const {
    getShopID,
    getVariants,
    uploadImage,
    createProduct
} = require('../controllers/mockup.controller')

router.get('/shop', getShopID)

router.post('/variants', getVariants)

router.post('/upload', uploadImage)

router.post('/create', createProduct)

module.exports = router;