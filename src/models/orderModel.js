const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId

const orderSchema = new mongoose.Schema({
    customerName: {
        type: String,
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    customerFullAddress: {
        street: {
            type: String,
            require: true,
            trim: true
        },
        city: {
            type: String,
            require: true,
            trim: true
        },
        pincode: {
            type: Number,
            require: true,
            trim: true
        }
    },
    orderLineItems: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "OrderLineItem",
        required: true
    },
    status: {
        type: String,
        default: "GENERATED",
        enum: ["GENERATED", "COMPLETED", "CANCELLED"],
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
}, { timestamps: true })

module.exports = mongoose.model('Order', orderSchema)