const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Configure storage
const storage = multer.diskStorage({
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

// File filter
const fileFilter = (req, file, cb) => {
  // Accept image, video, and PDF files
  const allowedImageTypes = /\.(jpg|jpeg|png|gif|JPG|JPEG|PNG|GIF)$/;
  const allowedVideoTypes = /\.(mp4|webm|MP4|WEBM)$/;
  const allowedPdfTypes = /\.(pdf|PDF)$/;

  // Check if the field is for banner slides, about image, or other image uploads
  if (file.fieldname.includes("bannerSlides") || file.fieldname === "image" || file.fieldname === "coverImage") {
    if (!file.originalname.match(allowedImageTypes)) {
      const errorMsg = "Only JPG, PNG and GIF image files are allowed!";
      req.fileValidationError = errorMsg;
      return cb(null, false);
    }
  } else if (file.fieldname.includes("video")) {
    if (!file.originalname.match(allowedVideoTypes)) {
      const errorMsg = "Only MP4 and WebM video files are allowed!";
      req.fileValidationError = errorMsg;
      return cb(null, false);
    }
  } else if (file.fieldname === "reportFile" || file.fieldname.includes("document")) {
    if (!file.originalname.match(allowedPdfTypes)) {
      const errorMsg = "Only PDF files are allowed for reports and documents!";
      req.fileValidationError = errorMsg;
      return cb(null, false);
    }
  } else {
    if (!file.originalname.match(allowedImageTypes)) {
      req.fileValidationError = "Only JPG, PNG and GIF files are allowed!";
      return cb(new Error("Only JPG, PNG and GIF files are allowed!"), false);
    }
  }
  cb(null, true);
};

// Configure upload middleware
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size for images, videos, and PDFs
  },
  onError: function (err, req, next) {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        req.fileValidationError =
          "File size is too large. Maximum size is 10MB.";
      } else {
        req.fileValidationError = "File upload error: " + err.message;
      }
      return next(null);
    }
    next(err);
  },
});

// Export the configured multer instance
module.exports = upload;
