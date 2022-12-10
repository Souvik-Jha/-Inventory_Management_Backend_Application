const itemModel = require("../models/itemModel")
const orderLineItemModel = require("../models/orderLineItemModel")
const orderModel = require("../models/orderModel")
const validator = require("../validators/validator")


const orderUpdate = async function (req, res) {
    try {
        let data = req.body
        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create order" })
        let { status, orderId } = data

        if (!status) return res.status(400).send({ status: false, message: "please provide status" })
        if (!["COMPLETED", "CANCELLED"].includes(status)) return res.status(400).send({ status: false, message: "status should be COMPLETED or CANCELLED" })

        if (!orderId) return res.status(400).send({ status: false, message: "please provide orderId" })
        if (!validator.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: 'Please provide valid orderId' })
        let orderCheck = await orderModel.findOneAndUpdate({ _id: orderId,deleted:false, status:"GENERATED" }, { status }, { new: true })
        if (!orderCheck) return res.status(404).send({ status: false, message: "This action cannot be done" })


        if (status == "COMPLETED") {
            for (let i = 0; i < orderCheck.orderLineItems.length; i++) {
                let ItemDoc = await orderLineItemModel.findById(orderCheck.orderLineItems[i]).select({ _id: 0, productName: 1, quantity: 1 })
                let updatedItem = await itemModel.updateOne({ productName: ItemDoc.productName }, { $inc: { quantity: -ItemDoc.quantity } })
                console.log(ItemDoc, updatedItem)
            }
        }
        return res.status(200).send({ status: true, message: orderCheck })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { orderUpdate }