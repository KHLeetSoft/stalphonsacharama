const mongoose = require("mongoose");

const bannerSlideSchema = new mongoose.Schema({
  contentType: { type: String, enum: ["image", "video"], default: "image" },
  imageUrl: { type: String },
  videoUrl: { type: String },
  title: { type: String, required: true },
  subtitle: { type: String },
  ctaText: { type: String },
  ctaLink: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const announcementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, enum: ['sports', 'academic', 'cultural', 'other'], default: 'other' },
  date: { type: Date, default: Date.now },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const achieverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  achievement: { type: String, required: true },
  category: { type: String, enum: ['student', 'teacher', 'alumni', 'other'], default: 'student' },
  year: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const infrastructureItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String },
  image: { type: String },
  isActive: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
});

const homeContentSchema = new mongoose.Schema({
  bannerSlides: [bannerSlideSchema],
  welcomeTitle: { type: String, default: "Welcome to Our School" },
  welcomeContent: { type: String },
  featuredSections: [
    {
      title: String,
      content: String,
      icon: String,
      link: String,
    },
  ],
  history: {
    type: String,
    default: '',
  },
  
  // New sections
  ourSociety: {
    title: { type: String, default: "Our Society" },
    content: { type: String, default: "" },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  
  whoWeAre: {
    title: { type: String, default: "Who We Are" },
    content: { type: String, default: "" },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  
  infrastructure: {
    title: { type: String, default: "Infrastructure" },
    subtitle: { type: String, default: "Our Facilities" },
    content: { type: String, default: "" },
    items: [infrastructureItemSchema],
    isActive: { type: Boolean, default: true },
  },
  
  recentAnnouncements: {
    title: { type: String, default: "Recent Announcements" },
    subtitle: { type: String, default: "Stay Updated" },
    announcements: [announcementSchema],
    isActive: { type: Boolean, default: true },
  },
  
  sportsAchievements: {
    title: { type: String, default: "Sports Achievements" },
    subtitle: { type: String, default: "Excellence in Sports" },
    content: { type: String, default: "" },
    achievements: [achievementSchema],
    isActive: { type: Boolean, default: true },
  },
  
  coCurricularAchievements: {
    title: { type: String, default: "Co-Curricular Achievements" },
    subtitle: { type: String, default: "Excellence Beyond Academics" },
    content: { type: String, default: "" },
    achievements: [achievementSchema],
    isActive: { type: Boolean, default: true },
  },
  
  achievers: {
    title: { type: String, default: "Our Achievers" },
    subtitle: { type: String, default: "Celebrating Success" },
    content: { type: String, default: "" },
    achievers: [achieverSchema],
    isActive: { type: Boolean, default: true },
  },
  
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("HomeContent", homeContentSchema);
