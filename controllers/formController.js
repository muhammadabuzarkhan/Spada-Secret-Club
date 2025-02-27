const Form = require('../models/Form');
const mailchimp = require("@mailchimp/mailchimp_transactional");
const { validationResult } = require("express-validator");
require("dotenv").config();

exports.createForm = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
        const { name, email, phone } = req.body;

        // Check if the email already exists in the database
        const existingForm = await Form.findOne({ email });
        if (existingForm) {
            return res.status(400).json({ message: "You are already a Secret Club member." });
        }

        // Create new membership
        const newForm = new Form({ name, email, phone });
        const savedForm = await newForm.save();

        // Send email notifications
        await sendAdminNotification({ name, email, phone });
        await sendUserConfirmation({ name, email });

        res.status(201).json({ message: "Membership successfully created", savedForm });
    } catch (error) {
        res.status(500).json({ message: "Error saving form", error });
    }
};


// Get a single form by ID
exports.getFormById = async (req, res) => {
    try {
        const form = await Form.findById(req.params.id);
        if (!form) {
            return res.status(404).json({ message: "Form not found" });
        }
        res.json(form);
    } catch (error) {
        res.status(500).json({ message: "Error fetching form", error });
    }
};

// Get all forms
exports.getAllForms = async (req, res) => {
    try {
        const forms = await Form.find();
        res.json(forms);
    } catch (error) {
        res.status(500).json({ message: "Error fetching forms", error });
    }
};

// Send Email to Admin
async function sendAdminNotification(userDetails) {
    const { name, email, phone } = userDetails;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email:process.env.SENDER_EMAIL,
                to: [{ email: process.env.ADMIN_EMAIL, type: "to" }],
                subject: `New Secret Club Membership - ${name}`,
                html: `
                    <p>Dear Admin,</p>
                    <p>A new user has successfully become a <strong>Secret Club Member</strong>.</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Phone Number:</strong> ${phone}</p>
                    <p>Please update the system as required, and feel free to reach out if you need further information.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${process.env.COMPANY_NAME}</p>
                    <p>Contact: ${process.env.ADMIN_EMAIL}</p>
                `,
            },
        });
        console.log("Admin notification email sent.");
    } catch (error) {
        console.error("Error sending admin email:", error);
    }
}

// Send Confirmation Email to User
async function sendUserConfirmation(userDetails) {
    const { name, email } = userDetails;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: email, type: "to" }],
                subject: "Welcome to the Secret Club!",
                html: `
                    <p>Dear ${name},</p>
                    <p>Congratulations! You are now officially a <strong>Secret Club Member</strong>. 🎉</p>
                    <p>As a valued member, you can now create exclusive <strong>Promotion Codes</strong> and enjoy special benefits from our Store.</p>
                    <p>We look forward to providing you with the best experiences and rewards.</p>
                    <p>If you have any questions or need assistance, don't hesitate to contact us.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>${process.env.COMPANY_NAME}</p>
                    <p>Contact: ${process.env.ADMIN_EMAIL}</p>
                `,
            },
        });
        console.log("User confirmation email sent.");
    } catch (error) {
        console.error("Error sending user email:", error);
    }
}
