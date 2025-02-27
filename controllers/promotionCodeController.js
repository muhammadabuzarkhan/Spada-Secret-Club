require("dotenv").config();
const PromoCode = require("../models/PromotionCode");
const mailchimp = require("@mailchimp/mailchimp_transactional");
const { validationResult } = require("express-validator");

// Create a promo code manually and send email to user
exports.createPromoCode = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ message: "Email and promo code are required" });
        }

        // Check if the email already has a promo code
        const existingPromo = await PromoCode.findOne({ email });
        if (existingPromo) {
            return res.status(400).json({ message: "This email already has a promo code", promoCode: existingPromo.code });
        }

        // Create new promo code
        const newPromoCode = new PromoCode({ email, code });
        const savedPromo = await newPromoCode.save();

        // Send email notification to user
        await sendPromoCodeEmail({ email, code });

        res.status(201).json({ message: "Promo code created and sent to user", savedPromo });
    } catch (error) {
        res.status(500).json({ message: "Error generating promo code", error });
    }
};

// Get a promo code by email
exports.getPromoCodeByEmail = async (req, res) => {
    try {
        const { email } = req.body; // Get email from request body

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        const promo = await PromoCode.findOne({ email });

        if (!promo) {
            return res.status(404).json({ message: "No promo code found for this email" });
        }

        res.json(promo);
    } catch (error) {
        res.status(500).json({ message: "Error fetching promo code", error });
    }
};


// Get all promo codes
exports.getAllPromoCodes = async (req, res) => {
    try {
        const promoCodes = await PromoCode.find();
        res.json(promoCodes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching promo codes", error });
    }
};

exports.incrementUsage = async (req, res) => {
    try {
        const { code } = req.params;
        const { incrementBy } = req.body;

        if (!incrementBy || incrementBy < 1) {
            return res.status(400).json({ message: "Invalid increment value" });
        }


        // Check if the promo code exists before updating
        const existingPromo = await PromoCode.findOne({ code: { $regex: new RegExp(`^${code}$`, "i") } });

        if (!existingPromo) {
            return res.status(404).json({ message: "Promo code not found in DB" });
        }

        // Update the promo code usage count
        const updatedPromo = await PromoCode.findOneAndUpdate(
            { code: { $regex: new RegExp(`^${code}$`, "i") } },
            { $inc: { usageCount: incrementBy } },
            { new: true }
        );

        if (!updatedPromo) {
            return res.status(500).json({ message: "Error updating promo code usage" });
        }


        // Check if the usage count has reached certain thresholds
        const thresholds = [100, 500, 1000, 1500, 2000, 3000, 5000, 10000];
        if (thresholds.includes(updatedPromo.usageCount)) {
            await sendUsageNotificationToUser(updatedPromo);
            await sendUsageNotificationToAdmin(updatedPromo);
        }

        res.json({ message: "Promo code usage updated", promo: updatedPromo });
    } catch (error) {
        console.error("Error in incrementUsage:", error);
        res.status(500).json({ message: "Error updating promo code", error });
    }
};


// Send email to user when a certain threshold is reached
async function sendUsageNotificationToUser(promo) {
    const { email, usageCount } = promo;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: email, type: "to" }],
                subject: `Congratulations! Your Promo Code has been used ${usageCount} times!`,
                html: `
                    <p>Dear Valued Member,</p>
                    <p>We're excited to inform you that your promo code has been successfully used <strong>${usageCount}</strong> times! 🎉</p>
                    <p>Thank you for being part of our community. We appreciate your continued support.</p>
                    <p>If you have any questions or need further assistance, feel free to reach out to us.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${process.env.COMPANY_NAME}</p>
                    <p>Contact: ${process.env.ADMIN_EMAIL}</p>
                `,
            },
        });
        console.log(`User notification email sent for ${usageCount} uses.`);
    } catch (error) {
        console.error("Error sending user email:", error);
    }
}

// Send email to admin when a certain threshold is reached
async function sendUsageNotificationToAdmin(promo) {
    const { email, usageCount, code } = promo;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: process.env.ADMIN_EMAIL, type: "to" }],
                subject: `Promo Code ${code} Used ${usageCount} Times`,
                html: `
                    <p>Dear Admin,</p>
                    <p>The promo code <strong>${code}</strong> has been used <strong>${usageCount}</strong> times.</p>
                    <p><strong>Promo Code:</strong> ${code}</p>
                    <p><strong>Used By User:</strong> ${email}</p>
                    <p>Please keep track of this and take any necessary actions.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${process.env.COMPANY_NAME}</p>
                    <p>Contact: ${process.env.ADMIN_EMAIL}</p>
                `,
            },
        });
        console.log(`Admin notification email sent for ${usageCount} uses.`);
    } catch (error) {
        console.error("Error sending admin email:", error);
    }
}

exports.getPromoUsageCount = async (req, res) => {
    try {
        const { code } = req.params;

        const promo = await PromoCode.findOne({ code });

        if (!promo) {
            return res.status(404).json({ message: "Promo code not found" });
        }

        res.json({ code: promo.code, usageCount: promo.usageCount });
    } catch (error) {
        res.status(500).json({ message: "Error fetching promo code usage count", error });
    }
};

// Send Email to User with Promo Code
async function sendPromoCodeEmail(userDetails) {
    const { email, code } = userDetails;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: email, type: "to" }],
                subject: "Your Exclusive Promo Code!",
                html: `
                    <p>Dear Valued Member,</p>
                    <p>Congratulations! You have received an exclusive promo code.</p>
                    <p><strong>Your Promo Code:</strong> <span style="font-size: 18px; font-weight: bold; color: #FF5733;">${code}</span></p>
                    <p>Use this code at checkout to enjoy special discounts and benefits.</p>
                    <p>If you have any questions, feel free to reach out to us.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${process.env.COMPANY_NAME}</p>
                    <p>Contact: ${process.env.ADMIN_EMAIL}</p>
                `,
            },
        });
        console.log("Promo code email sent to user.");
    } catch (error) {
        console.error("Error sending promo code email:", error);
    }
}
