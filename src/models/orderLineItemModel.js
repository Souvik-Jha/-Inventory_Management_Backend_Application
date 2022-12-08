const mongoose = require('mongoose');

const orderLineItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    sellPrice: {
        type: Number,
        required: true,
        trim: true
    },
    deleted: {
        type: Boolean,
        default: false
    }

}, { timestamps: true })

module.exports = mongoose.model('OrderLineItem', orderLineItemSchema)