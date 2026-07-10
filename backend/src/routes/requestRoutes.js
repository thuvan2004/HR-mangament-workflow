const express = require('express');
const {
  createRequest,
  getRequests,
  getRequestById,
  approveRejectRequest,
  addComment,
} = require('../controllers/requestController');
const { protect } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('receipt'), createRequest);
router.get('/', protect, getRequests);
router.get('/:id', protect, getRequestById);
router.put('/:id/action', protect, approveRejectRequest);
router.post('/:id/comments', protect, addComment);

module.exports = router;
