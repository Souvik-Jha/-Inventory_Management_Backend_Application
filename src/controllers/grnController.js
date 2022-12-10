const grnLineItemModel = require("../models/grnLineItemModel")
const grnModel = require("../models/grnModel");
const itemModel = require("../models/itemModel");
const validator = require("../validators/validator")

const nameRegex = /^[a-zA-Z ]{2,45}$/;


const createGrn = async function (req, res) {
    try {
        let data = req.body
        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create grn" })
        let { vendorName, invoiceNumber, vendorFullAddress, grnLineItems } = data

        if (!vendorName) return res.status(400).send({ status: false, message: "vendorName is required" })
        if (!validator.isValid(vendorName) && !(nameRegex.test(vendorName))) return res.status(400).send({ status: false, message: "vendorName must be in string & not empty" })

        if (!invoiceNumber) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
        if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
        if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
        let checkInvoice = await grnModel.findOne({ invoiceNumber })
        if (checkInvoice) return res.status(409).send({ status: false, message: "invoiceNumber is already present, please update the existing doc." })

        if (!vendorFullAddress.street) { return res.status(400).send({ status: false, message: "Please include street" }) };
        if (!validator.isValid(vendorFullAddress.street)) {
            return res.status(400).send({ status: false, message: "street is required in vendorFullAddress!" });
        }

        if (!vendorFullAddress.city) { return res.status(400).send({ status: false, message: "Please include city" }) };
        if (!validator.isValid(vendorFullAddress.city)) {
            return res.status(400).send({ status: false, message: "city is required in vendorFullAddress!" });
        }

        if (!(vendorFullAddress.pincode)) return res.status(400).send({ status: false, message: "please provide pincode!" });
        if (!(/^[1-9][0-9]{5}$/.test(vendorFullAddress.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })

        for (let i = 0; i < grnLineItems.length; i++) {
            if (!grnLineItems[i].productName) return res.status(400).send({ status: false, message: "productName is required" })
            if (!validator.isValid(grnLineItems[i].productName)) return res.status(400).send({ status: false, message: "productName must be in string & not empty" })

            if (!grnLineItems[i].quantity) return res.status(400).send({ status: false, message: "quantity is required" })
            if (!/^[0-9]+$/.test(grnLineItems[i].quantity)) return res.status(400).send({ status: false, message: "Quantity should be a valid number" })

            let productId = await itemModel.findOne({ productName: grnLineItems[i].productName })
            if (!productId) return res.status(400).send({ status: false, message: "This product is not listed" })
            let createGrnLineItem = await grnLineItemModel.create({ productName: productId.productName, quantity: grnLineItems[i].quantity, stockPrice: productId.stockPrice })
            data.grnLineItems[i] = createGrnLineItem._id
        }


        data.date = Date.now()

        let createDoc = await (await grnModel.create(data)).populate("grnLineItems")
        res.status(201).send({ status: true, message: 'Success', data: createDoc })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const getGrn = async function (req, res) {
    try {
        let query = req.query

        const { vendorName, invoiceNumber, status, grnId } = query
        if (vendorName) {
            if (!validator.isValid(vendorName) && !(nameRegex.test(vendorName))) return res.status(400).send({ status: false, message: "vendorName must be in string & not empty" })
        }

        if (invoiceNumber) {
            if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
            if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
        }

        if (status) {
            if (!(["GENERATED", "COMPLETED", "CANCELLED"].includes(status))) return res.status(400).send({ status: false, message: "status should be COMPLETED , CANCELLED or GENERATED" })
        }

        if (grnId) {
            if (!validator.isValidObjectId(grnId)) return res.status(400).send({ status: false, message: 'Please provide valid grnId' })
            query._id = grnId
        }

        let grnDoc = await grnModel.find({ ...query, deleted: false }).populate("grnLineItems")
        if (!grnDoc.length) return res.status(400).send({ status: false, message: "no such GRN" })
        return res.status(200).send({ status: true, message: grnDoc })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const updateGrn = async function (req, res) {
    try {
        let data = req.body
        let grnId = req.params.grnId

        if (!validator.isValid(grnId)) return res.status(400).send({ status: false, message: "grnId is not given" });
        if (!validator.isValidObjectId(grnId)) return res.status(400).send({ status: false, message: "grnId is Invalid" });
        const checkGrn = await grnModel.findById(grnId);
        if (!checkGrn) return res.status(404).send({ status: false, message: "NO DATA FOUND" });
        if (checkGrn.deleted == true) return res.status(404).send({ status: false, message: "grn is already deleted" })

        if (!validator.isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to update grn" })
        let { vendorName, invoiceNumber, vendorFullAddress } = data
        let updateData = {}

        if (vendorName) {
            if (!validator.isValid(vendorName) && !(nameRegex.test(vendorName))) return res.status(400).send({ status: false, message: "vendorName must be in string & not empty" })
            updateData.vendorName = vendorName
        }

        if (invoiceNumber) {
            if (!validator.isValid(invoiceNumber)) return res.status(400).send({ status: false, message: "invoiceNumber is required" })
            if (!(/^[A-Za-z0-9]+$/im.test(invoiceNumber))) return res.status(400).send({ status: false, message: "invoiceNumber is invalid" })
            let checkInvoice = await grnModel.findOne({ invoiceNumber })
            if (checkInvoice) return res.status(409).send({ status: false, message: "invoiceNumber is already present" })
            updateData.invoiceNumber = invoiceNumber
        }

        if (vendorFullAddress) {
            if (typeof vendorFullAddress === "string") { vendorFullAddress = JSON.parse(vendorFullAddress) }
            if (!validator.isValidRequestBody(vendorFullAddress)) return res.status(400).send({ status: false, message: "vendorFullAddress is required" })

            if (vendorFullAddress.street) {
                if (!validator.isValid(vendorFullAddress.street)) {
                    return res.status(400).send({ status: false, message: "street is required in vendorFullAddress!" });
                }
                updateData['vendorFullAddress.street'] = vendorFullAddress.street;
            }

            if (vendorFullAddress.city) {
                if (!validator.isValid(vendorFullAddress.city)) return res.status(400).send({ status: false, message: "city is required in vendorFullAddress!" });
                updateData['vendorFullAddress.city'] = vendorFullAddress.city;
            }

            if (vendorFullAddress.pincode) {
                let pinCode = parseInt(vendorFullAddress.pincode)
                if (!(/^[1-9][0-9]{5}$/.test(pinCode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                updateData['vendorFullAddress.pincode'] = pinCode;
            }
        }

        let updatedGrn = await grnModel.findByIdAndUpdate(grnId, updateData, { new: true }).populate("grnLineItems")
        return res.status(200).send({ status: false, message: updatedGrn })

    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}


const deleteGrn = async function (req, res) {
    try {
        let grnId = req.params.grnId
        if (!validator.isValid(grnId)) return res.status(400).send({ status: false, message: "provide grnId" })
        if (!validator.isValidObjectId(grnId)) return res.status(400).send({ status: false, message: "invalid grnId" })
        let checkId = await grnModel.findById(grnId)
        if (!checkId) return res.status(404).send({ status: false, message: "no such grn" })
        if (checkId.deleted == true) return res.status(404).send({ status: false, message: "grn is already deleted" })

        let deletedDoc = await grnModel.findOneAndUpdate({ _id: grnId }, { deleted: true }, { new: true })
        console.log(deletedDoc)
        return res.status(200).send({ status: true, message: "grn deleted successfully" })
    } catch (err) {
        console.log(err)
        return res.status(500).send({ status: false, message: err.message })
    }
}

module.exports = { createGrn, getGrn, updateGrn, deleteGrn }