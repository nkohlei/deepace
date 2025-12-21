import express from 'express';
import Portal from '../models/Portal.js';
import Post from '../models/Post.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @desc    Create a new portal
// @route   POST /api/portals
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { name, description, privacy, avatar } = req.body;

        const portalExists = await Portal.findOne({ name });
        if (portalExists) {
            return res.status(400).json({ message: 'Portal name already exists' });
        }

        const portal = await Portal.create({
            name,
            description,
            privacy,
            avatar,
            owner: req.user._id,
            admins: [req.user._id],
            members: [req.user._id]
        });

        // Add to user's joined portals
        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { joinedPortals: portal._id }
        });

        res.status(201).json(portal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get all portals (Search & Popular)
// @route   GET /api/portals
// @access  Public
router.get('/', async (req, res) => {
    try {
        const keyword = req.query.keyword
            ? {
                name: {
                    $regex: req.query.keyword,
                    $options: 'i',
                },
            }
            : {};

        const portals = await Portal.find({ ...keyword, privacy: 'public' })
            .select('-members') // Exclude members list for list view performance
            .limit(20);

        res.json(portals);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get portal by ID
// @route   GET /api/portals/:id
// @access  Private (if private) / Public
router.get('/:id', async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.id)
            .populate('owner', 'username profile.avatar')
            .populate('admins', 'username profile.avatar');

        if (!portal) {
            return res.status(404).json({ message: 'Portal not found' });
        }

        res.json(portal);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Get posts for a specific portal
// @route   GET /api/portals/:id/posts
// @access  Public (if public portal) / Private (if private)
router.get('/:id/posts', async (req, res) => {
    try {
        const portalId = req.params.id;
        const posts = await Post.find({ portal: portalId })
            .populate('author', 'username profile.avatar verificationBadge')
            .sort({ createdAt: -1 });

        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Join a portal
// @route   POST /api/portals/:id/join
// @access  Private
router.post('/:id/join', protect, async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.id);

        if (!portal) {
            return res.status(404).json({ message: 'Portal not found' });
        }

        if (portal.members.includes(req.user._id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        portal.members.push(req.user._id);
        await portal.save();

        await User.findByIdAndUpdate(req.user._id, {
            $addToSet: { joinedPortals: portal._id }
        });

        res.json({ message: 'Joined portal successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// @desc    Leave a portal
// @route   POST /api/portals/:id/leave
// @access  Private
router.post('/:id/leave', protect, async (req, res) => {
    try {
        const portal = await Portal.findById(req.params.id);

        if (!portal) {
            return res.status(404).json({ message: 'Portal not found' });
        }

        // Prevent owner from leaving without transferring ownership (simplified: owner can't leave)
        if (portal.owner.toString() === req.user._id.toString()) {
            return res.status(400).json({ message: 'Owner cannot leave the portal. Transfer ownership first.' });
        }

        portal.members = portal.members.filter(
            (memberId) => memberId.toString() !== req.user._id.toString()
        );
        await portal.save();

        await User.findByIdAndUpdate(req.user._id, {
            $pull: { joinedPortals: portal._id }
        });

        res.json({ message: 'Left portal successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
