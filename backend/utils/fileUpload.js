/**
 * File Upload Utility
 * Handles cloud file uploads (Cloudinary, AWS S3, etc.)
 */

const cloudinary = require('cloudinary').v2;
const fs = require('fs').promises;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Local file path
 * @param {string} folder - Cloudinary folder name
 * @returns {object} Upload result with URL
 */
const uploadToCloudinary = async (filePath, folder = 'sehatconnect') => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      folder,
      resource_type: 'auto',
    });

    // Delete local file after upload
    await fs.unlink(filePath);

    return {
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
    };
  } catch (error) {
    console.error('Cloudinary upload failed:', error);
    throw new Error('Failed to upload file');
  }
};

/**
 * Upload multiple files to Cloudinary
 * @param {array} files - Array of file paths
 * @param {string} folder - Cloudinary folder name
 * @returns {array} Array of upload results
 */
const uploadMultipleToCloudinary = async (files, folder = 'sehatconnect') => {
  try {
    const uploadPromises = files.map((file) => uploadToCloudinary(file.path, folder));
    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Multiple upload failed:', error);
    throw new Error('Failed to upload files');
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Cloudinary delete failed:', error);
    throw new Error('Failed to delete file');
  }
};

/**
 * Upload buffer to Cloudinary (for memory storage)
 * @param {Buffer} buffer - File buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} filename - Original filename
 */
const uploadBufferToCloudinary = (buffer, folder = 'sehatconnect', filename = 'file') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
        public_id: filename,
      },
      (error, result) => {
        if (error) {
          reject(new Error('Failed to upload file'));
        } else {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
            format: result.format,
            size: result.bytes,
          });
        }
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Generate signed URL for private files
 * @param {string} publicId - Cloudinary public ID
 * @param {number} expiresIn - Expiry time in seconds (default: 1 hour)
 */
const generateSignedUrl = (publicId, expiresIn = 3600) => {
  const timestamp = Math.round(Date.now() / 1000) + expiresIn;
  return cloudinary.url(publicId, {
    sign_url: true,
    type: 'authenticated',
    expires_at: timestamp,
  });
};

module.exports = {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  deleteFromCloudinary,
  uploadBufferToCloudinary,
  generateSignedUrl,
};
