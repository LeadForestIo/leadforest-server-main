// All Requires
const {
  getPrices,
  createSession,
  webhook
} = require('../controllers/stripeController');
const router = require('express').Router();
const {
  verifyCustomTokenMiddleware,
} = require('../middleware/verifyCustomToken');
const express = require("express");

// ROUTE
router.get('/getPrices', verifyCustomTokenMiddleware, getPrices);
router.post('/createSession', verifyCustomTokenMiddleware, createSession);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);


// Exports
module.exports = router;
