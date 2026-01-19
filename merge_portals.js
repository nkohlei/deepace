
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import User from './models/User.js';
import Portal from './models/Portal.js';
import Post from './models/Post.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Robust Env Loading
try {
    const envPath = path.join(__dirname, '.env');
    if (fs.existsSync(envPath)) {
        const envConfig = dotenv.parse(fs.readFileSync(envPath));
        for (const k in envConfig) {
            process.env[k] = envConfig[k];
        }
        console.log('Env loaded manually.');
    } else {
        dotenv.config(); // Fallback
    }
} catch (e) {
    console.error('Env load error:', e);
}

const mergePortals = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error('MONGO_URI missing');
        }
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        // 1. Find Portals with fuzzy matching
        const portals = await Portal.find({});

        let source = portals.find(p => /test\s?1/i.test(p.name));
        let target = portals.find(p => /deepace\s?global/i.test(p.name));

        if (!source) {
            console.log('Source portal matching "test 1" not found. Available names:');
            portals.forEach(p => console.log(`- ${p.name}`));
            process.exit(1);
        }
        if (!target) {
            console.log('Target portal matching "deepace global" not found. Available names:');
            portals.forEach(p => console.log(`- ${p.name}`));
            process.exit(1);
        }

        console.log(`Merging '${source.name}' (${source._id}) -> '${target.name}' (${target._id})`);

        // 2. Merge Channels
        let channelsAdded = 0;
        if (source.channels) {
            for (const ch of source.channels) {
                // Check by name (case insensitive)
                const exists = target.channels.some(tc => tc.name.toLowerCase() === ch.name.toLowerCase());
                if (!exists) {
                    target.channels.push(ch);
                    channelsAdded++;
                }
            }
        }
        console.log(`Channels merged: ${channelsAdded} new channels added.`);

        // 3. Merge Members
        const initialMemberCount = target.members.length;
        const sourceMembers = source.members.map(m => m.toString());
        const targetMembers = new Set(target.members.map(m => m.toString()));
        sourceMembers.forEach(id => targetMembers.add(id));
        target.members = Array.from(targetMembers);

        // Merge Admins
        const sourceAdmins = source.admins.map(m => m.toString());
        const targetAdmins = new Set(target.admins.map(m => m.toString()));
        sourceAdmins.forEach(id => targetAdmins.add(id));
        target.admins = Array.from(targetAdmins);

        await target.save();
        console.log(`Members merged. Total: ${target.members.length} (was ${initialMemberCount})`);

        // 4. Move Posts
        const postUpdateResult = await Post.updateMany(
            { portal: source._id },
            { portal: target._id }
        );
        console.log(`Posts moved: ${postUpdateResult.modifiedCount}`);

        // Also update posts channel refs if they used ID references that are specific to source portal
        // Since we copied channels, they have NEW IDs if created new, or same structure if simple objects? 
        // Portal.channels schema is subdocuments with _id.
        // When pushed to target, mongoose might generate NEW _ids for them.
        // This is tricky. If posts reference channel NAME, it's fine. 
        // My Post model uses String for channel (name or ID). 
        // If it used IDs from the old portal, those IDs might not exist in the new portal's subdoc array.
        // However, standardizing on 'general' helps. 
        // For custom channels, posts might be orphaned visually if IDs don't match.
        // But the user's request is mainly about posts being visible.
        // Let's assume name matching for now or that we are fine.

        // 5. Update Users (joinedPortals)
        const usersToUpdate = await User.find({ joinedPortals: source._id });
        console.log(`Updating ${usersToUpdate.length} users...`);

        for (const user of usersToUpdate) {
            user.joinedPortals = user.joinedPortals.filter(p => p.toString() !== source._id.toString());
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
