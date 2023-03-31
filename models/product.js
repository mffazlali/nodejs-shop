const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    brand: { type: String, default: '' },
    price: { type: Number, default: 0 },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    description: { type: String, required: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    // reviews: [
    //     {
    //         type: { avatar: String, name: String, review: String },
    //         default: null,
    //     },
    // ],
    countInStock: { type: Number, required: true, min: 0, max: 255 },
    richDescription: { type: String, default: '' },
    images: [{ type: String, default: null }],
    dateCreated: { type: Date, default: Date.now },
})

productSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

productSchema.set('toJSON', { virtuals: true })

exports.Product = mongoose.model('Product', productSchema)
