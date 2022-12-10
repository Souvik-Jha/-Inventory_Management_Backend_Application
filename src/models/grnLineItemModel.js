const mongoose = require("mongoose")

const grnLineItemSchema = new mongoose.Schema({
    productName: {
        type: String,
        required: true,
        trim: true
    },
    quantity: {
        type: Number,
        required: true
    },
    stockPrice: {
        type: Number,
        required: true,
        trim: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('GrnLineItem', grnLineItemSchema)