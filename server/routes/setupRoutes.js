const express = require('express');
const router = express.Router();
const { createSuperAdmin } = require('../controllers/setupController');

router.post('/initialize-master', createSuperAdmin);

module.exports = router;
