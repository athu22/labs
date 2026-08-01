const express = require('express');
const router = express.Router();
const accountingController = require('../controllers/accountingController');

// Account Groups
router.get('/groups', accountingController.getAccountGroups);
router.post('/groups', accountingController.createAccountGroup);

// Accounts
router.get('/accounts', accountingController.getAccounts);
router.post('/accounts', accountingController.createAccount);

// Transactions
router.get('/transactions', accountingController.getTransactions);
router.post('/transactions', accountingController.createTransaction);

// Reports
router.get('/reports/ledger/:accountId', accountingController.getLedger);
router.get('/reports/trial-balance', accountingController.getTrialBalance);

// Test
router.get('/status', accountingController.checkStatus);

module.exports = router;
