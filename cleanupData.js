
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import connectDB from './config/db.js';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const cleanupData = async () => {
    try {
        console.log('Veritabanına bağlanılıyor...');
        await connectDB();
        console.log('Veri temizliği başlıyor...');

        // 1. Get all valid User IDs
        const allUsers = await User.find().select('_id');
        const validUserIds = new Set(allUsers.map(u => u._id.toString()));
        console.log(`Toplam Kullanıcı Sayısı: ${validUserIds.size}`);

        // 2. Clean Users (Followers/Following)
        console.log('Kullanıcılar taranıyor...');
        const users = await User.find();
        let userUpdates = 0;

        for (const user of users) {
            let changed = false;

            // Clean Followers
            const originalFollowersCount = user.followers.length;
            const validFollowers = user.followers.filter(id => validUserIds.has(id.toString()));

            if (validFollowers.length !== originalFollowersCount) {
                user.followers = validFollowers;
                user.followerCount = validFollowers.length;
                changed = true;
            }

            // Clean Following
            const originalFollowingCount = user.following.length;
            const validFollowing = user.following.filter(id => validUserIds.has(id.toString()));

            if (validFollowing.length !== originalFollowingCount) {
                user.following = validFollowing;
                user.followingCount = validFollowing.length;
                changed = true;
            }

            // Clean Follow Requests
            if (user.followRequests && user.followRequests.length > 0) {
                const originalRequestsCount = user.followRequests.length;
                const validRequests = user.followRequests.filter(id => validUserIds.has(id.toString()));
                if (validRequests.length !== originalRequestsCount) {
                    user.followRequests = validRequests;
                    changed = true;
                }
            }

            if (changed) {
                await user.save();
                userUpdates++;
                process.stdout.write('.');
            }
        }
        console.log(`\n${userUpdates} kullanıcı güncellendi.`);

        // 3. Clean Posts (Likes)
        console.log('Gönderiler taranıyor...');
        const posts = await Post.find();
        let postUpdates = 0;

        for (const post of posts) {
            let changed = false;

            // Clean Likes
            const originalLikesCount = post.likes.length;
            const validLikes = post.likes.filter(id => validUserIds.has(id.toString()));

            if (validLikes.length !== originalLikesCount) {
                post.likes = validLikes;
                post.likeCount = validLikes.length;
                changed = true;
            }

            // Check Author Existence (Delete post if author gone - though usually logic prevents this, good to check)
            if (!validUserIds.has(post.author.toString())) {
                await Post.findByIdAndDelete(post._id);
                console.log(`\nSilinen kullanıcıya ait gönderi temizlendi: ${post._id}`);
                continue; // Skip save
            }

            if (changed) {
                await post.save();
                postUpdates++;
                process.stdout.write('.');
            }
        }
        console.log(`\n${postUpdates} gönderi güncellendi.`);

        // 4. Clean Comments (Likes)
        console.log('Yorumlar taranıyor...');
        const comments = await Comment.find();
        let commentUpdates = 0;

        for (const comment of comments) {
            let changed = false;

            // Clean Likes
            const originalLikesCount = comment.likes.length;
            const validLikes = comment.likes.filter(id => validUserIds.has(id.toString()));

            if (validLikes.length !== originalLikesCount) {
                comment.likes = validLikes;
                comment.likeCount = validLikes.length;
                changed = true;
            }

            // Check Author Existence
            if (!validUserIds.has(comment.author.toString())) {
                await Comment.findByIdAndDelete(comment._id);
                console.log(`\nSilinen kullanıcıya ait yorum temizlendi: ${comment._id}`);
                continue;
            }

            if (changed) {
                await comment.save();
                commentUpdates++;
                process.stdout.write('.');
            }
        }
        console.log(`\n${commentUpdates} yorum güncellendi.`);

        console.log('Temizlik tamamlandı! Veriler artık tutarlı.');
        process.exit(0);
    } catch (error) {
        console.error('Bir hata oluştu:', error);
        process.exit(1);
    }
};

cleanupData();
