const mongoose = require('mongoose')
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    email: { type: String, required: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, default: '' },
    country: { type: String, default: '' },
    street: { type: String, default: '' },
    zip: { type: String, default: '' },
    apartment: { type: String, default: '' },
})

userSchema.virtual('id').get(function () {
    return this._id.toHexString()
})

userSchema.set('toJSON', { virtuals: true })

exports.User = mongoose.model('User', userSchema)
exports.userSchema = userSchema
