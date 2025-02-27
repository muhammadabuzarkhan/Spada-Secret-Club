const express = require('express');
const router = express.Router();
const formController = require('../controllers/formController');

// Define routes
router.post('/subscribe', formController.createForm);
router.get('/form/:id', formController.getFormById);
router.get('/', formController.getAllForms);

module.exports = router;
