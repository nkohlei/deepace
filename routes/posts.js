import express from 'express';
import multer from 'multer';
import path from 'path';
import { protect } from '../middleware/auth.js';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for file uploads
import { storage } from '../config/cloudinary.js';

// Configure multer for file uploads with Cloudinary
const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            cb(null, true);
        } else {
            cb(new Error('Only images and GIFs are allowed'));
        }
    },
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, (req, res, next) => {
    upload.single('media')(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({ message: `Upload error: ${err.message}` });
        } else if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
}, async (req, res) => {
    try {
        const { content } = req.body;

        if (!content && !req.file) {
            return res.status(400).json({ message: 'Post must have content or media' });
        }

        const postData = {
            author: req.user._id,
            content: content || '',
        };

        if (req.file) {
            postData.media = req.file.path;
            postData.mediaType = req.file.mimetype.includes('gif') ? 'gif' : 'image';
        }

        const post = await Post.create(postData);
        await post.populate('author', 'username profile.displayName profile.avatar verificationBadge');

        // Increment post count
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: 1 } });

        // Emit socket event for real-time update (handled in server.js)
        req.app.get('io').emit('newPost', post);

        res.status(201).json(post);
    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts
// @desc    Get all posts (global feed)
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        // Fetch slightly more to account for filtered private posts
        // Ideally this should be done with aggregation for true pagination
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit + 10) // buffer
            .populate('author', 'username profile.displayName profile.avatar verificationBadge settings.privacy');

        if (!req.user.following) req.user.following = []; // Safety

        const visiblePosts = posts.filter(post => {
            if (!post.author) return false;
            // Public
            if (!post.author.settings?.privacy?.isPrivate) return true;
            // Own
            if (post.author._id.toString() === req.user._id.toString()) return true;
            // Following
            return req.user.following.some(id => id.toString() === post.author._id.toString());
        });

        const paginatedPosts = visiblePosts.slice(0, limit);
        const total = await Post.countDocuments(); // This is total raw posts, not visible. Fixing strict count would require complex query.

        res.json({
            posts: paginatedPosts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
        });
    } catch (error) {
        console.error('Get posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/:id
// @desc    Get single post by ID
// @access  Private
router.get('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username profile.displayName profile.avatar verificationBadge settings.privacy');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Privacy Check
        if (post.author.settings?.privacy?.isPrivate) {
            const isOwn = post.author._id.toString() === req.user._id.toString();
            const isFollowing = req.user.following.some(id => id.toString() === post.author._id.toString());

            if (!isOwn && !isFollowing) {
                return res.status(403).json({ message: 'This account is private' });
            }
        }

        res.json(post);
    } catch (error) {
        console.error('Get post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user ID
// @access  Private
router.get('/user/:userId', protect, async (req, res) => {
    try {
        // Privacy Check First
        const targetUser = await User.findById(req.params.userId);
        if (!targetUser) return res.status(404).json({ message: 'User not found' });

        if (targetUser.settings?.privacy?.isPrivate) {
            const isOwn = req.params.userId === req.user._id.toString();
            const isFollowing = req.user.following.some(id => id.toString() === req.params.userId);

            if (!isOwn && !isFollowing) {
                return res.status(403).json({ message: 'This account is private' });
            }
        }

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const posts = await Post.find({ author: req.params.userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('author', 'username profile.displayName profile.avatar verificationBadge');

        const total = await Post.countDocuments({ author: req.params.userId });

        res.json({
            posts,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
            totalPosts: total,
        });
    } catch (error) {
        console.error('Get user posts error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/posts/:id
// @desc    Delete a post
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        // Check if user is the author
        if (post.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this post' });
        }

        await post.deleteOne();

        // Decrement post count
        await User.findByIdAndUpdate(req.user._id, { $inc: { postCount: -1 } });

        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        console.error('Delete post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
