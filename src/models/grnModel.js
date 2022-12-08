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
        type: String,
        required: true,
        trim: true
    },
    grnLineItems: {
        type: mongoose.Types.ObjectId,
        ref: "grnLineitems",
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