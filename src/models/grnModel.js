const mongoose = require("mongoose")

const grnSchema = new mongoose.Schema({
    vendorName: {
        type: String,
        required: true,
        trim: true
    },
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },

    vendorFullAddress: {
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
    grnLineItems: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "GrnLineItem",
        required: true
    },
    status: {
        type: String,
        enum: ["GENERATED", "COMPLETED", "CANCELLED"],
        default: "GENERATED",
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    deleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

module.exports = mongoose.model('Grn', grnSchema)