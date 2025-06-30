const express = require("express");
const router = express.Router();
const Admin = require("../models/Admin");
const HomeContent = require("../models/HomeContent");
const About = require("../models/About");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const upload = require("../middleware/fileUpload");
const Student = require("../models/Student");
const Teacher = require("../models/Teacher");
const Course = require("../models/Course");
// const Class = require("../models/");
const Activity = require("../models/Activity");
const AcademicProgram = require("../models/AcademicProgram");
const fs = require("fs");
const adminController = require("../controllers/adminController");
const Transport = require("../models/Transport");

// Create a specific multer configuration for home content updates
const homeContentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "..", "..", "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create a clean filename without fieldname
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const cleanFilename = uniqueSuffix + path.extname(file.originalname);
    cb(null, cleanFilename);
  },
});

const homeContentUpload = multer({
  storage: homeContentStorage,
  fileFilter: function (req, file, cb) {
    // Accept image files only
    const allowedImageTypes = /\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/;
    if (!file.originalname.match(allowedImageTypes)) {
      return cb(new Error("Only JPG, PNG and GIF files are allowed!"), false);
    }
    cb(null, true);
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
}).any();

router.use(cookieParser());
// Login route
router.get("/login", (req, res) => {
  res.render("admin/login", {
    title: "Admin Login",
    error: null,
    username: "",
  });
});

// Admin management routes
router.get(
  "/manage-admins",
  auth,
  roleAuth(["super_admin"]),
  async (req, res) => {
    try {
      const admins = await Admin.find({}).select("-password -tokens");
      res.render("admin/manage-admins", { admins });
    } catch (error) {
      res
        .status(500)
        .render("error", { error: "Error fetching administrators" });
    }
  }
);

router.post(
  "/create-admin",
  auth,
  roleAuth(["super_admin"]),
  async (req, res) => {
    try {
      const { username, email, password, role } = req.body;

      // Check if admin already exists
      const existingAdmin = await Admin.findOne({
        $or: [{ username }, { email }],
      });
      if (existingAdmin) {
        return res
          .status(400)
          .json({ error: "Username or email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 8);
      const admin = new Admin({
        username,
        email,
        password: hashedPassword,
        role,
      });

      await admin.save();
      res.redirect("/admin/manage-admins");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  "/update-admin/:id",
  auth,
  roleAuth(["super_admin"]),
  async (req, res) => {
    try {
      const updates = Object.keys(req.body);
      const allowedUpdates = ["role", "isActive", "email"];
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );

      if (!isValidOperation) {
        return res.status(400).json({ error: "Invalid updates" });
      }

      const admin = await Admin.findById(req.params.id);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }

      updates.forEach((update) => (admin[update] = req.body[update]));
      await admin.save();

      res.redirect("/admin/manage-admins");
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
);

router.post(
  "/delete-admin/:id",
  auth,
  roleAuth(["super_admin"]),
  async (req, res) => {
    try {
      const admin = await Admin.findByIdAndDelete(req.params.id);
      if (!admin) {
        return res.status(404).json({ error: "Admin not found" });
      }
      res.redirect("/admin/manage-admins");
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    // //console.log("=== Admin Login Attempt ===");
    // //console.log("Request body:", req.body);
    // //console.log("Username:", req.body.username);
    // //console.log("Password provided:", req.body.password ? "YES" : "NO");
    
    const { username, password } = req.body;

    if (!username || !password) {
      // //console.log("❌ Missing username or password");
      res.status(400).render("admin/login", {
        error: "Username and password are required",
        username: username,
      });
      return;
    }

    // //console.log("Looking for admin with username:", username);
    const admin = await Admin.findOne({ username });
    // //console.log("Admin found:", !!admin);
    
    if (!admin) {
      // //console.log("❌ Admin not found with username:", username);
      res.status(401).render("admin/login", {
        error: "Invalid username or password",
        username: username,
      });
      return;
    }

    // //console.log("Admin details:", {
      // username: admin.username,
      // email: admin.email,
      // role: admin.role,
      // isActive: admin.isActive,
      // hasPassword: !!admin.password
    // });

    if (!admin.isActive) {
      // //console.log("❌ Admin account is inactive");
      res.status(401).render("admin/login", {
        error: "Account is inactive. Please contact administrator.",
        username: username,
      });
      return;
    }

    // //console.log("Comparing passwords...");
    const passwordMatch = await bcrypt.compare(password, admin.password);
    // //console.log("Password match result:", passwordMatch);
    
    if (!passwordMatch) {
      // //console.log("❌ Password does not match");
      res.status(401).render("admin/login", {
        error: "Invalid username or password",
        username: username,
      });
      return;
    }

    // //console.log("✅ Password matched, generating token...");
    const token = await admin.generateAuthToken();
    // //console.log("Token generated successfully");

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    // //console.log("✅ Login successful, redirecting to dashboard");
    res.redirect("/admin/dashboard");
  } catch (error) {
    console.error("❌ Login error:", error.message);
    console.error("Error stack:", error.stack);
    res.status(500).render("admin/login", {
      error: "Login failed. Please try again.",
      username: req.body.username,
    });
  }
});

// Protected admin dashboard

// Admin management routes
router.get(
  "/manage-admins",
  auth,
  roleAuth("super_admin"),
  async (req, res) => {
    try {
      const admins = await Admin.find({}, "-password -tokens");
      res.render("admin/manage-admins", {
        admins,
        admin: req.admin,
        title: "Manage Administrators",
      });
    } catch (error) {
      console.error("Error fetching admins:", error);
      res.status(500).render("admin/error", {
        error: "Failed to load administrators",
        title: "Error",
      });
    }
  }
);

router.post(
  "/create-admin",
  auth,
  roleAuth("super_admin"),
  async (req, res) => {
    try {
      const { username, password, email, role } = req.body;
      const newAdmin = new Admin({
        username,
        password,
        email,
        role: role || "admin",
      });
      await newAdmin.save();
      res.redirect("/admin/manage-admins");
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).render("admin/error", {
        error: "Failed to create administrator",
        title: "Error",
      });
    }
  }
);

router.post(
  "/update-admin/:id",
  auth,
  roleAuth("super_admin"),
  async (req, res) => {
    try {
      const { role, isActive } = req.body;
      await Admin.findByIdAndUpdate(req.params.id, {
        role,
        isActive: isActive === "true",
      });
      res.redirect("/admin/manage-admins");
    } catch (error) {
      console.error("Error updating admin:", error);
      res.status(500).render("admin/error", {
        error: "Failed to update administrator",
        title: "Error",
      });
    }
  }
);

router.get("/dashboard", auth, async (req, res) => {
  try {
    // Fetch all necessary data in parallel, including About
    const [students, teachers, courses, activities, about] = await Promise.all([
      Student.find({ isActive: true }),
      Teacher.find({ isActive: true }),
      Course.find({ isActive: true }),
      Activity.find().sort({ createdAt: -1 }).limit(5),
      About.findOne() // Fetch the About document
    ]);

    // Prepare the data for the dashboard
    const dashboardData = {
      title: "Admin Dashboard",
      admin: req.admin,
      teachers: teachers,
      programs: courses, // Using courses as programs
      activities: activities,
      about: about, // Pass About document to EJS
      stats: {
        totalStudents: students.length,
        totalTeachers: teachers.length,
        totalCourses: courses.length,
      },
    };

    // Render the dashboard with the data
    res.render("admin/dashboard", dashboardData);
  } catch (error) {
    console.error("Error loading dashboard:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load dashboard data",
      error: error.message,
    });
  }
});

// Contact Management Routes
router.get("/contact/submissions", auth, async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    const contact = await Contact.findOne();
    const submissions = contact ? contact.formSubmissions : [];
    res.render("admin/contact/submissions", {
      submissions,
      admin: req.admin,
      title: "Contact Submissions",
    });
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    res.status(500).send("Server Error");
  }
});

router.get("/contact/manage", auth, async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    const contact = await Contact.findOne();
    res.render("admin/contact/manage", { contact, admin: req.admin });
  } catch (error) {
    console.error("Error fetching contact info:", error);
    res.status(500).send("Server Error");
  }
});

router.post("/contact/update", auth, async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    const {
      address,
      Accounts,
      Transport,
      Reception,
      email,
      latitude,
      longitude,
      socialLinks,
    } = req.body;
    let contact = await Contact.findOne();

    if (contact) {
      contact.address = address;
      contact.Accounts = Accounts;
      contact.Transport = Transport;
      contact.Reception = Reception;
      contact.email = email;
      contact.latitude = parseFloat(latitude) || 0;
      contact.longitude = parseFloat(longitude) || 0;
      contact.socialLinks = {
        facebook: socialLinks?.facebook || "#",
        twitter: socialLinks?.twitter || "#",
        instagram: socialLinks?.instagram || "#",
        linkedin: socialLinks?.linkedin || "#",
      };
    } else {
      contact = new Contact({
        address,
        Accounts,
        Transport,
        Reception,
        email,
        latitude: parseFloat(latitude) || 0,
        longitude: parseFloat(longitude) || 0,
        socialLinks: {
          facebook: socialLinks?.facebook || "#",
          twitter: socialLinks?.twitter || "#",
          instagram: socialLinks?.instagram || "#",
          linkedin: socialLinks?.linkedin || "#",
        },
      });
    }

    await contact.save();
    res.status(200).json({
      message: "Contact information updated successfully",
    });
    res.render("/admin/contact/manage");
  } catch (error) {
    console.error("Error updating contact info:", error);
    res.status(500).json({ error: "Server Error" });
  }
});

// Home content management page
router.get("/home", auth, async (req, res) => {
  try {
    let homeContent = (await HomeContent.findOne()) || new HomeContent({});
    //console.log("Line no 412",homeContent)
    res.render("admin/home/edit", {
      homeContent,
      bannerSlides: homeContent.bannerSlides || [],
      welcomeTitle: homeContent.welcomeTitle || "",
      welcomeContent: homeContent.welcomeContent || "",
      featuredSections: homeContent.featuredSections || [],
      admin: req.admin,
      title: "Home Content Management",
    });
  } catch (error) {
    console.error("Error loading home content:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).render("admin/home/edit", {
      error: "Failed to load home content",
      bannerSlides: [],
      welcomeTitle: "",
      welcomeContent: "",
      featuredSections: [],
      admin: req.admin,
      title: "Home Content Management",
    });
  }
});

router.get("/home/edit", auth, async (req, res) => {
  //console.log("this is home edit page", res)
  try {
    // Set cache-busting headers to prevent 304 responses
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Last-Modified': new Date().toUTCString(),
      'ETag': `"${Date.now()}"`
    });

    // //console.log("=== Loading Home Edit Page ===");
    let homeContent = (await HomeContent.findOne()) || new HomeContent({});
    
    // //console.log("Home content found:", !!homeContent._id);
    // //console.log("Banner slides count:", homeContent.bannerSlides?.length || 0);
    // //console.log("Infrastructure items count:", homeContent.infrastructure?.items?.length || 0);
    // //console.log("Announcements count:", homeContent.recentAnnouncements?.announcements?.length || 0);
    // //console.log("Sports achievements count:", homeContent.sportsAchievements?.achievements?.length || 0);
    // //console.log("Co-curricular achievements count:", homeContent.coCurricularAchievements?.achievements?.length || 0);
    // //console.log("Achievers count:", homeContent.achievers?.achievers?.length || 0);
    
    // Ensure all sections have default values if they don't exist
    if (!homeContent.ourSociety) {
      homeContent.ourSociety = { title: "Our Society", content: "", image: "", isActive: true };
    }
    if (!homeContent.whoWeAre) {
      homeContent.whoWeAre = { title: "Who We Are", content: "", image: "", isActive: true };
    }
    if (!homeContent.infrastructure) {
      homeContent.infrastructure = { title: "Infrastructure", subtitle: "Our Facilities", content: "", items: [], isActive: true };
    }
    if (!homeContent.recentAnnouncements) {
      homeContent.recentAnnouncements = { title: "Recent Announcements", subtitle: "Stay Updated", announcements: [], isActive: true };
    }
    if (!homeContent.sportsAchievements) {
      homeContent.sportsAchievements = { title: "Sports Achievements", subtitle: "Excellence in Sports", content: "", achievements: [], isActive: true };
    }
    if (!homeContent.coCurricularAchievements) {
      homeContent.coCurricularAchievements = { title: "Co-Curricular Achievements", subtitle: "Excellence Beyond Academics", content: "", achievements: [], isActive: true };
    }
    if (!homeContent.achievers) {
      homeContent.achievers = { title: "Our Achievers", subtitle: "Celebrating Success", content: "", achievers: [], isActive: true };
    }
    
    res.render("admin/home/edit", {
      homeContent,
      admin: req.admin,
      title: "Edit Home Content",
    });
  } catch (error) {
    console.error("Error loading home content:", error.message);
    console.error("Stack trace:", error.stack);
    res.status(500).render("admin/home/edit", {
      error:
        "Failed to load home content. Please ensure all required fields are filled and try again.",
      homeContent: existingContent || new HomeContent({
        bannerSlides: req.body.bannerSlides || [],
        welcomeTitle: req.body.welcomeTitle || "",
        welcomeContent: req.body.welcomeContent || "",
        featuredSections: req.body.featuredSections || [],
        history: req.body.history || "",
        ourSociety: req.body.ourSociety || { title: "Our Society", content: "", image: "", isActive: true },
        whoWeAre: req.body.whoWeAre || { title: "Who We Are", content: "", image: "", isActive: true },
        infrastructure: req.body.infrastructure || { title: "Infrastructure", subtitle: "Our Facilities", content: "", items: [], isActive: true },
        recentAnnouncements: req.body.recentAnnouncements || { title: "Recent Announcements", subtitle: "Stay Updated", announcements: [], isActive: true },
        sportsAchievements: req.body.sportsAchievements || { title: "Sports Achievements", subtitle: "Excellence in Sports", content: "", achievements: [], isActive: true },
        coCurricularAchievements: req.body.coCurricularAchievements || { title: "Co-Curricular Achievements", subtitle: "Excellence Beyond Academics", content: "", achievements: [], isActive: true },
        achievers: req.body.achievers || { title: "Our Achievers", subtitle: "Celebrating Success", content: "", achievers: [], isActive: true }
      }),
      admin: req.admin,
      title: "Edit Home Content",
    });
  }
});

// Update home content
router.post(
  "/home/update",
  auth,
  (req, res, next) => {
    // //console.log("This is the Line no 552",req.body)
    homeContentUpload(req, res, (err) => {
      //console.log("this is the line no 556", req.body)
      if (err instanceof multer.MulterError) {
        console.error("Multer error:", err);
        return res.status(400).render("admin/home/edit", {
          error: `File upload error: ${err.message}`,
          homeContent: {
            bannerSlides: [],
            welcomeTitle: req.body.welcomeTitle || "",
            welcomeContent: req.body.welcomeContent || "",
            featuredSections: [],
            history: req.body.history || '',
            ourSociety: { title: "Our Society", content: "", image: "", isActive: true },
            whoWeAre: { title: "Who We Are", content: "", image: "", isActive: true },
            infrastructure: { title: "Infrastructure", subtitle: "Our Facilities", content: "", items: [], isActive: true },
            recentAnnouncements: { title: "Recent Announcements", subtitle: "Stay Updated", announcements: [], isActive: true },
            sportsAchievements: { title: "Sports Achievements", subtitle: "Excellence in Sports", content: "", achievements: [], isActive: true },
            coCurricularAchievements: { title: "Co-Curricular Achievements", subtitle: "Excellence Beyond Academics", content: "", achievements: [], isActive: true },
            achievers: { title: "Our Achievers", subtitle: "Celebrating Success", content: "", achievers: [], isActive: true }
          },
          admin: req.admin,
          title: "Edit Home Content",
        });
      } else if (err) {
        console.error("Other upload error:", err);
        return res.status(400).render("admin/home/edit", {
          error: `Upload error: ${err.message}`,
          homeContent: {
            bannerSlides: [],
            welcomeTitle: req.body.welcomeTitle || "",
            welcomeContent: req.body.welcomeContent || "",
            featuredSections: [],
            history: req.body.history || '',
            ourSociety: { title: "Our Society", content: "", image: "", isActive: true },
            whoWeAre: { title: "Who We Are", content: "", image: "", isActive: true },
            infrastructure: { title: "Infrastructure", subtitle: "Our Facilities", content: "", items: [], isActive: true },
            recentAnnouncements: { title: "Recent Announcements", subtitle: "Stay Updated", announcements: [], isActive: true },
            sportsAchievements: { title: "Sports Achievements", subtitle: "Excellence in Sports", content: "", achievements: [], isActive: true },
            coCurricularAchievements: { title: "Co-Curricular Achievements", subtitle: "Excellence Beyond Academics", content: "", achievements: [], isActive: true },
            achievers: { title: "Our Achievers", subtitle: "Celebrating Success", content: "", achievers: [], isActive: true }
          },
          admin: req.admin,
          title: "Edit Home Content",
        });
      }
      next();
    });
  },
  async (req, res) => {
    try {
      // //console.log("=== Home Content Update Started ===");
      // //console.log("Request body keys:", Object.keys(req.body));
      // //console.log("Uploaded files:", req.files ? Object.keys(req.files) : 'No files');
      
      // Check database connection first
      const mongoose = require('mongoose');
      if (mongoose.connection.readyState !== 1) {
        console.error("Database not connected. ReadyState:", mongoose.connection.readyState);
        throw new Error("Database connection is not available. Please ensure MongoDB is running.");
      }
      
      let homeContent = (await HomeContent.findOne()) || new HomeContent({});
      // //console.log("Existing home content found:", !!homeContent._id);

      // Helper function to parse array-like form data
      const parseArrayData = (prefix) => {
        try {
          const result = [];
          let index = 0;
          
          // Debug: Log all keys that start with the prefix
          const matchingKeys = Object.keys(req.body).filter(key => key.startsWith(prefix));
          // //console.log(`Keys matching ${prefix}:`, matchingKeys);
          
          while (req.body[`${prefix}[${index}][title]`] !== undefined) {
            const item = {};
            Object.keys(req.body).forEach(key => {
              if (key.startsWith(`${prefix}[${index}]`)) {
                const fieldName = key.replace(`${prefix}[${index}][`, '').replace(']', '');
                item[fieldName] = req.body[key];
              }
            });
            result.push(item);
            index++;
          }
          // //console.log(`Parsed ${prefix} data:`, result.length, "items");
          return result;
        } catch (error) {
          console.error(`Error parsing ${prefix} data:`, error);
          return [];
        }
      };

      // Update welcome section
      try {
        homeContent.welcomeTitle = req.body.welcomeTitle || "Welcome to Our School";
        homeContent.welcomeContent = req.body.welcomeContent || "";
        homeContent.history = req.body.history || '';
        // //console.log("Updated welcome section");
      } catch (error) {
        console.error("Error updating welcome section:", error);
      }

      // Update banner slides - Handle both JSON and individual field formats
      try {
        // //console.log("=== Banner Slides Processing ===");
        // //console.log("Uploaded files:", req.files ? req.files.map(f => ({ fieldname: f.fieldname, filename: f.filename })) : 'No files');
        
        const processedSlides = [];
        const bannerSlideFiles = req.files ? req.files.filter(file => file.fieldname.includes('bannerSlides')) : [];
        
        // Try to parse banner slides from JSON first
        let bannerSlidesData = [];
        if (req.body.bannerSlides) {
          try {
            if (typeof req.body.bannerSlides === 'string') {
              bannerSlidesData = JSON.parse(req.body.bannerSlides);
            } else if (Array.isArray(req.body.bannerSlides)) {
              bannerSlidesData = req.body.bannerSlides;
            }
            // //console.log("Banner slides from JSON:", bannerSlidesData.length, "slides");
          } catch (error) {
            // //console.log("Failed to parse banner slides JSON, trying individual fields");
            bannerSlidesData = [];
          }
        }
        
        // If no JSON data, try individual form fields
        if (bannerSlidesData.length === 0) {
          const bannerSlideData = {};
          Object.keys(req.body).forEach(key => {
            const match = key.match(/bannerSlides\[(\d+)\]\[(\w+)\]/);
            if (match) {
              const index = match[1];
              const field = match[2];
              if (!bannerSlideData[index]) bannerSlideData[index] = {};
              bannerSlideData[index][field] = req.body[key];
            }
          });
          
          // Convert individual fields to array format
          Object.keys(bannerSlideData).forEach(index => {
            bannerSlidesData.push(bannerSlideData[index]);
          });
          // //console.log("Banner slides from individual fields:", bannerSlidesData.length, "slides");
        }
        
        // Process each banner slide
        bannerSlidesData.forEach((slideData, index) => {
          // //console.log(`Processing slide ${index}:`, slideData);
          
          // Find the uploaded image for this slide
          const slideImage = bannerSlideFiles.find(file => file.fieldname === `bannerSlides[${index}][image]`);
          
          // Determine image URL - preserve existing image if no new image uploaded
          let imageUrl = '';
          if (slideImage) {
            // New image uploaded
            imageUrl = `/uploads/${slideImage.filename}`;
            // //console.log(`Slide ${index}: New image uploaded - ${imageUrl}`);
          } else if (slideData.imageUrl && slideData.imageUrl.trim() !== '') {
            // Keep existing image - this is the key fix
            imageUrl = slideData.imageUrl;
            // //console.log(`Slide ${index}: Keeping existing image - ${imageUrl}`);
          } else {
            // No image at all
            imageUrl = '';
            // //console.log(`Slide ${index}: No image`);
          }
          
          // Create slide object
          const slide = {
            title: slideData.title || `Banner Slide ${index + 1}`,
            subtitle: slideData.subtitle || '',
            ctaText: slideData.ctaText || '',
            ctaLink: slideData.ctaLink || '',
            imageUrl: imageUrl,
            isActive: slideData.isActive === 'true' || slideData.isActive === 'on' || slideData.isActive === true,
            order: parseInt(slideData.order) || index
          };
          
          // //console.log(`Slide ${index} processed:`, slide);
          processedSlides.push(slide);
        });
        
        // If no slides were processed but files were uploaded, create slides from files
        if (processedSlides.length === 0 && bannerSlideFiles.length > 0) {
          // //console.log("No slide data found, creating slides from uploaded files");
          bannerSlideFiles.forEach((file, index) => {
            const slideIndex = parseInt(file.fieldname.match(/bannerSlides\[(\d+)\]\[image\]/)?.[1] || '0');
            const slide = {
              imageUrl: `/uploads/${file.filename}`,
              title: `Banner Slide ${slideIndex + 1}`,
              subtitle: '',
              ctaText: '',
              ctaLink: '',
              isActive: true,
              order: slideIndex
            };
            processedSlides.push(slide);
            // //console.log(`Created slide from file ${index}:`, slide);
          });
        }
        
        // Only update banner slides if we have processed data or existing slides
        if (processedSlides.length > 0 || homeContent.bannerSlides.length > 0) {
          homeContent.bannerSlides = processedSlides;
          // //console.log("Final banner slides count:", processedSlides.length);
        } else {
          // //console.log("No banner slides data to update, keeping existing slides");
        }
        
      } catch (error) {
        console.error("Error updating banner slides:", error);
        console.error("Error stack:", error.stack);
        // Don't fail the entire save, just log the error
      }

      // Update featured sections
      if (req.body.featuredSections) {
        try {
          let featuredSectionsData;
          
          // Check if it's a JSON string or already an array
          if (typeof req.body.featuredSections === 'string') {
            featuredSectionsData = JSON.parse(req.body.featuredSections);
          } else if (Array.isArray(req.body.featuredSections)) {
            featuredSectionsData = req.body.featuredSections;
          } else {
            featuredSectionsData = [];
          }
          
          homeContent.featuredSections = featuredSectionsData.map(
            (section) => ({
              title: section.title || '',
              content: section.content || '',
              icon: section.icon || '',
              link: section.link || '',
            })
          );
          // //console.log("Updated featured sections:", homeContent.featuredSections.length, "sections");
        } catch (error) {
          console.error("Error updating featured sections:", error);
          homeContent.featuredSections = [];
        }
      }

      // Update Our Society section
      try {
        if (req.body.ourSociety) {
          const ourSocietyImage = req.files ? req.files.find(file => file.fieldname === 'ourSociety[image]') : null;
          
          homeContent.ourSociety = {
            title: req.body.ourSociety.title || 'Our Society',
            content: req.body.ourSociety.content || '',
            image: ourSocietyImage ? `/uploads/${ourSocietyImage.filename}` : cleanImageUrl(req.body.ourSociety.imageUrl || ''),
            isActive: req.body.ourSociety.isActive === 'true' || req.body.ourSociety.isActive === 'on'
          };
          // //console.log("Updated Our Society section");
        }
      } catch (error) {
        console.error("Error updating Our Society section:", error);
      }

      // Update Who We Are section
      try {
        if (req.body.whoWeAre) {
          const whoWeAreImage = req.files ? req.files.find(file => file.fieldname === 'whoWeAre[image]') : null;
          
          homeContent.whoWeAre = {
            title: req.body.whoWeAre.title || 'Who We Are',
            content: req.body.whoWeAre.content || '',
            image: whoWeAreImage ? `/uploads/${whoWeAreImage.filename}` : cleanImageUrl(req.body.whoWeAre.imageUrl || ''),
            isActive: req.body.whoWeAre.isActive === 'true' || req.body.whoWeAre.isActive === 'on'
          };
          // //console.log("Updated Who We Are section");
        }
      } catch (error) {
        console.error("Error updating Who We Are section:", error);
      }

      // Update Infrastructure section
      try {
        if (req.body.infrastructure) {
          const infrastructureItems = [];
          const infrastructureData = parseArrayData('infrastructure[items]');
          
          if (infrastructureData.length > 0) {
            for (let i = 0; i < infrastructureData.length; i++) {
              const item = infrastructureData[i];
              const itemImage = req.files ? req.files.find(file => file.fieldname === `infrastructure[items][${i}][image]`) : null;
              
              // Determine image URL - preserve existing image if no new image uploaded
              let imageUrl = '';
              if (itemImage) {
                // New image uploaded
                imageUrl = `/uploads/${itemImage.filename}`;
              } else if (item.existingImage && item.existingImage.trim() !== '') {
                // Keep existing image
                imageUrl = item.existingImage;
              } else if (item.image && item.image.trim() !== '') {
                // Keep existing image from image field
                imageUrl = item.image;
              }
              
              infrastructureItems.push({
                title: item.title,
                description: item.description,
                icon: item.icon || '',
                image: imageUrl,
                order: parseInt(item.order) || i,
                isActive: item.isActive === 'true' || item.isActive === 'on'
              });
            }
          }
          
          homeContent.infrastructure = {
            title: req.body.infrastructure.title || 'Infrastructure',
            subtitle: req.body.infrastructure.subtitle || 'Our Facilities',
            content: req.body.infrastructure.content || '',
            items: infrastructureItems,
            isActive: req.body.infrastructure.isActive === 'true' || req.body.infrastructure.isActive === 'on'
          };
          // //console.log("Updated Infrastructure section:", infrastructureItems.length, "items");
        }
      } catch (error) {
        console.error("Error updating Infrastructure section:", error);
      }

      // Update Recent Announcements section
      try {
        if (req.body.recentAnnouncements) {
          const announcements = [];
          const announcementsData = parseArrayData('recentAnnouncements[announcements]');
          
          if (announcementsData.length > 0) {
            for (let i = 0; i < announcementsData.length; i++) {
              const announcement = announcementsData[i];
              
              announcements.push({
                title: announcement.title,
                content: announcement.content,
                date: announcement.date ? new Date(announcement.date) : new Date(),
                isActive: announcement.isActive === 'true' || announcement.isActive === 'on'
              });
            }
          }
          
          homeContent.recentAnnouncements = {
            title: req.body.recentAnnouncements.title || 'Recent Announcements',
            subtitle: req.body.recentAnnouncements.subtitle || 'Stay Updated',
            announcements: announcements,
            isActive: req.body.recentAnnouncements.isActive === 'true' || req.body.recentAnnouncements.isActive === 'on'
          };
          // //console.log("Updated Recent Announcements section:", announcements.length, "announcements");
        }
      } catch (error) {
        console.error("Error updating Recent Announcements section:", error);
      }

      // Update Sports Achievements section
      try {
        if (req.body.sportsAchievements) {
          const achievements = [];
          const achievementsData = parseArrayData('sportsAchievements[achievements]');
          
          if (achievementsData.length > 0) {
            for (let i = 0; i < achievementsData.length; i++) {
              const achievement = achievementsData[i];
              const achievementImage = req.files ? req.files.find(file => file.fieldname === `sportsAchievements[achievements][${i}][image]`) : null;
              
              // Determine image URL - preserve existing image if no new image uploaded
              let imageUrl = '';
              if (achievementImage) {
                // New image uploaded
                imageUrl = `/uploads/${achievementImage.filename}`;
              } else if (achievement.existingImage && achievement.existingImage.trim() !== '') {
                // Keep existing image
                imageUrl = achievement.existingImage;
              } else if (achievement.image && achievement.image.trim() !== '') {
                // Keep existing image from image field
                imageUrl = achievement.image;
              }
              
              achievements.push({
                title: achievement.title,
                description: achievement.description,
                category: achievement.category || 'sports',
                date: achievement.date ? new Date(achievement.date) : new Date(),
                image: imageUrl,
                isActive: achievement.isActive === 'true' || achievement.isActive === 'on'
              });
            }
          }
          
          homeContent.sportsAchievements = {
            title: req.body.sportsAchievements.title || 'Sports Achievements',
            subtitle: req.body.sportsAchievements.subtitle || 'Excellence in Sports',
            content: req.body.sportsAchievements.content || '',
            achievements: achievements,
            isActive: req.body.sportsAchievements.isActive === 'true' || req.body.sportsAchievements.isActive === 'on'
          };
          // //console.log("Updated Sports Achievements section:", achievements.length, "achievements");
        }
      } catch (error) {
        console.error("Error updating Sports Achievements section:", error);
      }

      // Update Co-Curricular Achievements section
      try {
        if (req.body.coCurricularAchievements) {
          const achievements = [];
          const achievementsData = parseArrayData('coCurricularAchievements[achievements]');
          
          if (achievementsData.length > 0) {
            for (let i = 0; i < achievementsData.length; i++) {
              const achievement = achievementsData[i];
              const achievementImage = req.files ? req.files.find(file => file.fieldname === `coCurricularAchievements[achievements][${i}][image]`) : null;
              
              // Determine image URL - preserve existing image if no new image uploaded
              let imageUrl = '';
              if (achievementImage) {
                // New image uploaded
                imageUrl = `/uploads/${achievementImage.filename}`;
              } else if (achievement.existingImage && achievement.existingImage.trim() !== '') {
                // Keep existing image
                imageUrl = achievement.existingImage;
              } else if (achievement.image && achievement.image.trim() !== '') {
                // Keep existing image from image field
                imageUrl = achievement.image;
              }
              
              achievements.push({
                title: achievement.title,
                description: achievement.description,
                category: achievement.category || 'cultural',
                date: achievement.date ? new Date(achievement.date) : new Date(),
                image: imageUrl,
                isActive: achievement.isActive === 'true' || achievement.isActive === 'on'
              });
            }
          }
          
          homeContent.coCurricularAchievements = {
            title: req.body.coCurricularAchievements.title || 'Co-Curricular Achievements',
            subtitle: req.body.coCurricularAchievements.subtitle || 'Excellence Beyond Academics',
            content: req.body.coCurricularAchievements.content || '',
            achievements: achievements,
            isActive: req.body.coCurricularAchievements.isActive === 'true' || req.body.coCurricularAchievements.isActive === 'on'
          };
          // //console.log("Updated Co-Curricular Achievements section:", achievements.length, "achievements");
        }
      } catch (error) {
        console.error("Error updating Co-Curricular Achievements section:", error);
      }

      // Update Achievers section
      try {
        if (req.body.achievers) {
          const achievers = [];
          const achieversData = parseArrayData('achievers[achievers]');
          
          if (achieversData.length > 0) {
            for (let i = 0; i < achieversData.length; i++) {
              const achiever = achieversData[i];
              const achieverImage = req.files ? req.files.find(file => file.fieldname === `achievers[achievers][${i}][image]`) : null;
              
              // Determine image URL - preserve existing image if no new image uploaded
              let imageUrl = '';
              if (achieverImage) {
                // New image uploaded
                imageUrl = `/uploads/${achieverImage.filename}`;
              } else if (achiever.existingImage && achiever.existingImage.trim() !== '') {
                // Keep existing image
                imageUrl = achiever.existingImage;
              } else if (achiever.image && achiever.image.trim() !== '') {
                // Keep existing image from image field
                imageUrl = achiever.image;
              }
              
              achievers.push({
                name: achiever.name,
                achievement: achiever.achievement,
                category: achiever.category || 'student',
                year: achiever.year || '',
                image: imageUrl,
                order: parseInt(achiever.order) || i,
                isActive: achiever.isActive === 'true' || achiever.isActive === 'on'
              });
            }
          }
          
          homeContent.achievers = {
            title: req.body.achievers.title || 'Our Achievers',
            subtitle: req.body.achievers.subtitle || 'Celebrating Success',
            content: req.body.achievers.content || '',
            achievers: achievers,
            isActive: req.body.achievers.isActive === 'true' || req.body.achievers.isActive === 'on'
          };
          // //console.log("Updated Achievers section:", achievers.length, "achievers");
        }
      } catch (error) {
        console.error("Error updating Achievers section:", error);
      }

      await homeContent.save();
      res.redirect("/admin/home/edit");
    } catch (error) {
      console.error("Error updating home content:", error.message);
      console.error("Stack trace:", error.stack);

      // Attempt to retrieve existing content as fallback
      let existingContent;
      try {
        existingContent = await HomeContent.findOne();
      } catch (err) {
        existingContent = null;
      }

      res.status(500).render("admin/home/edit", {
        error:
          "Failed to update home content. Please ensure all required fields are filled and try again.",
        homeContent: existingContent || new HomeContent({
          bannerSlides: req.body.bannerSlides || [],
          welcomeTitle: req.body.welcomeTitle || "",
          welcomeContent: req.body.welcomeContent || "",
          featuredSections: req.body.featuredSections || [],
          history: req.body.history || "",
          ourSociety: req.body.ourSociety || { title: "Our Society", content: "", image: "", isActive: true },
          whoWeAre: req.body.whoWeAre || { title: "Who We Are", content: "", image: "", isActive: true },
          infrastructure: req.body.infrastructure || { title: "Infrastructure", subtitle: "Our Facilities", content: "", items: [], isActive: true },
          recentAnnouncements: req.body.recentAnnouncements || { title: "Recent Announcements", subtitle: "Stay Updated", announcements: [], isActive: true },
          sportsAchievements: req.body.sportsAchievements || { title: "Sports Achievements", subtitle: "Excellence in Sports", content: "", achievements: [], isActive: true },
          coCurricularAchievements: req.body.coCurricularAchievements || { title: "Co-Curricular Achievements", subtitle: "Excellence Beyond Academics", content: "", achievements: [], isActive: true },
          achievers: req.body.achievers || { title: "Our Achievers", subtitle: "Celebrating Success", content: "", achievers: [], isActive: true }
        }),
        admin: req.admin,
        title: "Edit Home Content",
      });
    }
  }
);

// Reset home content (clear all data)
router.post("/home/reset", auth, async (req, res) => {
  try {
    // Delete all existing HomeContent documents
    await HomeContent.deleteMany({});
    
    // Create a fresh HomeContent document
    const newHomeContent = new HomeContent({
      welcomeTitle: "Welcome to Our School",
      welcomeContent: "Welcome to our school website. We are committed to providing quality education.",
      bannerSlides: [],
      featuredSections: [],
      history: "",
      ourSociety: {
        title: "Our Society",
        content: "",
        image: "",
        isActive: true
      },
      whoWeAre: {
        title: "Who We Are",
        content: "",
        image: "",
        isActive: true
      },
      infrastructure: {
        title: "Infrastructure",
        subtitle: "Our Facilities",
        content: "",
        items: [],
        isActive: true
      },
      recentAnnouncements: {
        title: "Recent Announcements",
        subtitle: "Stay Updated",
        announcements: [],
        isActive: true
      },
      sportsAchievements: {
        title: "Sports Achievements",
        subtitle: "Excellence in Sports",
        content: "",
        achievements: [],
        isActive: true
      },
      coCurricularAchievements: {
        title: "Co-Curricular Achievements",
        subtitle: "Excellence Beyond Academics",
        content: "",
        achievements: [],
        isActive: true
      },
      achievers: {
        title: "Our Achievers",
        subtitle: "Celebrating Success",
        content: "",
        achievers: [],
        isActive: true
      }
    });
    
    await newHomeContent.save();
    res.redirect("/admin/home/edit?reset=success");
  } catch (error) {
    console.error("Error resetting home content:", error);
    res.redirect("/admin/home/edit?reset=error");
  }
});

// About page management routes
router.get("/about", auth, async (req, res) => {
  try {
    const about = await About.findOne();
    res.render("admin/about/edit", {
      missionTitle: about?.missionTitle || "",
      missionContent: about?.mission || "",
      visionTitle: about?.visionTitle || "",
      visionContent: about?.vision || "",
      historyTitle: about?.historyTitle || "",
      historyContent: about?.history || "",
      admin: req.admin,
      image: about.image || "",
      title: "About Content Management",
    });
  } catch (error) {
    console.error("Error loading about content:", error);
    res.status(500).render("admin/about/edit", {
      error: "Failed to load about content",
      image,
      missionTitle: "",
      missionContent: "",
      visionTitle: "",
      visionContent: "",
      historyTitle: "",
      historyContent: "",
      admin: req.admin,
      title: "About Content Management",
    });
  }
});

// Add the edit route handler
router.get("/about/edit", auth, async (req, res) => {
  try {
    // Set headers to prevent caching
    res.set({
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });

    // Find existing about document
    const about = await About.findOne();

    // If no document exists, create one with default values
    if (!about) {
      const defaultAbout = new About({
        missionTitle: "Our Mission",
        mission: "",
        visionTitle: "Our Vision",
        vision: "",
        historyTitle: "Our Inspiration",
        history: "",
        image: "",
      });
      await defaultAbout.save();
      return res.render("admin/about/edit", {
        about: defaultAbout,
        missionTitle: defaultAbout.missionTitle,
        missionContent: defaultAbout.mission,
        visionTitle: defaultAbout.visionTitle,
        visionContent: defaultAbout.vision,
        historyTitle: defaultAbout.historyTitle,
        historyContent: defaultAbout.history,
        image: defaultAbout.image,
      });
    }

    // Prepare the data to pass to the template
    const templateData = {
      about,
      missionTitle: about.missionTitle,
      missionContent: about.mission,
      visionTitle: about.visionTitle,
      visionContent: about.vision,
      historyTitle: about.historyTitle,
      historyContent: about.history,
      image: about.image || null,
      admin: req.admin,
      title: "Edit About Content",
    };

    // Only add image if it exists
    if (about.image) {
      templateData.image = about.image;
    }

    // Render the edit page with existing content
    res.render("admin/about/edit", templateData);
  } catch (error) {
    console.error("Error rendering about edit page:", error);
    res.status(500).json({
      error: "Failed to load about edit page",
      message: "Please try again later",
    });
  }
});

// Add the update route handler
router.post("/about/update", auth, upload.single("image"), async (req, res) => {
  try {
    const {
      missionTitle,
      missionContent,
      visionTitle,
      visionContent,
      historyTitle,
      historyContent,
    } = req.body;

    // Create update data object with default values if fields are empty
    const updateData = {
      missionTitle: missionTitle || "Our Mission",
      mission: missionContent || "",
      visionTitle: visionTitle || "Our Vision",
      vision: visionContent || "",
      historyTitle: historyTitle || "Our Inspiration",
      history: historyContent || "",
    };

    // Handle file upload
    if (req.file) {
      if (!req.file.mimetype.startsWith("image/")) {
        return res.status(400).json({
          error: "Please upload a valid image file (JPG, PNG, GIF)",
          message: "Invalid file type",
        });
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    // Find existing about document or create new one
    let about = await About.findOne();
    if (!about) {
      about = new About(updateData);
    } else {
      Object.assign(about, updateData);
    }

    // Save the document
    await about.save();

    // Send success response
    res.status(200).json({
      success: true,
      message: "About content updated successfully",
    });
  } catch (error) {
    console.error("Error updating about content:", error);
    res.status(500).json({
      error: "Failed to update about content",
      message: "Please try again later",
    });
  }
});

// Academics Management Routes

router.get("/academics", auth, async (req, res) => {
  try {
    // Fetch all academic programs
    const programs = await AcademicProgram.find().sort({ createdAt: -1 });

    // Pass success and error from query params or null
    const success = req.query.success || null;
    const error = req.query.error || null;

    // Render the page with programs and messages
    res.render("admin/academics/index", {
      programs,
      success,
      error,
      admin: req.admin,
      title: "Academic Programs Management",
    });
  } catch (error) {
    console.error("Error loading academic programs:", error);
    res.status(500).render("admin/academics/index", {
      programs: [],
      error: "Failed to load academic programs",
      admin: req.admin,
      title: "Academic Programs Management",
    });
  }
});

// Delete program route
router.delete("/academics/delete/:id", auth, async (req, res) => {
  try {
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) {
      return res
        .status(404)
        .json({ success: false, error: "Program not found" });
    }

    // Delete the program's image if it exists
    if (program.image) {
      const imagePath = path.join(__dirname, "..", "public", program.image);
      try {
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (err) {
        console.error("Error deleting program image:", err);
      }
    }

    await program.deleteOne();
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting program:", error);
    res.status(500).json({ success: false, error: "Error deleting program" });
  }
});

router.post(
  "/admin/academics/update-main",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description } = req.body;
      let mainContent = await AcademicProgram.findOne({ isMainContent: true });

      if (!mainContent) {
        mainContent = new AcademicProgram({
          title,
          description,
          isMainContent: true,
        });
      } else {
        mainContent.title = title;
        mainContent.description = description;
      }

      // Handle image upload
      if (req.file) {
        // Delete old image if exists
        if (mainContent.image) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            mainContent.image
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
        mainContent.image = `/uploads/${req.file.filename}`;
      }

      await mainContent.save();
      res.send("success", "Academic content updated successfully");
      return res.redirect("/admin/academics");
    } catch (error) {
      console.error("Error updating academic content:", error);
      res.send("error", "Error updating academic content");
      return res.redirect("/admin/academics");
    }
  }
);

// Edit program route

router.get("/academics/edit/:id", auth, async (req, res) => {
  try {
    const program = await AcademicProgram.findById(req.params.id);
    if (!program) {
      // Redirect with error query param
      return res.redirect("/admin/academics?error=Academic program not found");
    }

    // Pass success and error from query params or null
    const success = req.query.success || null;
    const error = req.query.error || null;

    res.render("admin/academics/edit", {
      program,
      success,
      error,
      admin: req.admin,
      title: "Edit Academic Program",
    });
  } catch (error) {
    console.error("Error loading program for edit:", error);
    return res.redirect(
      "/admin/academics?error=Error loading academic program"
    );
  }
});

// Update program
// Update program
router.post(
  "/academics/edit/:id",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {

      const { title, description, duration, requirements, curriculum, level } =
        req.body;

      // Find the academic program by ID
      const academicProgram = await AcademicProgram.findById(req.params.id);
      if (!academicProgram) {
        return res.status(404).json({
          success: false,
          error: "Academic program not found",
        });
      }

      // Handle image upload
      if (req.file) {
        // Validate file type
        if (!req.file.mimetype.startsWith("image/")) {
          return res.status(400).json({
            success: false,
            error: "Please upload a valid image file",
          });
        }

        // Validate file size (2MB limit)
        if (req.file.size > 2 * 1024 * 1024) {
          return res.status(400).json({
            success: false,
            error: "Image file size should be less than 2MB",
          });
        }

        // Delete old image if it exists
        if (academicProgram.image) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            academicProgram.image
          );
          try {
            if (fs.existsSync(oldImagePath)) {
              fs.unlinkSync(oldImagePath);
            }
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }

        academicProgram.image = `/uploads/${req.file.filename}`;
      }

      // Update fields
      academicProgram.title = title || academicProgram.title;
      academicProgram.description = description || academicProgram.description;
      academicProgram.duration = duration || academicProgram.duration;
      academicProgram.level = level || academicProgram.level;
      academicProgram.requirements =
        requirements || academicProgram.requirements;
      academicProgram.curriculum = curriculum || academicProgram.curriculum;
      academicProgram.isActive = req.body.isActive === "on";
      academicProgram.updatedAt = new Date();

      // Save the updated document
      await academicProgram.save();
      return res.redirect("/admin/academics");
    } catch (error) {
      console.error("Error updating academic program:", error);
      res.redirect(`/admin/academics/index`);
      return res.status(500).render("admin/academics", {
        success: false,
        error: "Failed to update program",
        message: error.message,
      });
    }
    return res.redirect("/admin/academics");
  }
);

// Add new program form route

router.get("/academics/add", auth, (req, res) => {
  // Pass success and error from query params or null
  const success = req.query.success || null;
  const error = req.query.error || null;

  res.render("admin/academics/add", {
    title: "Add Academic Program",
    success,
    error,
    admin: req.admin,
  });
});

// Add new program submission route
router.post(
  "/academics/add",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const {
        title,
        description,
        duration,
        level,
        requirements,
        curriculum,
        isActive,
      } = req.body;

      // Input validation
      if (!title || !description || !duration || !level) {
        res.send(
          "error",
          "Title, description, duration and level are required"
        );
        return res.redirect("/admin/academics/add");
      }

      // Create new program
      const newProgram = new AcademicProgram({
        title: title.trim(),
        description: description.trim(),
        duration: duration.trim(),
        level: level.trim(),
        requirements: requirements ? requirements.trim() : "",
        curriculum: curriculum ? curriculum.trim() : "",
        isActive: isActive === "on",
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Handle image upload
      if (req.file) {
        newProgram.image = `/uploads/${req.file.filename}`;
      }

      // Save the program
      await newProgram.save();

      res.send("success", "Academic program added successfully");
      return res.redirect("/admin/academics");
    } catch (error) {
      console.error("Error adding program:", error);
      res.send("error", error.message || "Error adding academic program");
      return res.redirect("/admin/academics/add");
    }
  }
);

router.get("/academics/sections", auth, async (req, res) => {
  try {
    const Content = require("../models/content");

    // Find all academic sections
    const sections = await Content.find({
      page: "academics",
      isActive: true,
    }).sort({ order: 1 });

    // Log for debugging


    // Get the content for each section
    // const content = {
    //   excellence: sections.find((s) => s.title === "Academic Excellence") || {},
    //   support: sections.find((s) => s.title === "Student Support") || {},
    //   research:
    //     sections.find((s) => s.title === "Research Opportunities") || {},
    // };

    // Pass success and error from query params or null
    const success = req.query.success || null;
    const error = req.query.error || null;

    return res.render("admin/academics/sections", {
      sections,
      title: "Manage Academic Sections",
      success,
      error,
    });
  } catch (error) {
    console.error("Error loading academic sections:", error);
    // Redirect with error query param
    return res.redirect(
      "/admin/academics?error=Error loading academic sections"
    );
  }
});

// Update individual section content

router.post(
  "/academics/sections/update",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const Content = require("../models/content");
      const { title, description, order } = req.body;

      let section = await Content.findOne({ page: "academics", order });

      if (!section) {
        section = new Content({
          page: "academics",
          title,
          description,
          order,
          isActive: true,
        });
      } else {
        section.title = title;
        section.description = description;
      }

      // Handle new image
      if (req.file) {
        // Delete old image if exists
        if (section.image) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            section.image
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }

        // Save new image path
        section.image = `/uploads/${req.file.filename}`;
      }

      await section.save();

      // Redirect after successful save
      return res.redirect("/admin/academics/sections");
    } catch (error) {
      console.error("Error updating academic section:", error);

      // Redirect with error (optionally flash or query param)
      return res.redirect("/admin/academics/sections");
    }
  }
);
// Update academic programs
router.post("/admin/academics/update/programs", auth, async (req, res) => {
  try {
    const { programs } = req.body;
    let parsedPrograms;

    try {
      parsedPrograms =
        typeof programs === "string" ? JSON.parse(programs) : programs;
      if (!Array.isArray(parsedPrograms)) {
        parsedPrograms = [parsedPrograms];
      }

      parsedPrograms = parsedPrograms
        .filter((program) => program && typeof program === "object")
        .map((program) => ({
          title: program.title?.trim() || "",
          description: program.description?.trim() || "",
          duration: program.duration?.trim() || "",
          requirements: program.requirements?.trim() || "",
          curriculum: program.curriculum?.trim() || "",
        }))
        .filter((program) =>
          Object.values(program).some((value) => value !== "")
        );
    } catch (error) {
      console.error("Error parsing programs data:", error);
      res.send("error", "Invalid programs data format");
      return res.redirect("/admin/academics/edit");
    }

    let academic = await Content.findOne();
    if (!academic) {
      academic = new Content();
    }

    academicProgram = parsedPrograms;
    academic.updatedAt = new Date();
    await academic.save();

    return res.json({
      success: true,
      message: "Academic programs updated successfully",
      redirect: "/admin/academics",
    });
  } catch (error) {
    console.error("Error updating academic programs:", error);
    res.send("error", "Failed to update academic programs");
    return res.redirect("/admin/academics/edit");
  }
});

// Delete academic content
router.delete("/admin/academics/:id", auth, async (req, res) => {
  try {
    await Content.findByIdAndDelete(req.params.id);
    res.redirect("/admin/academics");
  } catch (error) {
    console.error("Error deleting academic content:", error);
    res.status(500).json({ error: "Error deleting academic content" });
  }
});

// Activities Routes
router.get("/activities", auth, async (req, res) => {
  try {
    const activities = await Activity.find().sort({ createdAt: -1 });

    res.render("admin/activities/index", {
      // title: activity?.title || "",
      // description: activity?.description || "",
      // image: activity?.image || "",
      // activities: activity?.activities || [],
      activities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({
      success: false,
      message: "Error loading activities page",
      error: error.message,
    });
  }
});

router.post("/activities/update", upload.single("image"), async (req, res) => {

  try {
    // Validate required fields
    if (!req.body.title || !req.body.description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required",
      });
    }

    const updateData = {
      title: req.body.title,
      description: req.body.description,
      activities: [],
    };

    // Parse and validate activities data
    if (req.body.activities) {
      let activities;
      try {
        activities =
          typeof req.body.activities === "string"
            ? JSON.parse(req.body.activities)
            : req.body.activities;

        if (!Array.isArray(activities)) {
          return res.status(400).json({
            success: false,
            message: "Activities must be an array",
          });
        }

        // Validate each activity
        const invalidActivities = activities.filter(
          (activity) =>
            !activity.title ||
            !activity.description ||
            !activity.schedule ||
            !activity.location ||
            !activity.participants
        );

        if (invalidActivities.length > 0) {
          return res.status(400).json({
            success: false,
            message:
              "All activities must have title, description, schedule, location, and participants",
          });
        }

        updateData.activities = activities;
      } catch (error) {
        console.error("Error parsing activities:", error);
        return res.status(400).json({
          success: false,
          message: "Invalid activities data format",
        });
      }
    }
    res.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching activity",
      error: error.message,
    });
  }
});

// Create new activity
router.post("/activities", auth, upload.single("image"), async (req, res) => {
  try {
    const { title, description, category, schedule, location, participants } =
      req.body;

    const activity = new Activity({
      title,
      description,
      category,
      schedule,
      location,
      participants,
      isActive: true,
    });

    if (req.file) {
      activity.image = `/uploads/${req.file.filename}`;
    }

    await activity.save();
    res.json({
      success: true,
      message: "Activity created successfully",
      activity,
    });
  } catch (error) {
    console.error("Error creating activity:", error);
    res.status(500).json({
      success: false,
      message: "Error creating activity",
      error: error.message,
    });
  }
});

// Update activity
router.post(
  "/activities/update/:id",
  auth,
  upload.single("image"),
  async (req, res) => {
    try {
      const { title, description, category, schedule, location, participants } =
        req.body;

      const activity = await Activity.findById(req.params.id);
      if (!activity) {
        return res.status(404).json({
          success: false,
          message: "Activity not found",
        });
      }

      // Update fields
      activity.title = title;
      activity.description = description;
      activity.category = category;
      activity.schedule = schedule;
      activity.location = location;
      activity.participants = participants;

      // Handle image upload
      if (req.file) {
        // Delete old image if exists
        if (activity.image) {
          const oldImagePath = path.join(
            __dirname,
            "..",
            "public",
            activity.image
          );
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        activity.image = `/uploads/${req.file.filename}`;
      }

      await activity.save();
      res.json({
        success: true,
        message: "Activity updated successfully",
        activity,
      });
    } catch (error) {
      console.error("Error updating activity:", error);
      res.status(500).json({
        success: false,
        message: "Error updating activity",
        error: error.message,
      });
    }
  }
);

// Delete activity
router.delete("/activities/:id", auth, async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id);
    if (!activity) {
      return res.status(404).json({
        success: false,
        message: "Activity not found",
      });
    }

    // Delete the activity image if it exists
    if (activity.image) {
      const imagePath = path.join(__dirname, "..", "public", activity.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await activity.deleteOne();
    res.json({
      success: true,
      message: "Activity deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting activity",
      error: error.message,
    });
  }
});

// Logout route
router.get("/logout", auth, async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter(
      (token) => token.token !== req.token
    );
    await req.admin.save();
    res.clearCookie("token");
    res.redirect("/admin/login");
  } catch (error) {
    res.status(500).send();
  }
});

router.post(
  "/grant-admin-access/:teacherId",
  auth,
  roleAuth(["super_admin"]),
  adminController.grantAdminAccess
);

// Transport Management Routes
// router.get("/transport/index", auth, async (req, res) => {
//   try {
//     const Contact = require("../models/Contact");
//     const contact = await Contact.findOne();
//     res.render("admin/transport/manage", {
//       transport: contact?.Transport || "",
//       admin: req.admin,
//       title: "Manage Transport",
//     });
//   } catch (error) {
//     res.status(500).send("Server Error");
//   }
// });

router.post("/transport/update", auth, async (req, res) => {
  try {
    const Contact = require("../models/Contact");
    let contact = await Contact.findOne();
    if (!contact) contact = new Contact();
    contact.Transport = req.body.Transport;
    await contact.save();
    res.redirect("/admin/transport/manage");
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

// Admin Transport Management
router.get("/transport", auth, async (req, res) => {
  try {
    const transports = await Transport.find();
    res.render("admin/transport/index", {
      transports,
      admin: req.admin,
      title: "Manage Transport",
      error: null
    });
  } catch (error) {
    res.status(500).render("admin/transport/index", {
      transports: [],
      admin: req.admin,
      title: "Manage Transport",
      error: "Failed to load transport info.",
    });
  }
});

// Add the index route for consistency with other admin sections
router.get("/transport/index", auth, async (req, res) => {
  try {
    const transports = await Transport.find();
    res.render("admin/transport/index", {
      transports,
      admin: req.admin,
      title: "Manage Transport",
      error: null
    });
  } catch (error) {
    res.status(500).render("admin/transport/index", {
      transports: [],
      admin: req.admin,
      title: "Manage Transport",
      error: "Failed to load transport info.",
    });
  }
});

router.get("/transport/add", auth, (req, res) => {
  res.render("admin/transport/add", {
    admin: req.admin,
    title: "Add Transport",
    error: null
  });
});

router.post(
  "/transport/add",
  auth,
  upload.single("vehicleImage"),
  async (req, res) => {
    try {
      const { rules, time, driverName, driverPhone, route } = req.body;
      const vehicleImage = req.file ? `/uploads/${req.file.filename}` : "";
      
      const transport = new Transport({
        vehicleImage,
        rules,
        time,
        driverName,
        driverPhone,
        route
      });
      
      await transport.save();
      res.redirect("/admin/transport");
    } catch (error) {
      console.error("Error adding transport:", error);
      res.status(500).render("admin/transport/add", {
        admin: req.admin,
        title: "Add Transport",
        error: "Failed to add transport: " + error.message,
      });
    }
  }
);

router.get("/transport/edit/:id", auth, async (req, res) => {
  try {
    const transport = await Transport.findById(req.params.id);
    if (!transport) return res.redirect("/admin/transport");
    res.render("admin/transport/edit", {
      transport,
      admin: req.admin,
      title: "Edit Transport",
    });
  } catch (error) {
    res.redirect("/admin/transport");
  }
});

router.post(
  "/transport/edit/:id",
  auth,
  upload.single("vehicleImage"),
  async (req, res) => {
    try {
      const { rules, time, driverName, driverPhone, route } = req.body;
      const transport = await Transport.findById(req.params.id);
      if (!transport) return res.redirect("/admin/transport");
      
      if (req.file) transport.vehicleImage = `/uploads/${req.file.filename}`;
      transport.rules = rules;
      transport.time = time;
      transport.driverName = driverName;
      transport.driverPhone = driverPhone;
      transport.route = route;
      
      await transport.save();
      res.redirect("/admin/transport");
    } catch (error) {
      console.error("Error updating transport:", error);
      res.redirect("/admin/transport");
    }
  }
);

router.post("/transport/delete/:id", auth, async (req, res) => {
  try {
    await Transport.findByIdAndDelete(req.params.id);
    res.redirect("/admin/transport");
  } catch (error) {
    res.redirect("/admin/transport");
  }
});

// Helper function to clean up invalid image URLs
const cleanImageUrl = (imageUrl) => {
  if (!imageUrl) return '';
  // Remove any URLs that contain invalid characters (like fieldnames)
  if (imageUrl.includes('[') || imageUrl.includes(']')) {
    // //console.log(`Cleaning problematic URL: ${imageUrl}`);
    // Extract file extension and create a new clean filename
    const fileExtension = imageUrl.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const newFilename = `${timestamp}-${random}.${fileExtension}`;
    const newUrl = `/uploads/${newFilename}`;
    // //console.log(`New clean URL: ${newUrl}`);
    return newUrl;
  }
  return imageUrl;
};

module.exports = router;
