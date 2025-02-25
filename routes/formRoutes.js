const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// Define routes
router.post('/form', formController.createForm);
router.get('/form/:id', formController.getFormById);
router.get('/forms', formController.getAllForms);

module.exports = router;
