const Report = require("../models/Report");
const mailchimp = require("@mailchimp/mailchimp_transactional");
const { validationResult } = require("express-validator");
require("dotenv").config();

// Create a new report entry and send email notifications
exports.createReport = async (req, res) => {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Validation failed", errors: errors.array() });
    }

    try {
        const { name, number, subject, message, email } = req.body;
        const newReport = new Report({ fullame, number, subject, message, email });
        const savedReport = await newReport.save();

        // Send email notifications
        await sendAdminNotification({ fullname, number, subject, message, email });
        await sendUserConfirmation({ fullname, email });

        res.status(201).json({ message: "Report submitted successfully", savedReport });
    } catch (error) {
        res.status(500).json({ message: "Error saving report", error });
    }
};

// Get a single report by ID
exports.getReportById = async (req, res) => {
    try {
        const report = await Report.findById(req.params.id);
        if (!report) {
            return res.status(404).json({ message: "Report not found" });
        }
        res.json(report);
    } catch (error) {
        res.status(500).json({ message: "Error fetching report", error });
    }
};

// Get all reports
exports.getAllReports = async (req, res) => {
    try {
        const reports = await Report.find();
        res.json(reports);
    } catch (error) {
        res.status(500).json({ message: "Error fetching reports", error });
    }
};

// Send Email to Admin
async function sendAdminNotification(reportDetails) {
    const { name, number, subject, message, email } = reportDetails;
    const mailchimpClient = mailchimp(process.env.MAILCHIMP_API_KEY);

    try {
        await mailchimpClient.messages.send({
            message: {
                from_email: process.env.SENDER_EMAIL,
                to: [{ email: process.env.ADMIN_EMAIL, type: "to" }],
                subject: "New Report Submission on SpadaDrinks",
                html: `
                    <p>Dear Spada Marketing Team,</p>
                    <p>A new report has been submitted on SpadaDrinks. Here are the details:</p>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Phone Number:</strong> ${number}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong> ${message}</p>
                    <p>Please review the report and take necessary action.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>SpadaDrinks Team</p>
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
                subject: "Report Received – SpadaDrinks",
                html: `
                    <p>Dear ${name},</p>
                    <p>Thank you for submitting your report. We have received your request and will review it as soon as possible.</p>
                    <p>If any further details are needed, our team will reach out to you.</p>
                    <p>If you have any urgent concerns, feel free to contact us at <a href="mailto:${process.env.ADMIN_EMAIL}">${process.env.ADMIN_EMAIL}</a>.</p>
                    <br/>
                    <p>Best regards,</p>
                    <p>SpadaDrinks Team</p>
                `,
            },
        });
        console.log("User confirmation email sent.");
    } catch (error) {
        console.error("Error sending user email:", error);
    }
}
