import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/likes/post/:postId
// @desc    Like/unlike a post
// @access  Private
router.post('/post/:postId', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const likeIndex = post.likes.indexOf(req.user.id);

        if (likeIndex > -1) {
            // Unlike
            post.likes.splice(likeIndex, 1);
            post.likeCount = Math.max(0, post.likeCount - 1);
            await post.save();

            res.json({
                message: 'Post unliked',
                liked: false,
                likeCount: post.likeCount
            });
        } else {
            // Like
            post.likes.push(req.user.id);
            post.likeCount += 1;
            await post.save();

            res.json({
                message: 'Post liked',
                liked: true,
                likeCount: post.likeCount
            });
        }
    } catch (error) {
        console.error('Like post error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/likes/comment/:commentId
// @desc    Like/unlike a comment
// @access  Private
router.post('/comment/:commentId', protect, async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId);

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const likeIndex = comment.likes.indexOf(req.user.id);

        if (likeIndex > -1) {
            // Unlike
            comment.likes.splice(likeIndex, 1);
            comment.likeCount = Math.max(0, comment.likeCount - 1);
            await comment.save();

            res.json({
                message: 'Comment unliked',
                liked: false,
                likeCount: comment.likeCount
            });
        } else {
            // Like
            comment.likes.push(req.user.id);
            comment.likeCount += 1;
            await comment.save();

            res.json({
                message: 'Comment liked',
                liked: true,
                likeCount: comment.likeCount
            });
        }
    } catch (error) {
        console.error('Like comment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/likes/post/:postId
// @desc    Get users who liked a post
// @access  Public
router.get('/post/:postId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('likes', 'username profile.displayName profile.avatar');

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.json(post.likes);
    } catch (error) {
        console.error('Get post likes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   GET /api/likes/comment/:commentId
// @desc    Get users who liked a comment
// @access  Public
router.get('/comment/:commentId', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.commentId)
            .populate('likes', 'username profile.displayName profile.avatar');

        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.json(comment.likes);
    } catch (error) {
        console.error('Get comment likes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

export default router;
