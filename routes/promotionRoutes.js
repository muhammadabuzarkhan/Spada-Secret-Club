const express = require("express");
const router = express.Router();
const promoCodeController = require("../controllers/promotionCodeController");

// Define routes
router.post("/promo", promoCodeController.createPromoCode);
router.get("/promo/:email", promoCodeController.getPromoCodeByEmail);
router.get("/promos", promoCodeController.getAllPromoCodes);
router.put("/promo/:code", promoCodeController.incrementUsage);

module.exports = router;
