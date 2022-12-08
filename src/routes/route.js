const express = require("express")
const router = express.Router()
const grnController = require("../controllers/grnController")
const grnLineItemController = require("../controllers/grnLineItemController")
const orderController = require("../controllers/orderController") 
const itemController = require("../controllers/itemController")
const orderLineItemController = require("../controllers/orderLineItemController")

router.post("/grn",grnController)
router.get("/grn",grnController)
router.put("/grn",grnController)
router.delete("/grn",grnController)
router.post("/grn",grnLineItemController)
router.post("/order",orderController)
router.get("/order",orderController )
router.put("/grn",orderController)
router.delete("/order",orderController)
router.post("/order",orderLineItemController)
router.post("/item", itemController)




