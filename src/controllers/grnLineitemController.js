const grnLineItemModel = require("../models/grnLineItemModel")
const grnModel = require("../models/grnModel")
const itemModel = require("../models/itemModel")
const validator = require("../validators/validator")


const grnUpdate = async function (req, res) {
    try {
        let data = req.body
        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create grn" })
        let { status, grnId } = data

        if (!status) return res.status(400).send({ status: false, message: "please provide status" })
        if (!["COMPLETED", "CANCELLED"].includes(status)) return res.status(400).send({ status: false, message: "status should be COMPLETED or CANCELLED" })

        if (!grnId) return res.status(400).send({ status: false, message: "please provide grnId" })
        if (!validator.isValidObjectId(grnId)) return res.status(400).send({ status: false, message: 'Please provide valid grnId' })
        let grnCheck = await grnModel.findOneAndUpdate({ _id: grnId, deleted:false , status:"GENETATED"}, { status }, { new: true })
        if (!grnCheck) return res.status(404).send({ status: false, message: "action cannot be done" })
        


        if (status == "COMPLETED") {
            for (let i = 0; i < grnCheck.grnLineItems.length; i++) {
                let ItemDoc = await grnLineItemModel.findById(grnCheck.grnLineItems[i]).select({ _id: 0, productName: 1, quantity: 1 })
                let updatedItem = await itemModel.updateOne({ productName: ItemDoc.productName }, { $inc: { quantity: ItemDoc.quantity } })
                console.log(ItemDoc, updatedItem)
            }
        }
        return res.status(200).send({ status: true, message: grnCheck })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { grnUpdate }