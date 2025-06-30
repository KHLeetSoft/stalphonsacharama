const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const mongoose = require('mongoose');
const fs = require('fs');

// Import all models
const models = {
  Admin: require('../models/Admin'),
  HomeContent: require('../models/HomeContent'),
  About: require('../models/About'),
  News: require('../models/News'),
  Transport: require('../models/Transport'),
  ResultSummary: require('../models/ResultSummary'),
  AdmissionProcedure: require('../models/AdmissionProcedure'),
  FeeStructure: require('../models/FeeStructure'),
  BookList: require('../models/BookList'),
  SchoolManagement: require('../models/SchoolManagement'),
  AnnualReport: require('../models/AnnualReport'),
  Facility: require('../models/Facility'),
  Content: require('../models/content'),
  Message: require('../models/message'),
  Principal: require('../models/Principal'),
  Student: require('../models/Student'),
  Teacher: require('../models/Teacher'),
  Testimonial: require('../models/Testimonial'),
  User: require('../models/User'),
  Course: require('../models/Course'),
  Document: require('../models/Document'),
  Gallery: require('../models/Gallery'),
  Logo: require('../models/Logo'),
  Activity: require('../models/Activity'),
  Admission: require('../models/Admission'),
  Contact: require('../models/Contact'),
  Academic: require('../models/Academic'),
  AcademicProgram: require('../models/AcademicProgram'),
};

async function seedDemoData() {
  // const MONGO_URI = process.env.MONGO_URI;
  const MONGO_URI = "mongodb+srv://innovationleetsoft:Leethesh@cluster0.jxywvn1.mongodb.net/stalphonsacharama1?retryWrites=true&w=majority";
  if (!MONGO_URI) {
    console.error('MONGO_URI not found. Exiting.');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGO_URI);
    //console.log('MongoDB connected successfully');

    // Admin (needed for createdBy fields)
    let admin = await models.Admin.findOne({ username: 'admin' });
    if (!admin) {
      admin = new models.Admin({
        username: 'admin',
        password: 'admin@123',
        email: 'admin@example.com',
        role: 'super_admin',
        isActive: true
      });
      await admin.save();
      //console.log('Seeded admin');
    }

    // Add a second admin with username 'administrator'
    let admin2 = await models.Admin.findOne({ username: 'administrator' });
    if (!admin2) {
      admin2 = new models.Admin({
        username: 'administrator',
        password: 'admin@123',
        email: 'administrator@example.com',
        role: 'super_admin',
        isActive: true
      });
      await admin2.save();
      //console.log('Seeded admin (administrator)');
    }

    // User
    let user = await models.User.findOne({ username: 'admin' });
    if (!user) {
      user = new models.User({
        username: 'admin',
        password: 'admin@123',
        email: 'admin@example.com',
        name: 'Admin User',
        role: 'admin',
        isActive: true,
        createdBy: admin._id
      });
      await user.save();
      //console.log('Seeded user');
    }

    // HomeContent
    if (!(await models.HomeContent.findOne())) {
      await models.HomeContent.create({
        welcomeTitle: 'Welcome to St. Alphonsa School',
        welcomeContent: 'A place of learning, growth, and excellence.',
        bannerSlides: [
          { title: 'Our Campus', imageUrl: '/public/uploads/sample1.jpg', contentType: 'image' },
          { title: 'Annual Day', imageUrl: '/public/uploads/sample2.jpg', contentType: 'image' }
        ],
        history: 'Founded in 1990, St. Alphonsa School has a rich tradition...',
        featuredSections: [
          { title: 'Academics', content: 'World-class curriculum and faculty.' },
          { title: 'Sports', content: 'State-of-the-art sports facilities.' }
        ],
        ourSociety: { title: 'Our Society', content: 'We are part of a vibrant community.', isActive: true },
        whoWeAre: { title: 'Who We Are', content: 'Dedicated to holistic education.', isActive: true },
        infrastructure: { title: 'Modern Infrastructure', isActive: true, items: [] },
        recentAnnouncements: { title: 'Announcements', isActive: true, announcements: [] }
      });
      //console.log('Seeded HomeContent');
    }

    // About
    if (!(await models.About.findOne())) {
      await models.About.create({
        title: 'About St. Alphonsa School',
        content: 'St. Alphonsa School is committed to academic excellence and character development.',
        vision: 'To nurture responsible citizens.',
        mission: 'To provide quality education to all.'
      });
      //console.log('Seeded About');
    }

    // Academic
    if (!(await models.Academic.findOne())) {
      await models.Academic.create({
        title: 'Science Stream',
        description: 'Physics, Chemistry, Biology, Mathematics',
        isActive: true
      });
      //console.log('Seeded Academic');
    }

    // AcademicProgram
    if (!(await models.AcademicProgram.findOne())) {
      await models.AcademicProgram.create({
        title: 'CBSE Curriculum',
        description: 'Comprehensive CBSE program for all grades.',
        isActive: true
      });
      //console.log('Seeded AcademicProgram');
    }

    // Activity
    if (!(await models.Activity.findOne())) {
      await models.Activity.create({
        title: 'Annual Sports Day',
        description: 'A day full of sports and fun!',
        isActive: true
      });
      //console.log('Seeded Activity');
    }

    // News
    if (!(await models.News.findOne())) {
      await models.News.create({
        title: 'School Reopens',
        content: 'School reopens on June 15th.',
        isActive: true,
        createdBy: admin._id
      });
      //console.log('Seeded News');
    }

    // ResultSummary
    if (!(await models.ResultSummary.findOne())) {
      await models.ResultSummary.create({
        title: 'Class 10 Results',
        academicYear: '2023-24',
        class: '10',
        examType: 'final',
        examDate: new Date('2024-03-15'),
        totalStudents: 100,
        appearedStudents: 98,
        passedStudents: 95,
        distinctionStudents: 20,
        firstDivisionStudents: 40,
        secondDivisionStudents: 25,
        thirdDivisionStudents: 10,
        passPercentage: 97,
        averageScore: 80,
        highestScore: 99,
        lowestScore: 50,
        description: 'Excellent results!',
        isPublished: true,
        publishedDate: new Date(),
        tags: ['class10', 'final'],
        createdBy: admin._id
      });
      //console.log('Seeded ResultSummary');
    }

    // Add similar demo data for all other models (BookList, FeeStructure, Teacher, Student, etc.)
    // For brevity, only a few are shown here. You can expand as needed.

    //console.log('Demo data seeding complete!');
  } catch (error) {
    console.error('Error seeding demo data:', error);
  } finally {
    await mongoose.disconnect();
    //console.log('MongoDB disconnected');
  }
}

seedDemoData(); 