const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const requireRole = require('../middleware/roleMiddleware');
const FlavorController = require('../controllers/FlavorController');
const ReviewController = require('../controllers/ReviewController');

const router = express.Router();

router.use(authMiddleware);

router.post('/', requireRole('customer'), FlavorController.create);
router.get('/', requireRole('customer'), FlavorController.listMine);
router.get('/submitted', requireRole('flavorist'), ReviewController.getSubmitted);
router.get('/:id', FlavorController.getById);
router.put('/:id', requireRole('customer'), FlavorController.edit);
router.post('/:id/submit', requireRole('customer'), FlavorController.submit);
router.post('/:id/approve', requireRole('flavorist'), ReviewController.approve);
router.post('/:id/reject', requireRole('flavorist'), ReviewController.reject);
router.get('/:id/comments', ReviewController.getComments);
router.post('/:id/comments', requireRole('flavorist'), ReviewController.addComment);

module.exports = router;
