const mongoose = require('mongoose')
const orderItemSchema = new mongoose.Schema({
    quantity: { type: Number, default: 0 },
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
})
exports.OrderItem = mongoose.model('OrderItem', orderItemSchema)
