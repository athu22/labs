const express = require('express');
const router = express.Router();
const { approveRegistration, getPendingRegistrations } = require('../controllers/registrationController');

router.get('/pending', getPendingRegistrations);
router.put('/approve/:id', approveRegistration);

module.exports = router;
