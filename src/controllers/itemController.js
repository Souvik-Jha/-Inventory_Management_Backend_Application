const itemModel = require("../models/itemModel")
const validator = require("../validators/validator")

const getItems = async function(req,res){
    try{
        let query = req.query
        const {productId,productName} = query

        if (productId) {
            if (!validator.isValidObjectId(productId)) return res.status(400).send({ status: false, message: 'Please provide valid productId' })
            query._id = productId
        }

        if (productName) {
            if (!validator.isValid(productName)) return res.status(400).send({ status: false, message: "productName must be in string & not empty" })
        }
        let Items = await itemModel.find({$and:[query,{deleted:false}]})
        return res.status(200).send({ststus: true,message:Items})

    }catch(err){
        console.log(err)
        return res.status(500).send({status:false,message:err.message})
    }
}

module.exports ={getItems}