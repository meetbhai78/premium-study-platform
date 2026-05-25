const express = require('express');
const router = express.Router();
const {
  getMaterials,
  getMaterialById,
  incrementDownload,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  viewMaterialPdf,
} = require('../controllers/materialController');
const { protect, admin } = require('../middleware/auth');
const upload = require('../middleware/upload');

// User standard routes
router.get('/', protect, getMaterials);
router.get('/:id', protect, getMaterialById);
router.get('/:id/view', protect, viewMaterialPdf);
router.post('/:id/download', protect, incrementDownload);

// Admin-guarded resource uploads
router.post(
  '/',
  protect,
  admin,
  upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 },
  ]),
  createMaterial
);

// Admin-guarded updates & edits
router.put(
  '/:id',
  protect,
  admin,
  upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
  updateMaterial
);

router.delete('/:id', protect, admin, deleteMaterial);

module.exports = router;
