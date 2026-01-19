
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import Portal from './models/Portal.js';
import Post from './models/Post.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const mergePortals = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Get Portals
        const sourceName = 'test 1';
        const targetName = 'deepace global';

        const source = await Portal.findOne({ name: sourceName });
        const target = await Portal.findOne({ name: targetName });

        if (!source) { console.error(`Source '${sourceName}' not found`); process.exit(1); }
        if (!target) { console.error(`Target '${targetName}' not found`); process.exit(1); }

        console.log(`Merging '${source.name}' (${source._id}) -> '${target.name}' (${target._id})`);

        // 2. Merge Channels
        // Ensure all channels in source exist in target
        let channelsAdded = 0;
        if (source.channels) {
            for (const ch of source.channels) {
                const exists = target.channels.some(tc => tc.name === ch.name);
                if (!exists) {
                    target.channels.push(ch);
                    channelsAdded++;
                }
            }
        }
        console.log(`Channels merged: ${channelsAdded} new channels added.`);

        // 3. Merge Members & Admins
        const initialMemberCount = target.members.length;

        // Members
        const sourceMembers = source.members.map(m => m.toString());
        const targetMembers = new Set(target.members.map(m => m.toString()));

        sourceMembers.forEach(id => targetMembers.add(id));
        target.members = Array.from(targetMembers);

        // Admins
        const sourceAdmins = source.admins.map(m => m.toString());
        const targetAdmins = new Set(target.admins.map(m => m.toString()));

        sourceAdmins.forEach(id => targetAdmins.add(id));
        target.admins = Array.from(targetAdmins);

        await target.save();
        console.log(`Members merged. Count: ${initialMemberCount} -> ${target.members.length}`);

        // 4. Move Posts
        const postUpdateResult = await Post.updateMany(
            { portal: source._id },
            { portal: target._id }
        );
        console.log(`Posts moved: ${postUpdateResult.modifiedCount}`);

        // 5. Update Users (joinedPortals)
        // Find users who have source ID, remove it, add target ID
        const usersToUpdate = await User.find({ joinedPortals: source._id });
        console.log(`Updating ${usersToUpdate.length} users...`);

        for (const user of usersToUpdate) {
            // Remove source
            user.joinedPortals = user.joinedPortals.filter(p => p.toString() !== source._id.toString());
            // Add target if not exists
            if (!user.joinedPortals.some(p => p.toString() === target._id.toString())) {
                user.joinedPortals.push(target._id);
            }
            await user.save();
        }

        console.log('Migration completed successfully.');
        process.exit();
    } catch (err) {
        console.error('Migration Error:', err);
        process.exit(1);
    }
};

mergePortals();
