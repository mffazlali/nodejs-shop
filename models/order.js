const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
    shippingAddress1: { type: String, required: true },
    shippingAddress2: { type: String, required: true },
    city: { type: String, required: true },
    zip: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
    totalPrice: { type: Number, default: 0 },
    status: { type: Number, default: 0 },
    dateOrdered: { type: Date, default: Date.now },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    orderItems: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'OrderItem',
            required: true,
        },
    ],
})

orderSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

orderSchema.set('toJSON', { virtuals: true })

exports.Order = mongoose.model('Order', orderSchema)
