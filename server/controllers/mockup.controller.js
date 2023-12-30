const axios = require('axios');
const { response } = require('express');

const getShopID = async (req, res) => {
    await axios.get('https://api.printify.com/v1/shops.json',
    {
        headers: {
            'Authorization': 'Bearer ' + process.env.PRINTIFY_API_KEY
        }
    }).then(response => {
        res.status(200).send({
            success: true,
            data: response.data[0].id
        })
    }).catch(error => {
        console.log(error)
        res.status(500).send({
            success: false,
            message: error.message
        })
    })
}

const getVariants = async (req, res) => {
    await axios.get(`https://api.printify.com/v1/catalog/blueprints/${req.body.blueprintId}/print_providers/${req.body.printProviderId}/variants.json`,
    {
        headers: {
            'Authorization': 'Bearer ' + process.env.PRINTIFY_API_KEY
        }
    }).then(response => {

        const variants = []
        response.data.variants.forEach(variant => {
            const size = variant.title.split(' / ')[1]
            if(size === 'S') variants.push({
                ...variant,
                title: variant.title.split(' / ')[0],
                isChoose: false
            })
        })

        res.status(200).send({
            success: true,
            title: response.data.title,
            variants: variants
        })
    }).catch(error => {
        console.log(error)
        res.status(500).send({
            success: false,
            message: error.message
        })
    })

}

const uploadImage = async (req, res) => {
    await axios.post('https://api.printify.com/v1/uploads/images.json', {
        file_name: req.body.imageName,
        url: req.body.imageLink
    }, {
        headers: {
            'Authorization': 'Bearer ' + process.env.PRINTIFY_API_KEY
        }
    }).then(response => {
        res.status(200).send({
            success: true,
            imageId: response.data.id
        })
    }).catch(error => {
        console.log(error)
        res.status(500).send({
            success: false,
            message: error.message
        })
    })
}

const createProduct = async (req, res) => {
    const variants = [], variantsId = []
    req.body.variants.variantList.forEach(variant => {
        if(variant.isChoose) {
            variants.push({
                id: variant.id,
                price: 400,
                is_enabled: true
            })
            variantsId.push(variant.id)
        }
    })

    await axios.post(`https://api.printify.com/v1/shops/${req.body.shopId}/products.json`, {
        title: `Ozinpic Product ${new Date().getTime()}`,
        description: `This is a new ozinpic's product. Create Time: ${new Date().toLocaleString('en-GB')}`,
        blueprint_id: req.body.blueprint.blueprintId,
        print_provider_id: req.body.blueprint.printProviderId,
        variants: variants,
        print_areas: [
            {
                variant_ids: variantsId,
                placeholders: [
                    {
                      position: "front",
                      images: [
                          {
                            id: req.body.imageId, 
                            x: 0.5, 
                            y: 0.5, 
                            scale: 1,
                            angle: 0
                          }
                      ]
                    }
                ]
            }
        ],
    }, {
        headers: {
            'Authorization': 'Bearer ' + process.env.PRINTIFY_API_KEY
        }
    }).then(response => {
        const vid = new Map()
        variantsId.forEach(id => {
            vid.set(id, [])
        })
        response.data.images.forEach(image => {
            vid.get(image.variant_ids[0]).push(image)
        })

        const data = []
        variantsId.forEach(id => {
            const images = []
            vid.get(id).forEach(image => {
                images.push({
                    src: image.src,
                    position: image.position,
                })
            })
            data.push({
                variantId: id,
                images: images
            })
        })

        res.status(200).send({
            success: true,
            productList: data
        })
    }).catch(err => {
        console.log(err)
        res.status(500).send({
            success: false,
            message: err.message
        })
    })
}


module.exports = {
    getShopID,
    getVariants,
    uploadImage,
    createProduct
}