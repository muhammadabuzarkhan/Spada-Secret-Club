const express = require("express");
const router = express.Router();
const promoCodeController = require("../controllers/promotionCodeController");

// Define routes
router.post("/generate", promoCodeController.createPromoCode);
router.get("/promo", promoCodeController.getPromoCodeByEmail);
router.get("/promos", promoCodeController.getAllPromoCodes);
router.put("/promo/:code", promoCodeController.incrementUsage);
router.get("/promo/:code", promoCodeController.getPromoUsageCount)

module.exports = router;
