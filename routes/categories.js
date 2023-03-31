const express = require('express')
const router = express.Router()
const { Category } = require('../models/category')

router.get(`/`, async (req, res) => {
    const categoryList = await Category.find()
    if (!categoryList) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(categoryList)
})

router.get(`/:id`, async (req, res) => {
    try {
        const category = await Category.findById(req.params.id)
        if (!category)
            return res.status(500).json({
                message: 'The category with the given ID was not found',
            })
        res.status(200).send(category)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.post(`/`, async (req, res) => {
    try {
        let category = new Category({
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon,
        })
        category = await category.save()
        if (!category)
            return res.status(400).send('The category cannot be created!')
        res.status(200).send(category)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.put(`/:id`, async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.name,
                color: req.body.color,
                icon: req.body.icon,
            },
            { new: true }
        )
        if (!category)
            return res.status(400).send('The category cannot be created!')
        res.status(200).send(category)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    Category.findByIdAndRemove(req.params.id)
        .then((category) => {
            if (category)
                res.status(200).json({
                    success: true,
                    message: 'The category is deleted',
                })
            else
                res.status(404).json({
                    success: false,
                    message: 'category not found',
                })
        })
        .catch((err) => {
            res.status(500).json({ success: false, error: err })
        })
})

module.exports = router
