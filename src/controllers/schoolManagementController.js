const SchoolManagement = require('../models/SchoolManagement');
const fs = require('fs');
const path = require('path');

// Get all school management entries
exports.getAllSchoolManagement = async (req, res) => {
  try {
    const { category, status, search } = req.query;
    let query = {};
    
    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const entries = await SchoolManagement.find(query)
      .populate('author', 'name')
      .sort({ priority: -1, publishedDate: -1 });
    
    res.render('admin/school-management/index', {
      entries,
      admin: req.admin,
      title: 'School Management',
      filters: { category, status, search }
    });
  } catch (error) {
    console.error('Error fetching school management entries:', error);
    res.status(500).render('admin/school-management/index', {
      entries: [],
      admin: req.admin,
      title: 'School Management',
      error: 'Failed to load school management entries.',
      filters: {}
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/school-management/create', {
    admin: req.admin,
    title: 'Add School Management Entry'
  });
};

// Create new school management entry
exports.createSchoolManagement = async (req, res) => {
  try {
    const { title, description, message, category, priority, tags, expiryDate } = req.body;
    
    let photo = '';
    
    // Handle photo upload
    if (req.file) {
      photo = `/uploads/${req.file.filename}`;
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Parse expiry date if provided
    let parsedExpiryDate = null;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
    }
    
    const schoolManagement = new SchoolManagement({
      title,
      description,
      message,
      photo,
      category,
      priority: parseInt(priority) || 1,
      tags: tagsArray,
      expiryDate: parsedExpiryDate,
      author: req.admin._id
    });
    
    await schoolManagement.save();
    res.redirect('/admin/school-management');
  } catch (error) {
    console.error('Error creating school management entry:', error);
    res.status(500).render('admin/school-management/create', {
      admin: req.admin,
      title: 'Add School Management Entry',
      error: 'Failed to create entry.',
      formData: req.body
    });
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const entry = await SchoolManagement.findById(req.params.id);
    if (!entry) {
      return res.redirect('/admin/school-management');
    }
    
    res.render('admin/school-management/edit', {
      entry,
      admin: req.admin,
      title: 'Edit School Management Entry'
    });
  } catch (error) {
    console.error('Error fetching school management entry:', error);
    res.redirect('/admin/school-management');
  }
};

// Update school management entry
exports.updateSchoolManagement = async (req, res) => {
  try {
    const { title, description, message, category, priority, tags, expiryDate } = req.body;
    const entry = await SchoolManagement.findById(req.params.id);
    
    if (!entry) {
      return res.redirect('/admin/school-management');
    }
    
    // Handle photo upload
    if (req.file) {
      // Delete old photo if exists
      if (entry.photo) {
        const oldPhotoPath = path.join(__dirname, '..', 'public', entry.photo);
        if (fs.existsSync(oldPhotoPath)) {
          fs.unlinkSync(oldPhotoPath);
        }
      }
      entry.photo = `/uploads/${req.file.filename}`;
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()) : [];
    
    // Parse expiry date if provided
    let parsedExpiryDate = null;
    if (expiryDate) {
      parsedExpiryDate = new Date(expiryDate);
    }
    
    entry.title = title;
    entry.description = description;
    entry.message = message;
    entry.category = category;
    entry.priority = parseInt(priority) || 1;
    entry.tags = tagsArray;
    entry.expiryDate = parsedExpiryDate;
    
    await entry.save();
    res.redirect('/admin/school-management');
  } catch (error) {
    console.error('Error updating school management entry:', error);
    res.redirect('/admin/school-management');
  }
};

// Delete school management entry
exports.deleteSchoolManagement = async (req, res) => {
  try {
    const entry = await SchoolManagement.findById(req.params.id);
    if (!entry) {
      return res.redirect('/admin/school-management');
    }
    
    // Delete associated photo
    if (entry.photo) {
      const photoPath = path.join(__dirname, '..', 'public', entry.photo);
      if (fs.existsSync(photoPath)) {
        fs.unlinkSync(photoPath);
      }
    }
    
    await SchoolManagement.findByIdAndDelete(req.params.id);
    res.redirect('/admin/school-management');
  } catch (error) {
    console.error('Error deleting school management entry:', error);
    res.redirect('/admin/school-management');
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const entry = await SchoolManagement.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    
    entry.isActive = !entry.isActive;
    await entry.save();
    
    res.json({ 
      success: true, 
      isActive: entry.isActive,
      message: entry.isActive ? 'Entry activated successfully' : 'Entry deactivated successfully'
    });
  } catch (error) {
    console.error('Error toggling active status:', error);
    res.status(500).json({ success: false, message: 'Error updating status' });
  }
};

// Update priority
exports.updatePriority = async (req, res) => {
  try {
    const { priority } = req.body;
    const entry = await SchoolManagement.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ success: false, message: 'Entry not found' });
    }
    
    entry.priority = parseInt(priority);
    await entry.save();
    
    res.json({ 
      success: true, 
      priority: entry.priority,
      message: 'Priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ success: false, message: 'Error updating priority' });
  }
};

// Get public school management entries
exports.getPublicSchoolManagement = async (req, res) => {
  try {
    const { category } = req.query;
    let query = { isActive: true };
    
    // Filter by category if provided
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // Show entries where expiryDate is missing, null, empty string, or in the future
    const now = new Date();
    query.$or = [
      { expiryDate: { $exists: false } },
      { expiryDate: null },
      { expiryDate: "" },
      { expiryDate: { $gt: now } }
    ];
    
    //console.log('Query:', JSON.stringify(query, null, 2));
    
    const entries = await SchoolManagement.find(query)
      .populate('author', 'name')
      .sort({ priority: -1, publishedDate: -1 })
      .limit(20);
    
    //console.log(`Found ${entries.length} entries`);
    
    // Helper function for category colors
    const getCategoryColor = (category) => {
      const colors = {
        'community': 'primary',
        'announcement': 'warning',
        'event': 'success',
        'news': 'info',
        'achievement': 'danger'
      };
      return colors[category] || 'secondary';
    };
    
    res.render('pages/school-management', {
      entries,
      title: 'School Community',
      category: category || 'all',
      getCategoryColor
    });
  } catch (error) {
    console.error('Error fetching public school management entries:', error);
    res.render('pages/school-management', {
      entries: [],
      title: 'School Community',
      category: 'all',
      getCategoryColor: () => 'secondary'
    });
  }
};

// Get single entry for public view
exports.getSingleEntry = async (req, res) => {
  try {
    const entry = await SchoolManagement.findById(req.params.id)
      .populate('author', 'name');
    
    if (!entry || !entry.isActive) {
      return res.status(404).render('pages/error', {
        title: 'Entry Not Found',
        error: { status: 404 },
        message: 'The requested entry could not be found.'
      });
    }
    
    // Check if expired
    if (entry.expiryDate && entry.expiryDate < new Date()) {
      return res.status(404).render('pages/error', {
        title: 'Entry Expired',
        error: { status: 404 },
        message: 'This entry has expired and is no longer available.'
      });
    }
    
    // Increment view count
    entry.viewCount += 1;
    await entry.save();
    
    // Helper function for category colors
    const getCategoryColor = (category) => {
      const colors = {
        'community': 'primary',
        'announcement': 'warning',
        'event': 'success',
        'news': 'info',
        'achievement': 'danger'
      };
      return colors[category] || 'secondary';
    };
    
    res.render('pages/school-management-detail', {
      entry,
      title: entry.title,
      getCategoryColor
    });
  } catch (error) {
    console.error('Error fetching single entry:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      error: { status: 500 },
      message: 'An error occurred while loading the entry.'
    });
  }
};

// Get statistics for admin dashboard
exports.getStatistics = async (req, res) => {
  try {
    const totalEntries = await SchoolManagement.countDocuments();
    const activeEntries = await SchoolManagement.countDocuments({ isActive: true });
    const communityEntries = await SchoolManagement.countDocuments({ category: 'community' });
    const recentEntries = await SchoolManagement.countDocuments({
      publishedDate: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.json({
      success: true,
      statistics: {
        total: totalEntries,
        active: activeEntries,
        community: communityEntries,
        recent: recentEntries
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
}; 