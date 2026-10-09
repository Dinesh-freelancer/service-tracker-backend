const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { authenticateToken, authorize } = require('../middleware/authMiddleware');
const { AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER, AUTH_ROLE_CUSTOMER } = require('../utils/constants');

router.use(authenticateToken);

router.get('/job/:jobNumber', quoteController.getQuotesByJob);
router.get('/job/:jobNumber/latest', quoteController.getLatestQuoteForJob);
router.get('/:id', quoteController.getQuoteById);
router.post('/', authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER), quoteController.createQuote);
router.patch('/:id/status', authorize(AUTH_ROLE_ADMIN, AUTH_ROLE_OWNER, AUTH_ROLE_CUSTOMER), quoteController.updateQuoteStatus);

module.exports = router;
