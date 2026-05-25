const Material = require('../models/Material');
const { uploadFile, deleteFile } = require('../config/cloudinary');
const fs = require('fs');

// Helper to safely unlink temporary files
const cleanTempFile = (filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Failed to delete temp file: ${filePath}`, err);
    }
  }
};

// @desc    Get all materials (filtered & searched)
// @route   GET /api/materials
// @access  Private (Registered Users)
exports.getMaterials = async (req, res) => {
  try {
    const { search, category, accessType, type } = req.query;

    const query = {};

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    if (category) {
      query.category = category;
    }

    if (accessType) {
      query.accessType = accessType;
    }

    if (type) {
      query.type = type;
    }

    const materials = await Material.find(query).sort({ createdAt: -1 });

    // Premium masking logic
    const user = req.user;
    const sanitizedMaterials = materials.map((item) => {
      const isPremiumMaterial = item.accessType === 'premium';
      const hasAccess = user.premium || user.role === 'admin';

      if (isPremiumMaterial && !hasAccess) {
        // Return a copy with fileUrl masked/locked for security
        const materialObj = item.toObject();
        materialObj.fileUrl = '#locked';
        return materialObj;
      }
      return item;
    });

    res.status(200).json({ success: true, count: sanitizedMaterials.length, data: sanitizedMaterials });
  } catch (error) {
    console.error('Fetch Materials Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get material by ID
// @route   GET /api/materials/:id
// @access  Private (Registered Users)
exports.getMaterialById = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const user = req.user;
    const isPremiumMaterial = material.accessType === 'premium';
    const hasAccess = user.premium || user.role === 'admin';

    if (isPremiumMaterial && !hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Premium subscription required to view this material.',
        isLocked: true,
      });
    }

    res.status(200).json({ success: true, data: material });
  } catch (error) {
    console.error('Fetch Single Material Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Increment download/view count
// @route   POST /api/materials/:id/download
// @access  Private (Registered Users)
exports.incrementDownload = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const user = req.user;
    const isPremiumMaterial = material.accessType === 'premium';
    const hasAccess = user.premium || user.role === 'admin';

    if (isPremiumMaterial && !hasAccess) {
      return res.status(403).json({ success: false, message: 'Premium subscription required to download.' });
    }

    material.downloadCount += 1;
    await material.save();

    res.status(200).json({ success: true, downloadCount: material.downloadCount });
  } catch (error) {
    console.error('Download Trigger Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new study material
// @route   POST /api/materials
// @access  Private (Admin Only)
exports.createMaterial = async (req, res) => {
  let fileTempPath = null;
  let thumbTempPath = null;

  try {
    const { title, description, category, type, accessType } = req.body;

    if (!title || !description || !category || !type) {
      return res.status(400).json({ success: false, message: 'Please provide all text fields' });
    }

    // Verify file is uploaded
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'Please upload a material file (PDF/Video/ZIP)' });
    }

    const file = req.files.file[0];
    fileTempPath = file.path;

    const thumbnail = req.files.thumbnail ? req.files.thumbnail[0] : null;
    if (thumbnail) {
      thumbTempPath = thumbnail.path;
    }

    // 1. Upload Material File
    let materialResourceType = 'raw';
    if (type === 'video') {
      materialResourceType = 'video';
    } else if (type === 'pdf') {
      materialResourceType = 'image';
    }

    console.log(`Uploading file ${file.originalname} as ${materialResourceType}...`);
    const fileUpload = await uploadFile(fileTempPath, 'study_materials', materialResourceType);

    // 2. Upload Thumbnail if exists
    let thumbnailUrl = '';
    let thumbnailPublicId = '';

    if (thumbTempPath) {
      console.log(`Uploading thumbnail ${thumbnail.originalname}...`);
      const thumbUpload = await uploadFile(thumbTempPath, 'thumbnails', 'image');
      thumbnailUrl = thumbUpload.secure_url;
      thumbnailPublicId = thumbUpload.public_id;
    } else {
      // Fallback thumbnail markers depending on categories/types for aesthetic reasons
      thumbnailUrl = `/assets/placeholders/${type}.png`;
    }

    // 3. Save to database
    const newMaterial = await Material.create({
      title,
      description,
      category,
      type,
      fileUrl: fileUpload.secure_url,
      filePublicId: fileUpload.public_id,
      thumbnailUrl,
      thumbnailPublicId,
      accessType: accessType || 'free',
    });

    // Clean temp storage synchronously
    cleanTempFile(fileTempPath);
    cleanTempFile(thumbTempPath);

    res.status(201).json({ success: true, message: 'Material created successfully', data: newMaterial });
  } catch (error) {
    console.error('Material Creation Error:', error);
    // Cleanup files in case of failures
    cleanTempFile(fileTempPath);
    cleanTempFile(thumbTempPath);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update material details
// @route   PUT /api/materials/:id
// @access  Private (Admin Only)
exports.updateMaterial = async (req, res) => {
  let thumbTempPath = null;
  try {
    const { title, description, category, accessType } = req.body;
    let material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // Prepare updates
    const updates = {};
    if (title) updates.title = title;
    if (description) updates.description = description;
    if (category) updates.category = category;
    if (accessType) updates.accessType = accessType;

    // Check if a new thumbnail is supplied
    if (req.files && req.files.thumbnail) {
      const thumbnail = req.files.thumbnail[0];
      thumbTempPath = thumbnail.path;

      // Delete old Cloudinary thumbnail if active
      if (material.thumbnailPublicId && !material.thumbnailPublicId.startsWith('mock_')) {
        await deleteFile(material.thumbnailPublicId, 'image');
      }

      console.log(`Re-uploading thumbnail...`);
      const thumbUpload = await uploadFile(thumbTempPath, 'thumbnails', 'image');
      updates.thumbnailUrl = thumbUpload.secure_url;
      updates.thumbnailPublicId = thumbUpload.public_id;
    }

    material = await Material.findByIdAndUpdate(req.params.id, updates, { new: true });
    
    cleanTempFile(thumbTempPath);

    res.status(200).json({ success: true, message: 'Material updated successfully', data: material });
  } catch (error) {
    console.error('Material Update Error:', error);
    cleanTempFile(thumbTempPath);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private (Admin Only)
exports.deleteMaterial = async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    // 1. Delete associated file from storage
    if (material.filePublicId) {
      const fileType = material.type === 'video' ? 'video' : (material.type === 'pdf' ? 'image' : 'raw');
      await deleteFile(material.filePublicId, fileType);
    }

    // 2. Delete thumbnail if active
    if (material.thumbnailPublicId && !material.thumbnailPublicId.startsWith('mock_')) {
      await deleteFile(material.thumbnailPublicId, 'image');
    }

    // 3. Remove DB entry
    await Material.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'Material deleted successfully' });
  } catch (error) {
    console.error('Material Deletion Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Securely view/stream PDF material as inline stream (bypasses CORS & Content-Disposition: attachment)
// @route   GET /api/materials/:id/view
// @access  Private (Registered & Authorized Users)
exports.viewMaterialPdf = async (req, res) => {
  try {
    const https = require('https');
    const http = require('http');
    const path = require('path');

    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ success: false, message: 'Material not found' });
    }

    const user = req.user;
    const isPremiumMaterial = material.accessType === 'premium';
    const hasAccess = user.premium || user.role === 'admin';

    if (isPremiumMaterial && !hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Premium subscription required to view this material.',
        isLocked: true,
      });
    }

    let pdfUrl = material.fileUrl;
    if (!pdfUrl || pdfUrl === '#locked') {
      return res.status(400).json({ success: false, message: 'Invalid or locked file URL' });
    }

    // Dynamic sanitation to support pre-repaired and cached broken URLs
    if (pdfUrl.includes('fl_attachment:false')) {
      pdfUrl = pdfUrl.replace(/fl_attachment:false\/?/, '');
    }

    // Local file streaming handler
    if (pdfUrl.startsWith('/uploads')) {
      const filePath = path.resolve(__dirname, '../../public', pdfUrl.substring(1));
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ success: false, message: 'Local PDF file not found' });
      }
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.sendFile(filePath);
    }

    // External Cloudinary file streaming proxy handler
    if (pdfUrl.startsWith('http')) {
      const client = pdfUrl.startsWith('https') ? https : http;
      
      client.get(pdfUrl, (externalRes) => {
        if (externalRes.statusCode !== 200) {
          console.error(`[PDF Proxy] External storage responded with status: ${externalRes.statusCode}`);
          return res.status(externalRes.statusCode).json({
            success: false,
            message: `External storage returned status ${externalRes.statusCode}`
          });
        }

        // Set response headers to force inline rendering and allow broad frame embedding
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Access-Control-Allow-Origin', '*');
        
        externalRes.pipe(res);
      }).on('error', (err) => {
        console.error('[PDF Proxy Error] Dynamic streaming failed:', err);
        res.status(500).json({ success: false, message: 'Failed to stream PDF from storage' });
      });
    } else {
      res.status(400).json({ success: false, message: 'Unsupported file storage scheme' });
    }
  } catch (error) {
    console.error('[PDF Proxy Boundary Error]:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
