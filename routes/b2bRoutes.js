const express = require("express");
const router = express.Router();
const contactController = require("../controllers/b2bController");

// Define routes
router.post("/", contactController.createContact);
router.get("/:id", contactController.getContactById);
router.get("/", contactController.getAllContacts);

module.exports = router;
