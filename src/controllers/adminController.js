const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all admins
const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find({}).select('-password -tokens');
    res.render('admin/manage-admins', { admins });
  } catch (error) {
    res.status(500).render('error', { error: 'Error fetching administrators' });
  }
};

// Create new admin
const createAdmin = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).json({ error: 'Username or email already exists' });
    }

    const admin = new Admin({
      username,
      email,
      password,
      role
    });

    await admin.save();
    res.redirect('/admin/manage-admins');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Update admin
const updateAdmin = async (req, res) => {
  try {
    const updates = Object.keys(req.body);
    const allowedUpdates = ['role', 'isActive', 'email'];
    const isValidOperation = updates.every(update => allowedUpdates.includes(update));

    if (!isValidOperation) {
      return res.status(400).json({ error: 'Invalid updates' });
    }

    const admin = await Admin.findById(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    updates.forEach(update => admin[update] = req.body[update]);
    await admin.save();

    res.redirect('/admin/manage-admins');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete admin
const deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByIdAndDelete(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.redirect('/admin/manage-admins');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Admin login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    const admin = await Admin.findOne({ username });

    if (!admin) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid login credentials' });
    }

    if (!admin.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    JWT_SECRET="STALPHONSACHARAMAAAAAAA"

    const token = jwt.sign({ _id: admin._id.toString() }, JWT_SECRET);
    admin.tokens = admin.tokens.concat({ token });
    admin.lastLogin = new Date();
    await admin.save();

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });

    res.redirect('/admin/dashboard');
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Admin logout
const logoutAdmin = async (req, res) => {
  try {
    req.admin.tokens = req.admin.tokens.filter(token => token.token !== req.token);
    await req.admin.save();
    res.clearCookie('token');
    res.redirect('/admin/login');
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Grant admin access to a teacher
const grantAdminAccess = async (req, res) => {
  try {
    const Teacher = require('../models/Teacher');
    const teacher = await Teacher.findById(req.params.teacherId);
    if (!teacher) {
      return res.status(404).render('admin/error', { error: 'Teacher not found' });
    }
    const { username, email, password, role } = req.body;
    // Check if admin already exists with this email or username
    const existingAdmin = await Admin.findOne({ $or: [{ username }, { email }] });
    if (existingAdmin) {
      return res.status(400).render('admin/error', { error: 'An admin with this username or email already exists.' });
    }
    const hashedPassword = await bcrypt.hash(password, 8);
    const admin = new Admin({
      username,
      email,
      password: hashedPassword,
      role: role || 'editor',
      isActive: true
    });
    await admin.save();
    res.redirect('/admin/manage-admins');
  } catch (error) {
    console.error('Grant admin access error:', error);
    res.status(500).render('admin/error', { error: 'Failed to grant admin access.' });
  }
};

module.exports = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  logoutAdmin,
  grantAdminAccess
};