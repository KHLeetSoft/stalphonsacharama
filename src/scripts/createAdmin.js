const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const Admin = require('../models/Admin');

async function createAdmin() {
    const MONGO_URI = process.env.MONGO_URI;
    if (!MONGO_URI) {
        console.error('MONGO_URI not found. Exiting.');
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI);
        //console.log('MongoDB connected successfully');

        const username = 'admin';
        const password = 'admin@123';
        const role = 'super_admin';
        const email = 'admin@example.com';

        //console.log(`Attempting to create admin with username: ${username}`);

        let existingAdmin = await Admin.findOne({ username });
        if (existingAdmin) {
            //console.log('Admin with this username already exists');
            return;
        }

        existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            //console.log('Admin with this email already exists');
            return;
        }

        const admin = new Admin({
            username,
            email,
            password,
            role,
            isActive: true
        });

        await admin.save();
        //console.log('Admin created successfully');
        
    } catch (error) {
        console.error('Error creating admin:', error);
    } finally {
        await mongoose.disconnect();
        //console.log('MongoDB disconnected');
    }
}

createAdmin();