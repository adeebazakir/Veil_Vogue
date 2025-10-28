import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory path of the current file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from the backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Log configuration status (for debugging)
console.log('Cloudinary Configuration:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'NOT SET',
    api_key_set: !!process.env.CLOUDINARY_API_KEY,
    api_secret_set: !!process.env.CLOUDINARY_API_SECRET
});

// Configure Cloudinary Storage with enhanced options
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'v_v_ecommerce/products',
        allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [
            { width: 1000, height: 1000, crop: 'limit' },
            { quality: 'auto:good' }, // Automatic quality optimization
            { fetch_format: 'auto' }  // Automatic format optimization
        ],
        // Add unique filename to prevent overwrites
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            return 'product-' + uniqueSuffix;
        }
    },
    allowedFormats: ['jpg', 'jpeg', 'png', 'webp']
});

// Configure Multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
}).single('image'); // 'image' is the field name in the form

// Upload image to Cloudinary
const uploadImage = async (file) => {
    try {
        console.log('Uploading image to Cloudinary...');
        const result = await new Promise((resolve, reject) => {
            upload(file, {}, (error, result) => {
                if (error) reject(error);
                else resolve(result);
            });
        });
        console.log('Image uploaded successfully:', result);
        return result;
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
};

// Delete image from Cloudinary
const deleteImage = async (publicId) => {
    try {
        console.log('Deleting image from Cloudinary:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Image deleted successfully:', result);
        return result;
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
};

export {
    upload,
    cloudinary,
    uploadImage,
    deleteImage
};