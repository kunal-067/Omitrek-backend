const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dj3cuvcul',
    api_key: '732658812763723',
    api_secret: process.env.CLOUDINARY_SECRET || '1_uEyTactU7jySG5Ye0r5TOpGeA'
});

// Set up Multer for image upload
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'image-uploads',
    },
});

const upload = multer({
    storage
}).array('images', 10);

// Error handling middleware for Multer upload
function handleMulterError(error, req, res, next) {
    console.error('Multer upload error:', error);
    // Handle Multer upload error
    res.status(500).json({ error: 'Multer upload failed' });
}

module.exports = { upload, handleMulterError };
