const express = require('express')
const router = express.Router()
const { Product } = require('../models/product')
const { Category } = require('../models/category')
const { default: mongoose } = require('mongoose')
const multer = require('multer')

const FILE_TYPE_MAP = {
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg',
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const isValid = FILE_TYPE_MAP[file.mimetype]
        let uploadedError = new Error('invalid image error')
        if (isValid) uploadedError = null
        cb(uploadedError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const fileName = file.originalname.split(' ').join('-')
        const extention = FILE_TYPE_MAP[file.mimetype]
        cb(null, `${fileName}-${Date.now()}.${extention}`)
    },
})

const uploadOptions = multer({ storage })

router.get(`/`, async (req, res) => {
    let filter = {}
    if (req.query.categories)
        filter = { category: req.query.categories.split(',') }
    const productList = await Product.find(filter).populate('category')
    if (!productList) {
        return res.status(500).json({ success: false })
    }
    res.send(productList)
})

router.get(`/:id`, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category')
            .select('name brand price countInStock image images description richDescription isFeatured')
        if (!product) {
            return res.status(500).json({ success: false })
        }
        res.send(product)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.get(`/get/count`, async (req, res) => {
    const productCount = await Product.countDocuments()
    if (!productCount) {
        return res.status(500).json({ success: false })
    }
    res.send({ count: productCount })
})

router.get(`/get/featured/:count`, async (req, res) => {
    const productCount = req.params.count ? +req.params.count : 0
    const productList = await Product.find({ isFeatured: true }).limit(
        productCount
    )
    if (!productList) {
        return res.status(500).json({ success: false })
    }
    res.send(productList)
})

router.post(`/`, uploadOptions.single('image'), async (req, res) => {
    const category = await Category.findById(req.body.category)
    if (!category) return res.status(400).send('Invalid Category')

    const file = req.file
    if (!file) res.status(400).send('No image in the request')
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    let product = new Product({
        name: req.body.name,
        brand: req.body.brand,
        category: req.body.category,
        countInStock: req.body.countInStock,
        description: req.body.description,
        richDescription: req.body.richDescription,
        image: `${basePath}${fileName}`,
        isFeatured: req.body.isFeatured,
        numReviews: req.body.numReviews,
        price: req.body.price,
        rating: req.body.rating,
        reviews: req.body.reviews,
    })
    try {
        product = await product.save()
        if (!product)
            return res.status(500).send('The product connot the created')
        res.send(product)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.put('/:id', uploadOptions.single('image'), async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id))
            res.status(400).send('Invalid Product Id')
        const category = await Category.findById(req.body.category)
        if (!category) return res.status(400).send('Invalid Category')

        const product = await Product.findById(req.params.id)
        if (!product) return res.status(400).send('Invalid Product')

        const file = req.file
        let imagepath
        if (file) {
            const fileName = req.file.filename
            const basePath = `${req.protocol}://${req.get(
                'host'
            )}/public/uploads/`
            imagepath = `${basePath}${fileName}`
        } else {
            imagepath = product.image
        }

        const updateProduct = await Product.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                brand: req.body.brand,
                category: req.body.category,
                countInStock: req.body.countInStock,
                description: req.body.description,
                richDescription: req.body.richDescription,
                image: imagepath,
                isFeatured: req.body.isFeatured,
                numReviews: req.body.numReviews,
                price: req.body.price,
                rating: req.body.rating,
                reviews: req.body.reviews,
            },
            { new: true }
        )
        if (!updateProduct)
            return res.status(400).send('The product cannot be created!')
        res.status(200).send(updateProduct)
    } catch (err) {
        return res.status(400).send(err.message)
    }
})

router.put(
    `/gallery-images/:id`,
    uploadOptions.array('images', 10),
    async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                res.status(400).send('Invalid Product Id')

            const product = await Product.findById(req.params.id)
            if (!product) return res.status(400).send('Invalid Product')

            const files = req.files
            const basePath = `${req.protocol}://${req.get(
                'host'
            )}/public/uploads/`
            let imagesPaths = []
            if (files) {
                files.map((file) => {
                    const fileName = file
                    imagesPaths.push(`${basePath}${fileName}`)
                })
            }

            const updateProduct = await Product.findByIdAndUpdate(
                req.params.id,
                {
                    images: imagesPaths,
                },
                { new: true }
            )
            if (!updateProduct)
                return res.status(400).send('The product cannot be created!')
            res.status(200).send(updateProduct)
        } catch (err) {
            res.status(400).send(err.message)
        }
    }
)

router.delete('/:id', async (req, res) => {
    Product.findByIdAndRemove(req.params.id)
        .then((product) => {
            if (product)
                res.status(200).json({
                    success: true,
                    message: 'The product is deleted',
                })
            else
                res.status(404).json({
                    success: false,
                    message: 'product not found',
                })
        })
        .catch((err) => {
            res.status(400).json({ success: false, error: err })
        })
})

module.exports = router
