const validator = require("../validators/validator")
const itemModel = require("../models/itemModel");
const orderLineItemModel = require("../models/orderLineItemModel");
const orderModel = require("../models/orderModel");

const nameRegex = /^[a-zA-Z ]{2,45}$/;


const createOrder = async function (req, res) {
    try {
        let data = req.body
        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create Order" })
        let { customerName, invoiceNumber, customerFullAddress, orderLineItems } = data

        if (!customerName) return res.status(400).send({ status: false, message: "customerName is required" })
        if (!validator.isValid(customerName) && !(nameRegex.test(customerName))) return res.status(400).send({ status: false, message: "customerName must be in string & not empty" })

        if (!invoiceNumber) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
        if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
        if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
        let checkInvoice = await orderModel.findOne({ invoiceNumber })
        if (checkInvoice) return res.status(409).send({ status: false, message: "invoiceNumber is already present, please update the existing doc." })

        if (!customerFullAddress.street) { return res.status(400).send({ status: false, message: "Please include street" }) };
        if (!validator.isValid(customerFullAddress.street)) {
            return res.status(400).send({ status: false, message: "street is required in customerFullAddress!" });
        }

        if (!customerFullAddress.city) { return res.status(400).send({ status: false, message: "Please include city" }) };
        if (!validator.isValid(customerFullAddress.city)) {
            return res.status(400).send({ status: false, message: "city is required in customerFullAddress!" });
        }

        if (!(customerFullAddress.pincode)) return res.status(400).send({ status: false, message: "please provide pincode!" });
        if (!(/^[1-9][0-9]{5}$/.test(customerFullAddress.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })

        for (let i = 0; i < orderLineItems.length; i++) {
            if (!orderLineItems[i].productName) return res.status(400).send({ status: false, message: "productName is required" })
            if (!validator.isValid(orderLineItems[i].productName)) return res.status(400).send({ status: false, message: "productName must be in string & not empty" })

            if (!orderLineItems[i].quantity) return res.status(400).send({ status: false, message: "quantity is required" })
            if (!/^[0-9]+$/.test(orderLineItems[i].quantity)) return res.status(400).send({ status: false, message: "Quantity should be a valid number" })

            let productId = await itemModel.findOne({ productName: orderLineItems[i].productName })
            if (!productId) return res.status(400).send({ ststus: false, message: "This product is not present" })
            let createOrderLineItem = await orderLineItemModel.create({ productName: orderLineItems[i].productName, quantity: orderLineItems[i].quantity, sellPrice: productId.sellPrice })
            data.orderLineItems[i] = createOrderLineItem
            console.log("Items:" + createOrderLineItem)
        }


        // if (!grnLineItems) return res.status(400).send({ status: false, message: 'Please provide grnLineItems' })
        // if (!validator.isValidObjectId(grnLineItems)) return res.status(400).send({ status: false, message: 'Please provide valid grnLineItems' })
        // let grnLineItemCheck = await grnLineItemModel.findById(grnLineItems)
        // if (!grnLineItemCheck) return res.status(404).send({ status: false, message: ` grnLineItem ${grnLineItems} not found` })
        // if (grnLineItemCheck.isDeleted == true) return res.status(404).send({ status: false, message: `${data.productId} this product is deleted` })

        data.date = Date.now()

        let createDoc = await (await orderModel.create(data)).populate("orderLineItems")
        res.status(201).send({ status: true, message: 'Success', data: createDoc })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getOrder = async function (req, res) {
    try {
        let query = req.query

        const { customerName, invoiceNumber, status, orderId } = query
        if (customerName) {
            if (!validator.isValid(customerName) && !(nameRegex.test(customerName))) return res.status(400).send({ status: false, message: "customerName must be in string & not empty" })
        }

        if (invoiceNumber) {
            if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
            if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
        }

        if (status) {
            if (!["GENERATED", "COMPLETED", "CANCELLED"].includes(status)) return res.status(400).send({ status: false, message: "status should be COMPLETED , CANCELLED or GENERATED" })
        }

        if (orderId) {
            if (!validator.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: 'Please provide valid orderId' })
            query._id = orderId
        }

        let orderDoc = await orderModel.find({ ...query, deleted: false }).populate("orderLineItems")
        if (!orderDoc.length) return res.status(400).send({ status: false, message: "no such Order" })
        return res.status(200).send({ status: true, message: orderDoc })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateOrder = async function (req, res) {
    try {
        let data = req.body
        let orderId = req.params.orderId

        if (!validator.isValid(orderId)) return res.status(400).send({ status: false, message: "orderId is not given" });
        if (!validator.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "orderId is Invalid" });
        const checkOrder = await orderModel.findById(orderId);
        if (!checkOrder) return res.status(404).send({ status: false, message: "NO DATA FOUND" });
        if (checkOrder.deleted == true) return res.status(404).send({ status: false, message: "order is already deleted" })

        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to update order" })
        let { customerName, invoiceNumber, customerFullAddress } = data
        let updateData = {}

        if (customerName) {
            if (!validator.isValid(customerName) && !(nameRegex.test(customerName))) return res.status(400).send({ status: false, message: "customerName must be in string & not empty" })
            updateData.customerName = customerName
        }

        if (invoiceNumber) {
            if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
            if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
            let checkInvoice = await orderModel.findOne({ invoiceNumber })
            if (checkInvoice) return res.status(409).send({ status: false, message: "invoiceNumber is already present" })
            updateData.invoiceNumber = invoiceNumber
        }

        if (customerFullAddress) {
            if (typeof customerFullAddress === "string") { customerFullAddress = JSON.parse(customerFullAddress) }
            if (!validator.isValidRequestBody(customerFullAddress)) return res.status(400).send({ status: false, message: "customerFullAddress is required" })

            if (customerFullAddress.street) {
                if (!validator.isValid(customerFullAddress.street)) {
                    return res.status(400).send({ status: false, message: "street is required in customerFullAddress!" });
                }
                updateData['customerFullAddress.street'] = customerFullAddress.street;
            }

            if (customerFullAddress.city) {
                if (!validator.isValid(customerFullAddress.city)) return res.status(400).send({ status: false, message: "city is required in customerFullAddress!" });
                updateData['customerFullAddress.city'] = customerFullAddress.city;
            }

            if (customerFullAddress.pincode) {
                let pinCode = parseInt(customerFullAddress.pincode)
                if (!(/^[1-9][0-9]{5}$/.test(pinCode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                updateData['customerFullAddress.pincode'] = pinCode;
            }
        }

        let updatedOrder = await orderModel.findByIdAndUpdate(orderId, updateData, { new: true }).populate("orderLineItems")
        return res.status(200).send({ status: false, message: updatedOrder })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const deleteOrder = async function (req, res) {
    try {
        let orderId = req.params.orderId
        if (!orderId) return res.status(400).send({ status: false, message: "provide orderId" })
        if (!validator.isValidObjectId(orderId)) return res.status(400).send({ status: false, message: "invalid orderId" })
        let checkId = await orderModel.findById({ _id: orderId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such order" })
        if (checkId.deleted == true) return res.status(404).send({ status: false, message: "order is already deleted" })

        let deletedDoc = await orderModel.findOneAndUpdate({ _id: orderId }, { deleted: true }, { new: true })
        console.log(deletedDoc)
        return res.status(200).send({ status: true, message: "order deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createOrder, getOrder, updateOrder, deleteOrder }