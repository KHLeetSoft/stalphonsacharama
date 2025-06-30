const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const User = require('../models/User');
const Admin = require('../models/Admin');

async function createUser() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found. Exiting.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        //console.log('MongoDB connected successfully');

        // Find an admin to set as createdBy
        const admin = await Admin.findOne();
        if (!admin) {
            console.error('No admin found. Please create an admin first.');
            return;
        }

        const username = 'admin';
        const password = 'admin@123';
        const role = 'admin';
        const email = 'admin@example.com';
        const name = 'Admin User';

        // Check if user already exists
        let existingUser = await User.findOne({ username });
        if (existingUser) {
            //console.log('User with this username already exists');
            return;
        }
        existingUser = await User.findOne({ email });
        if (existingUser) {
            //console.log('User with this email already exists');
            return;
        }

        const user = new User({
            username,
            password,
            email,
            name,
            role,
            isActive: true,
            createdBy: admin._id
        });

        await user.save();
        //console.log('User created successfully');
    } catch (error) {
        console.error('Error creating user:', error);
    } finally {
        await mongoose.disconnect();
        //console.log('MongoDB disconnected');
    }
}

createUser(); 