// All Requires
const router = require('express').Router();
const { sendEmail } = require('../controllers/emailController');

const { isAuthenticated } = require('../middleware/firebase/firebaseAdmin');
const {
  verifyCustomTokenMiddleware,
} = require('../middleware/verifyCustomToken');

// Routes
router.post('/api/sendEmail', sendEmail);

// Export
module.exports = router;
