const express = require('express')
const router = express.Router()
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const { Product } = require('../models/product')
const stripe = require('stripe')(
    'sk_test_51Mc2tKJdtUormTWZnSfwxC9RHbARKXABAaFfFoMFpNDUcUmFr56lgTjkqwYZ7KeNDQTOruQRSctiqgRBV5e2sJOr00fsYKZVpv'
)

router.get(`/`, async (req, res) => {
    const orderList = await Order.find().populate('user', 'name')
    if (!orderList) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(orderList)
})

router.get(`/get/count`, async (req, res) => {
    const orderCount = await Order.countDocuments()
    if (!orderCount) {
        return res.status(500).json({ success: false })
    }
    res.send({ count: orderCount })
})

router.get(`/:id`, async (req, res) => {
    const order = await Order.findById(req.params.id)
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' },
        })
        .sort({ dateOrdered: -1 })
    if (!order) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(order)
})

router.get(`/get/totalsales`, async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id: null, totalsales: { $sum: '$totalPrice' } } },
    ])
    if (!totalSales) {
        return res.status(500).send('The order sales connot be generated')
    }
    res.status(200).send({ totalSales: totalSales.pop().totalsales })
})

router.get(`/get/userorders/:userid`, async (req, res) => {
    const userOrderList = await Order.find({ user: req.params.userid })
        .populate('user', 'name')
        .populate({
            path: 'orderItems',
            populate: { path: 'product', populate: 'category' },
        })
        .sort({ dateOrdered: -1 })
    if (!userOrderList) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(userOrderList)
})

router.post(`/`, async (req, res) => {
    try {
        const orderItemsIds = Promise.all(
            req.body.orderItems.map(async (orderItem) => {
                let newOrderItem = new OrderItem({
                    product: orderItem.product,
                    quantity: orderItem.quantity,
                })

                newOrderItem = await newOrderItem.save()
                return newOrderItem._id
            })
        )
        const orderItemsIdsResolved = await orderItemsIds

        const totalPrices = await Promise.all(
            orderItemsIdsResolved.map(async (orderItemId) => {
                const orderItem = await OrderItem.findById(
                    orderItemId
                ).populate('product')
                const totalPrice = orderItem.product.price * orderItem.quantity
                return totalPrice
            })
        )

        const totalPrice = totalPrices.reduce((prev, curr) => prev + curr, 0)

        let order = new Order({
            city: req.body.city,
            country: req.body.country,
            orderItems: orderItemsIdsResolved,
            phone: req.body.phone,
            status: req.body.status,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            zip: req.body.zip,
            totalPrice: totalPrice,
            user: req.body.user,
        })
        order = await order.save()
        if (!order) return res.status(400).send('The order cannot be created!')
        res.status(200).send(order)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.post('/create-checkout-session', async (req, res) => {
    const orderItems = req.body
    if (!orderItems) {
        return res
            .status(400)
            .send('checkout session cannot be created - check the order items')
    }
    const line_items = await Promise.all(
        orderItems.map(async (orderItem) => {
            const product = await Product.findById(orderItem.product)
            return {
                price_data: {
                    currency: 'usd',
                    product_data: { name: product.name },
                    unit_amount: product.price,
                },
                quantity: orderItem.quantity,
            }
        })
    )
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: line_items,
            mode: 'payment',
            success_url: 'http://localhost:4300/success',
            cancel_url: 'http://localhost:4300/error',
        })
        res.json({ id: session.id })
    } catch (error) {
        res.status(500).send(error)
    }
})

router.put(`/:id`, async (req, res) => {
    try {
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            {
                status: req.body.status,
            },
            { new: true }
        )
        if (!order) return res.status(400).send('The order cannot be created!')
        res.status(200).send(order)
    } catch (err) {
        res.status(400).send(err.message)
    }
})

router.delete('/:id', async (req, res) => {
    Order.findByIdAndRemove(req.params.id)
        .then(async (order) => {
            if (order) {
                await order.orderItems.map(async (orderItem) => {
                    await OrderItem.findByIdAndRemove(orderItem)
                })
                res.status(200).json({
                    success: true,
                    message: 'The order is deleted',
                })
            } else
                res.status(404).json({
                    success: false,
                    message: 'order not found',
                })
        })
        .catch((err) => {
            res.status(500).json({ success: false, error: err })
        })
})

module.exports = router
