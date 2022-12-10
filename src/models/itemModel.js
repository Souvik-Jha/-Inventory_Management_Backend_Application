const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    productName: {
        type: String,
        unique: true,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        default: 0
    },
    stockPrice: {
        type: Number,
        trim: true
    },
    sellPrice: {
        type: Number,
        trim: true
    },
    deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model('Item', itemSchema)