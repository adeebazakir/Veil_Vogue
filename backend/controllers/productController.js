import Product from '../models/productModel.js';
import asyncHandler from 'express-async-handler'; // Simple express middleware for handling exceptions inside async express routes
import { deleteImage, upload } from '../config/cloudinary.js';

// @desc    Upload product image
// @route   POST /api/products/upload
// @access  Private/Seller
const uploadProductImage = asyncHandler(async (req, res) => {
    try {
        if (!req.file) {
            res.status(400);
            throw new Error('Please upload an image file');
        }

        res.status(200).json({
            url: req.file.path,
            public_id: req.file.filename
        });
    } catch (error) {
        res.status(500);
        throw new Error(error.message || 'Error uploading image');
    }
});

// @access  Private/Admin
const getAllProductsForAdmin = asyncHandler(async (req, res) => {
    console.log('=== ADMIN ROUTE DEBUG ===');
    console.log('Admin route hit: /api/products/admin/all-products');
    console.log('User role:', req.user?.role);
    console.log('User ID:', req.user?._id);
    console.log('Request headers:', req.headers.authorization ? 'Token present' : 'No token');
    
    try {
        const products = await Product.find({}).populate('seller', 'name email');
        console.log(`Found ${products.length} total products`);
        
        // Log product details for debugging
        products.forEach((product, index) => {
            console.log(`Product ${index + 1}:`, {
                id: product._id,
                name: product.name,
                isVerified: product.isVerified,
                seller: product.seller?.name,
                image: product.image?.[0] || 'No image'
            });
        });
        
        res.json({
            success: true,
            count: products.length,
            products: products
        });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({
            success: false,
            message: 'Database error',
            error: error.message
        });
    }
});

// @desc    Fetch all verified products (with optional category filter)
// @route   GET /api/products?category=Suits
// @access  Public

const getProducts = asyncHandler(async (req, res) => {
    //Customers browse products by category and search
    // We only show products that the Admin has verified
    
    // Build filter object
    const filter = { isVerified: true };
    
    // Add category filter if provided in query params
    if (req.query.category) {
        // Case-insensitive category matching
        filter.category = new RegExp(`^${req.query.category}$`, 'i');
    }
    
    const products = await Product.find(filter).populate('seller', 'name email');
    res.json(products);
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id).populate('seller', 'name email');
    
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});


//@desc    Create a product (for sellers)
//@route   POST /api/products
//@access  Private/Seller

const createProduct = asyncHandler(async (req, res) => {
    try {
        console.log('Creating new product - Request body:', req.body);
        const { name, description, price, stock, category, images } = req.body;

        // Check for required fields
        if (!name || !price || stock === undefined || !category) {
            res.status(400);
            throw new Error('Please enter name, price, stock, and category.');
        }

        // Decide image source: prefer uploaded file (req.file), then images passed in body, else placeholder
        let imageUrl = 'https://via.placeholder.com/300/f0f0f0?text=Product+Image';
        let publicId = null;

        if (req.file) {
            console.log('Processing uploaded image (req.file):', req.file);
            imageUrl = req.file.path; // Cloudinary URL
            publicId = req.file.filename; // Cloudinary public ID
        } else if (images && Array.isArray(images) && images.length > 0 && images[0].url) {
            console.log('Using image from request body');
            imageUrl = images[0].url;
            publicId = images[0].public_id || null;
        }

        // Create a base product object
        const product = new Product({
            seller: req.user._id,
            name: name,
            description: description || 'No description provided.',
            price: price,
            category: category,
            stock: stock,
            images: [{
                url: imageUrl,
                public_id: publicId || 'placeholder'
            }],
            isVerified: false, // products start pending verification
            rating: 0,
            numReviews: 0
        });

        const createdProduct = await product.save();
        console.log('Product created successfully:', createdProduct);

        res.status(201).json({
            message: 'Product created successfully and is awaiting Admin verification.',
            product: createdProduct
        });
    } catch (error) {
        console.error('Error creating product:', error);
        res.status(500).json({
            message: 'Failed to create product',
            error: error.message
        });
    }
});

// @desc    Admin approves/rejects a product listing
// @route   PUT /api/products/admin/verify/:id
// @access  Private/Admin

const verifyProduct = asyncHandler(async (req, res) => {
    //Admin approves/rejects seller product listings
    const product = await Product.findById(req.params.id);

    if(product)
    {
    // Coerce the incoming value to a boolean to avoid storing strings
    // (e.g., 'true'/'false') which can cause unexpected filtering behavior.
    product.isVerified = Boolean(req.body.isVerified); // Boolean true/false sent in body

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    }
    else{
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Update a product (seller can update their own product)
// @route   PUT /api/products/:id
// @access  Private/Seller (or Admin)
const updateProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Authorization: seller who owns the product or admin
    if (!(req.user.role === 'admin' || product.seller.toString() === req.user._id.toString())) {
        res.status(401);
        throw new Error('Not authorized to update this product');
    }

    // If a new file is uploaded, delete existing images from Cloudinary first
    if (req.file) {
        // Delete all stored images for this product (ensures no orphan images)
        if (Array.isArray(product.images)) {
            for (const img of product.images) {
                if (img && img.public_id && img.public_id !== 'placeholder') {
                    try {
                        await deleteImage(img.public_id);
                        console.log(`Deleted old image ${img.public_id} from Cloudinary`);
                    } catch (err) {
                        console.error('Failed to delete old image from Cloudinary:', err.message || err);
                        res.status(500);
                        throw new Error('Failed to delete existing image from Cloudinary. Update aborted.');
                    }
                }
            }
        }

        // Attach new uploaded file details
        const imageUrl = req.file.path;
        const publicId = req.file.filename;

        product.images = [{ url: imageUrl, public_id: publicId }];
    }

    // Update other product fields if provided
    const updatableFields = ['name', 'description', 'price', 'category', 'stock'];
    updatableFields.forEach((field) => {
        if (req.body[field] !== undefined) product[field] = req.body[field];
    });

    const updated = await product.save();
    res.json({ message: 'Product updated successfully', product: updated });
});

// @desc    Delete a product (seller or admin)
// @route   DELETE /api/products/:id
// @access  Private/Seller (owner) | Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);

    if (!product) {
        res.status(404);
        throw new Error('Product not found');
    }

    // Authorization check
    if (!(req.user.role === 'admin' || product.seller.toString() === req.user._id.toString())) {
        res.status(401);
        throw new Error('Not authorized to delete this product');
    }

    // Try to delete images from Cloudinary (non-blocking - log errors but continue)
    if (Array.isArray(product.images)) {
        for (const img of product.images) {
            if (img && img.public_id && img.public_id !== 'placeholder') {
                try {
                    await deleteImage(img.public_id);
                    console.log(`✓ Deleted image ${img.public_id} from Cloudinary`);
                } catch (err) {
                    // Log error but don't stop deletion
                    console.warn(`⚠ Failed to delete image ${img.public_id} from Cloudinary:`, err.message);
                    console.warn('Continuing with product deletion...');
                }
            }
        }
    }

    // Delete product from database
    await Product.findByIdAndDelete(productId);
    
    console.log(`✓ Product ${productId} deleted successfully`);
    res.json({ 
        success: true,
        message: 'Product deleted successfully' 
    });
});

// @desc    Get product statistics for admin
// @route   GET /api/products/admin/stats
// @access  Private/Admin
const getProductStats = asyncHandler(async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments({});
        const verifiedProducts = await Product.countDocuments({ isVerified: true });
        const pendingProducts = await Product.countDocuments({ isVerified: false });

        res.json({
            success: true,
            stats: {
                totalProducts,
                verifiedProducts,
                pendingProducts
            }
        });
    } catch (error) {
        res.status(500);
        throw new Error('Failed to fetch product statistics');
    }
});

// @desc    Get seller's verified products
// @route   GET /api/products/seller/verified
// @access  Private/Seller
const getSellerVerifiedProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ 
        seller: req.user._id,
        isVerified: true 
    }).sort({ createdAt: -1 });
    
    res.json(products);
});

// @desc    Get all seller's products (verified and pending)
// @route   GET /api/products/seller/all
// @access  Private/Seller
const getSellerAllProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({ 
        seller: req.user._id 
    }).sort({ createdAt: -1 });
    
    res.json(products);
});

export { createProduct, getProducts, getProductById, verifyProduct, getAllProductsForAdmin, updateProduct, deleteProduct, getProductStats, getSellerVerifiedProducts, getSellerAllProducts };