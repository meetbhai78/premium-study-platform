const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const isMock = !process.env.CLOUDINARY_CLOUD_NAME || 
               process.env.CLOUDINARY_CLOUD_NAME === 'mock_cloudinary' ||
               process.env.CLOUDINARY_CLOUD_NAME === 'your_cloudinary_cloud_name';

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary storage engine initialized in production mode.');
} else {
  console.log('Cloudinary storage engine initialized in LOCAL MOCK mode.');
}

// Ensure local uploads directory exists for mock mode
const uploadsDir = path.resolve(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Get dynamic Cloudinary configuration based on category.
 * If specific credentials are not set in environment, falls back to the main CLOUDINARY_* credentials.
 */
const getCloudinaryConfig = (category) => {
  const cat = String(category || '').toLowerCase();
  let config = {};

  if (cat.includes('std 9')) {
    config = {
      cloud_name: process.env.CLOUDINARY_9_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_9_API_KEY,
      api_secret: process.env.CLOUDINARY_9_API_SECRET
    };
  } else if (cat.includes('std 10')) {
    config = {
      cloud_name: process.env.CLOUDINARY_10_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_10_API_KEY,
      api_secret: process.env.CLOUDINARY_10_API_SECRET
    };
  } else if (cat.includes('std 6') || cat.includes('std 7') || cat.includes('std 8') || cat.includes('std 6 to 8')) {
    config = {
      cloud_name: process.env.CLOUDINARY_68_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_68_API_KEY,
      api_secret: process.env.CLOUDINARY_68_API_SECRET
    };
  } else {
    config = {
      cloud_name: process.env.CLOUDINARY_GEN_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_GEN_API_KEY,
      api_secret: process.env.CLOUDINARY_GEN_API_SECRET
    };
  }

  // Fallback to default credentials if specific ones are empty
  if (!config.cloud_name) {
    return {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET
    };
  }

  return config;
};

/**
 * Upload a file to Cloudinary, or copy it to the local public uploads folder if in mock mode.
 * @param {string} filePath - Absolute path to the local file
 * @param {string} folder - Destination folder name
 * @param {string} resourceType - 'auto', 'image', 'video', 'raw'
 * @param {string} category - Category name to route storage dynamically
 * @returns {Promise<{secure_url: string, public_id: string}>}
 */
const uploadFile = async (filePath, folder = 'study_materials', resourceType = 'auto', category = '') => {
  if (isMock) {
    const fileName = `${Date.now()}-${path.basename(filePath)}`;
    const destinationPath = path.join(uploadsDir, fileName);
    
    // Copy file to local static directory
    fs.copyFileSync(filePath, destinationPath);
    
    // Return mock object mimicking Cloudinary structure
    return {
      secure_url: `/uploads/${fileName}`,
      public_id: `mock_${Date.now()}_${path.basename(fileName).replace(/[^a-zA-Z0-9]/g, '')}`,
    };
  }

  try {
    const overrideConfig = getCloudinaryConfig(category);
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: resourceType,
      ...overrideConfig,
    });
    return {
      secure_url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (error) {
    console.error('Cloudinary Upload Error:', error);
    throw error;
  }
};

/**
 * Delete a file from Cloudinary, or simulate deletion if in mock mode.
 * @param {string} publicId - Cloudinary public id or local mock id
 * @param {string} resourceType - 'image', 'video', 'raw'
 * @param {string} category - Category name to route deletion request to correct account
 */
const deleteFile = async (publicId, resourceType = 'raw', category = '') => {
  if (isMock || (publicId && publicId.startsWith('mock_'))) {
    console.log(`[Mock Cloudinary] Simulating deletion of resource ID: ${publicId}`);
    return { result: 'ok' };
  }
  
  try {
    const overrideConfig = getCloudinaryConfig(category);
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
      ...overrideConfig,
    });
    return result;
  } catch (error) {
    console.error('Cloudinary Deletion Error:', error);
    throw error;
  }
};

module.exports = {
  cloudinary,
  uploadFile,
  deleteFile,
  isMock,
};
