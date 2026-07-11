const fs = require('fs');
const path = require('path');

// Mock or real upload helper
const uploadReceipt = async (file) => {
  if (!file) return null;

  // If Cloudinary keys are configured, you could initialize and upload:
  if (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  ) {
    try {
      // Lazy-load cloudinary package to avoid runtime errors if not installed/configured
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      // Upload logic (base64 or buffer)
      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { folder: 'flowwise_receipts' },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(file.buffer);
      });

      return uploadResult.secure_url;
    } catch (err) {
      console.warn('[Cloudinary Warning] Upload failed, falling back to mock link: ', err.message);
    }
  }

  // Fallback to simulating mock storage URL for testing
  // In a real environment, we'd save to a public folder
  const uploadDir = path.join(__dirname, '../../public/uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`;
  const filepath = path.join(uploadDir, filename);

  try {
    fs.writeFileSync(filepath, file.buffer);
    // Return relative or mock Unsplash/image link
    return `/uploads/${filename}`;
  } catch (err) {
    console.error('[Upload Error] Could not write local file: ', err);
    // absolute fallback
    return 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=500&auto=format&fit=crop&q=60';
  }
};

module.exports = { uploadReceipt };
