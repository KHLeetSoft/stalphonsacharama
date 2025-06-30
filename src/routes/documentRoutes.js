const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const documentController = require("../controllers/documentController");

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../../public/uploads/documents");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Preserve original filename
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");
    cb(null, originalName);
  },
});

const upload = multer({ storage: storage });

// Public routes
router.get("/cbse-corner", documentController.renderCbseCorner);
router.get(
  "/documents/shared/:shareLink",
  documentController.getSharedDocument
);
router.get("/uploads/documents/:filename", (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(
    __dirname,
    "../../public/uploads/documents",
    filename
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("File not found");
  }

  // Get file extension and set appropriate content type
  const ext = path.extname(filename).toLowerCase();
  const contentTypes = {
    ".pdf": "application/pdf",
    ".doc": "application/msword",
    ".docx":
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ".xls": "application/vnd.ms-excel",
    ".xlsx":
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ".txt": "text/plain",
    ".csv": "text/csv",
    ".ppt": "application/vnd.ms-powerpoint",
    ".pptx":
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
  };

  const contentType = contentTypes[ext] || "application/octet-stream";
  res.setHeader("Content-Type", contentType);

  // Always set Content-Disposition to inline to attempt browser rendering
  const disposition = "inline";
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename*=UTF-8''${encodeURIComponent(filename)}`
  );
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Add Cache-Control header for better performance
  res.setHeader("Cache-Control", "public, max-age=31536000");

  // Stream the file
  const fileStream = fs.createReadStream(filePath);
  fileStream.pipe(res);

  fileStream.on("error", (err) => {
    console.error("Error streaming file:", err);
    if (!res.headersSent) {
      res.status(500).json({
        error: "Error streaming file",
        details: err.message,
      });
    }
    fileStream.destroy();
  });

  // Handle response errors
  res.on("error", (err) => {
    console.error("Error in response stream:", err);
    fileStream.destroy();
  });
});

// Admin routes
router.get("/admin/documents", documentController.getAdminDocuments);
router.get("/admin/documents/upload", documentController.renderUploadForm);
router.get("/admin/documents/edit/:id", documentController.renderEditForm);
router.post(
  "/admin/documents/upload",
  upload.single("document"),
  documentController.uploadDocument
);
router.post(
  "/admin/documents/update/:id",
  upload.single("document"),
  documentController.updateDocument
);
router.post("/admin/documents/delete/:id", documentController.deleteDocument);
router.post("/admin/documents/:id/share", documentController.generateShareLink);

module.exports = router;
