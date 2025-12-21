import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ModelUser from './models/User.js';
import ModelPost from './models/Post.js';
import ModelPortal from './models/Portal.js';

dotenv.config();

const migrate = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB Connected');

        // 1. Get or Create Admin/Owner User (First user found)
        const owner = await ModelUser.findOne();
        if (!owner) {
            console.error('No users found. Create a user first.');
            process.exit(1);
        }

        // 2. Create 'TEST1' Portal if not exists
        let testPortal = await ModelPortal.findOne({ name: 'TEST1' });
        if (!testPortal) {
            testPortal = await ModelPortal.create({
                name: 'TEST1',
                description: 'Migration Legacy Portal',
                owner: owner._id,
                privacy: 'public'
            });
            console.log("Created 'TEST1' Portal:", testPortal._id);
        } else {
            console.log("Found 'TEST1' Portal:", testPortal._id);
        }

        // 3. Update All Posts to belong to 'TEST1'
        const result = await ModelPost.updateMany(
            { portal: { $exists: false } },
            { $set: { portal: testPortal._id } }
        );
        console.log(`Updated ${result.modifiedCount} posts to belong to 'TEST1'.`);

        // 4. (Optional) Add all existing users as members of TEST1 so they see content
        // This is important for the transition period
        const users = await ModelUser.find({});
        const userUpdates = users.map(user => {
            // If we haven't updated User model yet, this might fail if we try to push to non-existent joinedPortals
            // But for now, we just add them to the Portal's members list
            return ModelPortal.findByIdAndUpdate(testPortal._id, {
                $addToSet: { members: user._id }
            });
        });
        await Promise.all(userUpdates);
        console.log(`Added ${users.length} users to 'TEST1' members list.`);

        console.log('Migration Completed Successfully');
        process.exit(0);

    } catch (error) {
        console.error('Migration Error:', error);
        process.exit(1);
    }
};

migrate();
