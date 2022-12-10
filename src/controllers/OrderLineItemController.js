const itemModel = require("../models/itemModel")
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
        let orderCheck = await orderModel.findOneAndUpdate({ _id: orderId, deleted: false, status: "GENERATED" }, { status }, { new: true }).populate("orderLineItems")
        if (!orderCheck) return res.status(404).send({ status: false, message: "This action cannot be done" })


        if (status == "COMPLETED") {
            for (let i = 0; i < orderCheck.orderLineItems.length; i++) {
                let updatedItem = await itemModel.updateOne({ productName: orderCheck.orderLineItems[i].productName }, { $inc: { quantity: -orderCheck.orderLineItems[i].quantity } })
            }
        }
        return res.status(200).send({ status: true, message: orderCheck })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { orderUpdate }