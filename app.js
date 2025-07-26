require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const mainRoutes = require("./src/routes/mainRoutes");
const academicProgramRoutes = require("./src/routes/academicProgramRoutes");
const academicContentRoutes = require("./src/routes/academicContentRoutes");
const homeContentRoutes = require("./src/routes/homeContentRoutes");
// const adminHomeContentRoutes = require("./src/routes/admin/homeContent");
// const adminAdmissionsRoutes = require("./src/routes/admin/admissions");
const adminRoutes = require("./src/routes/adminRoutes");
const aboutRoutes = require("./src/routes/aboutRoutes");
const activityRoutes = require("./src/routes/activityRoutes");
const admissionRoutes = require("./src/routes/admissionRoutes");
const teacherRoutes = require("./src/routes/teacherRoutes");
const galleryRoutes = require("./src/routes/galleryRoutes");
const contactRoutes = require("./src/routes/contactRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const logoRouter = require("./src/routes/logoRoutes");
const annualReportRoutes = require("./src/routes/annualReportRoutes");
const schoolManagementRoutes = require("./src/routes/schoolManagementRoutes");
const resultSummaryRoutes = require("./src/routes/resultSummaryRoutes");
const newsRoutes = require("./src/routes/newsRoutes");
const principalRoutes = require("./src/routes/principalRoutes");
const cors = require("cors");
const expressLayouts = require("express-ejs-layouts");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const adminViewMiddleware = require("./src/middleware/adminView");
const bookListRoutes = require("./src/routes/bookListRoutes");
const feeStructureRoutes = require("./src/routes/feeStructureRoutes");
const logoMiddleware = require('./src/middleware/logo');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src/views"));
SESSION_SECRET="STALPHONSACHARAMAAAAAAA"
// Session and flash configuration
app.use(
  session({
    secret: SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.use(
  "/uploads",
  express.static(path.join(__dirname, "public", "uploads"), {
    setHeaders: (res, path) => {
      // Add cache-busting headers for uploaded files
      res.set({
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
    },
  })
);
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(cors());
app.use(methodOverride("_method"));
app.use(logoMiddleware);

// Import models after DB connection
const Logo = require("./src/models/Logo");

// Middleware to fetch contact info for all views
const contactMiddleware = require("./src/middleware/contact");
app.use(contactMiddleware);

// Admin layout middleware
app.use("/admin", (req, res, next) => {
  app.set("layout", "layout/admin");
  res.locals.layout = "admin/layouts/admin";
  next();
});

// Admin view middleware
app.use("/admin", adminRoutes); // Register admin routes first
app.use("/admin", bookListRoutes); // Register book list admin routes
app.use("/admin", feeStructureRoutes); // Register fee structure admin routes
app.use("/admin/logo", logoRouter); // Register logo routes under /admin path
app.use("/", annualReportRoutes); // Register annual report routes
app.use("/", schoolManagementRoutes); // Register school management routes
app.use("/", resultSummaryRoutes); // Register result summary routes
app.use("/", newsRoutes); // Register news routes
app.use("/", principalRoutes); // Register principal routes
app.use("/", mainRoutes);
app.use("/about", aboutRoutes);
app.use("/home-content", homeContentRoutes);
app.use("/activities", activityRoutes);
app.use("/admin/activities", activityRoutes);
app.use("/", admissionRoutes);
app.use("/", teacherRoutes);
app.use("/", galleryRoutes);
app.use("/contact", contactRoutes);
app.use("/", documentRoutes);
app.use("/", require("./src/routes/testimonialRoutes"));
//console.log("Line no 127", process.env.MONGO_URI);


// Database connection
const MONGO_URI =
  "mongodb+srv://innovationleetsoft:stalphonsacharama@cluster0.m8br7ym.mongodb.net/stalphonsacharama1?retryWrites=true&w=majority&appName=Cluster0"
mongoose
  .connect(MONGO_URI, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true, // Close sockets after 45s of inactivity
  })
  .then(() => console.log("Connected to MongoDB successfully"))
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    if (err.message.includes("bad auth")) {
      console.error("Authentication failed. Please check your username and password.");
      console.error("Current credentials: innovationleetsoft / StAlphonsa2024!");
    }
    // Don't exit the process, let the app run with database errors
    // process.exit(1);
  });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
