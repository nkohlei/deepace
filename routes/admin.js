import express from 'express';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   GET /api/admin/verification-requests
// @desc    Get all pending verification requests
// @access  Private/Admin
router.get('/verification-requests', protect, admin, async (req, res) => {
    try {
        const users = await User.find({ 'verificationRequest.status': 'pending' })
            .select('username email profile verificationRequest');
        res.json(users);
    } catch (error) {
        console.error('Fetch requests error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/verify-user/:id
// @desc    Approve verification request
// @access  Private/Admin
router.post('/verify-user/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { badgeType } = user.verificationRequest;

        user.isVerified = true;
        user.verificationBadge = badgeType || 'blue';
        user.verificationRequest.status = 'approved';
        user.verificationRequest.processedAt = new Date();

        await user.save();

        // Create Notification
        await Notification.create({
            recipient: user._id,
            type: 'system', // We might need to add 'system' to Notification enum if not exists, or verify logic
            content: `Tebrikler! Hesabınız doğrulandı ve ${badgeType.toUpperCase()} rozetiniz tanımlandı.`
        });

        res.json({ message: 'User verified successfully', user });
    } catch (error) {
        console.error('Approve verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/admin/reject-verification/:id
// @desc    Reject verification request
// @access  Private/Admin
router.post('/reject-verification/:id', protect, admin, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.verificationRequest.status = 'rejected';
        user.verificationRequest.processedAt = new Date();

        await user.save();

        // Create Notification
        await Notification.create({
            recipient: user._id,
            type: 'system',
            content: 'Üzgünüz, onaylanmış hesap başvurunuz reddedildi. Şartları sağladığınızda tekrar başvurabilirsiniz.'
        });

        res.json({ message: 'Request rejected', user });
    } catch (error) {
        console.error('Reject verification error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
