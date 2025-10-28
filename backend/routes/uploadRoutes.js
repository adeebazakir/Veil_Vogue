import express from 'express';
import { upload, cloudinary, deleteImage } from '../config/cloudinary.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Test route to verify Cloudinary configuration
router.get('/test-config', (req, res) => {
    const config = cloudinary.config();
    res.json({
        cloudinary_configured: !!(config.cloud_name && config.api_key && config.api_secret),
        cloud_name: config.cloud_name || 'NOT SET',
        api_key_set: !!config.api_key,
        api_secret_set: !!config.api_secret
    });
});

// Upload image
router.post('/', protect, (req, res) => {
    console.log('Upload request received');
    console.log('Headers:', req.headers);
    console.log('Body type:', typeof req.body);
    
    // Handle the upload using multer (with CloudinaryStorage)
    upload(req, res, function(err) {
        if (err) {
            console.error('Multer/Cloudinary error details:', {
                message: err.message,
                code: err.code,
                field: err.field,
                storageErrors: err.storageErrors,
                stack: err.stack
            });
            return res.status(400).json({
                success: false,
                message: err.message || 'Error uploading image',
                error: err.code || 'UPLOAD_ERROR'
            });
        }

        // Check if file exists
        if (!req.file) {
            console.log('No file in request. req.body:', req.body);
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        console.log('Upload successful:', {
            filename: req.file.originalname,
            url: req.file.path,
            publicId: req.file.filename
        });

        // File is already uploaded to Cloudinary by multer middleware
        // req.file.path contains the Cloudinary URL
        // req.file.filename contains the public_id
        res.status(200).json({
            success: true,
            url: req.file.path,
            public_id: req.file.filename,
            message: 'Image uploaded successfully'
        });
    });
});

// Delete image
router.delete('/:publicId', protect, isAdmin, async (req, res) => {
    try {
        const { publicId } = req.params;
        
        if (!publicId) {
            return res.status(400).json({ message: 'Please provide an image ID' });
        }

        // Delete image from Cloudinary
        const result = await deleteImage(publicId);
        
        res.status(200).json({ message: 'Image deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Image deletion failed' });
    }
});

export default router;