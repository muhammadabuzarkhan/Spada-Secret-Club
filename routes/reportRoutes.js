const express = require("express");
const router = express.Router();
const reportController = require("../controllers/reportController");

// Define routes
router.post("/report", reportController.createReport);
router.get("/report/:id", reportController.getReportById);
router.get("/reports", reportController.getAllReports);


module.exports = router;
