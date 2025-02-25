const mongoose = require("mongoose");

const PromoCodeSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    usageCount: { type: Number, default: 0 }, // Track how many times used
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PromoCode", PromoCodeSchema);
