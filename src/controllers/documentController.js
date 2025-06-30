const Document = require("../models/Document");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const documentController = {
  // Render upload form
  renderUploadForm: async (req, res) => {
    res.render("admin/documents/upload");
  },

  // Render edit form
  renderEditForm: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).send("Document not found");
      }
      // Add filename for display in edit form
      document.filename = path.basename(document.fileUrl);
      res.render("admin/documents/edit", { document });
    } catch (error) {
      res.status(500).send("Error fetching document");
    }
  },
  // Get all documents
  getAllDocuments: async (req, res) => {
    try {
      const documents = await Document.find({ isActive: true }).sort({
        uploadDate: -1,
      });
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  },

  // Get documents for admin panel
  getAdminDocuments: async (req, res) => {
    try {
      const documents = await Document.find().sort({ uploadDate: -1 });
      res.render("admin/documents/manage", { documents });
    } catch (error) {
      res.status(500).send("Error fetching documents");
    }
  },

  // Upload new document
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).send("No file uploaded");
      }

      const document = new Document({
        title: req.body.title,
        description: req.body.description,
        fileUrl: `/uploads/documents/${req.file.filename}`,
        fileType: path.extname(req.file.originalname).toLowerCase(),
      });

      await document.save();
      res.redirect("/admin/documents");
    } catch (error) {
      res.status(500).send("Error uploading document");
    }
  },

  // Generate share link for document
  generateShareLink: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).json({ error: "Document not found" });
      }

      // Generate unique share link if not exists
      if (!document.shareLink) {
        document.shareLink = crypto.randomBytes(16).toString("hex");
        // Set expiry to 30 days from now by default
        document.shareLinkExpiry = new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        );
        await document.save();
      }

      res.json({
        shareLink: `${req.protocol}://${req.get("host")}/documents/shared/${
          document.shareLink
        }`,
        expiry: document.shareLinkExpiry,
      });
    } catch (error) {
      res.status(500).json({ error: "Error generating share link" });
    }
  },

  // Access shared document
  getSharedDocument: async (req, res) => {
    try {
      const document = await Document.findOne({
        shareLink: req.params.shareLink,
      });

      if (!document || !document.isActive) {
        return res
          .status(404)
          .render("error", { message: "Document not found or inactive" });
      }

      if (document.shareLinkExpiry && document.shareLinkExpiry < new Date()) {
        return res
          .status(410)
          .render("error", { message: "Share link has expired" });
      }

      // Update access statistics
      document.accessCount += 1;
      document.lastAccessedAt = new Date();
      await document.save();

      // Serve the document
      const filename = path.basename(document.fileUrl);
      const filePath = path.join(
        __dirname,
        "../../public/uploads/documents",
        filename
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).render("error", { message: "File not found" });
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
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + filename + '"'
      );
      res.setHeader("X-Content-Type-Options", "nosniff");

      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);

      fileStream.on("error", (err) => {
        console.error("Error streaming file:", err);
        if (!res.headersSent) {
          res.status(500).render("error", {
            message: "Error streaming file",
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
    } catch (error) {
      res.status(500).render("error", { message: "Error accessing document" });
    }
  },

  // Update document
  updateDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).send("Document not found");
      }

      document.title = req.body.title;
      document.description = req.body.description;
      document.isActive = req.body.isActive === "on";

      if (req.file) {
        // Delete old file
        const oldFilePath = path.join(
          __dirname,
          "../../public",
          document.fileUrl
        );
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }

        // Update with new file
        document.fileUrl = `/uploads/documents/${req.file.filename}`;
        document.fileType = path.extname(req.file.originalname).toLowerCase();
      }

      await document.save();
      res.redirect("/admin/documents");
    } catch (error) {
      res.status(500).send("Error updating document");
    }
  },

  // Delete document
  deleteDocument: async (req, res) => {
    try {
      const document = await Document.findById(req.params.id);
      if (!document) {
        return res.status(404).send("Document not found");
      }

      // Delete file from storage
      const filePath = path.join(__dirname, "../../public", document.fileUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await Document.findByIdAndDelete(req.params.id);
      res.redirect("/admin/documents");
    } catch (error) {
      res.status(500).send("Error deleting document");
    }
  },

  // Render CBSE Corner page
  renderCbseCorner: async (req, res) => {
    try {
      const documents = await Document.find({ isActive: true }).sort({
        uploadDate: -1,
      });
      res.render("pages/cbse-corner", { documents });
    } catch (error) {
      res.status(500).send("Error loading CBSE Corner");
    }
  },
};

module.exports = documentController;
