const Contact = require("../models/B2b");
const mailchimp = require("@mailchimp/mailchimp_transactional");
const { validationResult } = require("express-validator");
require("dotenv").config();

// Create a new contact entry and send email notification
exports.createContact = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
        const { name, phone, subject, message } = req.body;
        const newContact = new Contact({ name,  phone, subject, message });
        const savedContact = await newContact.save();

        // Send email notification
        await sendEmailNotification({ name, phone, subject, message });

        res.status(201).json({ message: "Inquiry submitted successfully", savedContact });
    } catch (error) {
        res.status(500).json({ message: "Error saving contact", error });
    }
};

// Get a single contact by ID
exports.getContactById = async (req, res) => {
    try {
        const contact = await Contact.findById(req.params.id);
        if (!contact) {
            return res.status(404).json({ message: "Contact not found" });
        }
        res.json(contact);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contact", error });
    }
};

// Get all contacts
exports.getAllContacts = async (req, res) => {
    try {
        const contacts = await Contact.find();
        res.json(contacts);
    } catch (error) {
        res.status(500).json({ message: "Error fetching contacts", error });
    }
};

// Send email notification function
async function sendEmailNotification(userDetails) {
    const { name, phone, subject, message } = userDetails;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: process.env.ADMIN_EMAIL, type: "to" }],
                subject: "New B2B Inquiry Submitted on SpadaDrinks",
                html: `
                    <p>Dear Spada Marketing Team,</p>
                    <p>A new B2B inquiry has been submitted on SpadaDrinks. Here are the details:</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Phone:</strong> ${phone}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong> ${message}</p>
                    <p>Please review and respond accordingly.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>SpadaDrinks Team</p>
                `,
            },
        });
        console.log("Email notification sent successfully.");
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
