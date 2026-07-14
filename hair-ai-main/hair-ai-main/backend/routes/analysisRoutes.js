import express from 'express';
import {
  uploadPhotos,
  analyzePhotos,
  getHistory,
  getAnalysisById,
  exportReportPDF,
  emailReportPDF
} from '../controllers/analysisController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.use(protect); // Ensure JWT required for all routes

router.post(
  '/upload',
  upload.fields([
    { name: 'front', maxCount: 1 },
    { name: 'top', maxCount: 1 },
    { name: 'crown', maxCount: 1 }
  ]),
  uploadPhotos
);

router.post('/analyze', analyzePhotos);
router.get('/history', getHistory);
router.get('/:id', getAnalysisById);
router.get('/export-pdf/:id', exportReportPDF);
router.post('/email-report/:id', emailReportPDF);

export default router;
