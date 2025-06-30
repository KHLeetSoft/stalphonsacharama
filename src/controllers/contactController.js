const Contact = require("../models/Contact");

const contactController = {
  // Get contact page with contact information
  getContactPage: async (req, res) => {
    try {
      const contactInfo = await Contact.findOne();
      res.render("pages/contact", { contactInfo });
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching contact information",
        error: error.message,
      });
    }
  },

  // Submit contact form
  submitContactForm: async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      let contact = await Contact.findOne();

      if (!contact) {
        // Create a new contact document if it doesn't exist
        contact = new Contact({
          address: "",
          Accounts: "",
          Reception: "",
          Transport: "",
          email: "",
          formSubmissions: [],
        });
      }

      contact.formSubmissions.push({ name, email, subject, message });
      await contact.save();

      res.status(200).json({ message: "Form submitted successfully" });
    } catch (error) {
      console.error("Error submitting form:", error);
      res.status(500).json({
        success: false,
        message: "Error submitting contact form",
        error: error.message,
      });
    }
  },

  // Admin: Get contact information
  getAdminContact: async (req, res) => {
    try {
      const contact = await Contact.findOne();
      res.render("admin/contact/manage", { contact });
    } catch (error) {
      console.error("Error fetching contact info:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching contact information",
        error: error.message,
      });
    }
  },

  // Admin: Update contact information
  updateContactInfo: async (req, res) => {
    try {
      const {
        address,
        Reception,
        Transport,
        Accounts,
        email,
        latitude,
        longitude,
        socialLinks,
      } = req.body;
      let contact = await Contact.findOne();

      if (contact) {
        contact.address = address;
        contact.Reception = Reception;
        contact.Transport = Transport;
        contact.Accounts = Accounts;
        contact.email = email;
        contact.latitude = parseFloat(latitude) || 0;
        contact.longitude = parseFloat(longitude) || 0;
        contact.socialLinks = socialLinks;
      } else {
        contact = new Contact({
          address,
          Accounts,
          Transport,
          Reception,
          email,
          latitude: parseFloat(latitude) || 0,
          longitude: parseFloat(longitude) || 0,
        });
      }

      await contact.save();
      res.status(200).json({
        message: "Contact information updated successfully",
        redirectUrl: "/admin/contact/manage",
      });
    } catch (error) {
      console.error("Error updating contact info:", error);
      res.status(500).json({
        success: false,
        message: "Error updating contact information",
        error: error.message,
      });
    }
  },

  // Admin: View form submissions
  getFormSubmissions: async (req, res) => {
    try {
      const contact = await Contact.findOne();
      if (!contact) {
        // Create a new contact document if it doesn't exist
        const newContact = new Contact({
          address: "",
          Transport: "",
          Reception: "",
          Accounts: "",
          email: "",
          formSubmissions: [],
        });
        await newContact.save();
        return res.render("admin/contact/submissions", { submissions: [] });
      }
      res.render("admin/contact/submissions", {
        submissions: contact.formSubmissions || [],
      });
    } catch (error) {
      console.error("Error fetching submissions:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching contact submissions",
        error: error.message,
      });
    }
  },

  // Admin: Display form to add new submission
  getAddSubmissionForm: async (req, res) => {
    try {
      res.render("admin/contact/add-submission");
    } catch (error) {
      console.error("Error displaying add submission form:", error);
      res.status(500).json({
        success: false,
        message: "Error loading submission form",
        error: error.message,
      });
    }
  },

  // Admin: Add new submission
  addSubmission: async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      let contact = await Contact.findOne();

      if (!contact) {
        contact = new Contact({
          address: "",
          Transport: "",
          Reception: "",
          Accounts: "",
          email: "",
          formSubmissions: [],
        });
      }

      contact.formSubmissions.push({ name, email, subject, message });
      await contact.save();

      res.redirect("/admin/contact/submissions");
    } catch (error) {
      console.error("Error adding submission:", error);
      res.status(500).json({
        success: false,
        message: "Error adding contact submission",
        error: error.message,
      });
    }
  },
};

module.exports = contactController;
