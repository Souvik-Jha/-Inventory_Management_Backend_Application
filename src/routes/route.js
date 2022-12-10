const express = require("express")
const router = express.Router()
const grnController = require("../controllers/grnController")
const grnLineItemController = require("../controllers/grnLineItemController")
const orderController = require("../controllers/orderController")
const itemController = require("../controllers/itemController")
const orderLineItemController = require("../controllers/orderLineItemController")

router.post("/grn", grnController.createGrn)
router.get("/grn", grnController.getGrn)
router.put("/grn/:grnId", grnController.updateGrn)
router.delete("/grn/:grnId", grnController.deleteGrn)

router.post("/grn/update-status", grnLineItemController.grnUpdate)

router.post("/order", orderController.createOrder)
router.get("/order", orderController.getOrder)
router.put("/order/:orderId", orderController.updateOrder)
router.delete("/order/:orderId", orderController.deleteOrder)

router.post("/order/update-status", orderLineItemController.orderUpdate)

router.get("/item", itemController.getItems)

module.exports = router;



