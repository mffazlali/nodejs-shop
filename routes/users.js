const express = require('express')
const router = express.Router()
const { User } = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

router.get(`/`, async (req, res) => {
    const userList = await User.find().select('-passwordHash')
    if (!userList) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(userList)
})

router.get(`/:id`, async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash')
    if (!user) {
        return res.status(500).json({ success: false })
    }
    res.status(200).send(user)
})

router.get(`/get/count`, async (req, res) => {
    const userCount = await User.countDocuments()
    if (!userCount) {
        return res.status(500).json({ success: false })
    }
    res.send({ count: userCount })
})

router.post(`/`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        apartment: req.body.apartment,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        zip: req.body.zip,
    })
    user = await user.save()
    if (!user) res.status(500).send('The user connot the created')
    res.send(user)
})

router.post(`/register`, async (req, res) => {
    let user = new User({
        name: req.body.name,
        apartment: req.body.apartment,
        city: req.body.city,
        country: req.body.country,
        email: req.body.email,
        isAdmin: req.body.isAdmin,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        street: req.body.street,
        zip: req.body.zip,
    })
    user = await user.save()
    if (!user) res.status(500).send('The user connot the created')
    res.send(user)
})

router.put(`/:id`, async (req, res) => {
    const userExist = await User.findById(req.params.id)
    let newPassword
    if (req.body.password) newPassword = bcrypt.hashSync(req.body.password, 10)
    else newPassword = userExist.passwordHash
    let user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            apartment: req.body.apartment,
            city: req.body.city,
            country: req.body.country,
            email: req.body.email,
            isAdmin: req.body.isAdmin,
            passwordHash: newPassword,
            phone: req.body.phone,
            street: req.body.street,
            zip: req.body.zip,
        },
        { new: true }
    )
    if (!user) res.status(500).send('The user with given ID was not found')
    res.send(user)
})

router.post('/login', async (req, res) => {
    const secret = process.env.secret
    let user = await User.findOne({ email: req.body.email })
    if (!user) return res.status(400).send('The user not found')
    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1d' }
        )
        res.send({ user: user.email, token: token })
    } else {
        res.status(400).send('password is wrong!')
    }
})

router.delete('/:id', async (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user)
                res.status(200).json({
                    success: true,
                    message: 'The user is deleted',
                })
            else
                res.status(404).json({
                    success: false,
                    message: 'user not found',
                })
        })
        .catch((err) => {
            res.status(400).json({ success: false, error: err })
        })
})

module.exports = router
