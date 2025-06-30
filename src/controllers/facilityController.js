const Facility = require('../models/Facility');

// Admin: List all facilities
exports.adminList = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.render('admin/facilities/index', { facilities, title: 'Facilities' });
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Admin: Show create form
exports.showCreate = (req, res) => {
  res.render('admin/facilities/create', { title: 'Add Facility' });
};

// Admin: Create facility
exports.create = async (req, res) => {
  try {
    const { title, description } = req.body;
    let imageUrl = '';
    if (req.file) imageUrl = '/uploads/' + req.file.filename;
    await Facility.create({ title, description, imageUrl });
    res.redirect('/admin/facilities');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Admin: Show edit form
exports.showEdit = async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    res.render('admin/facilities/edit', { facility, title: 'Edit Facility' });
  } catch (err) {
    res.status(404).send('Facility not found');
  }
};

// Admin: Update facility
exports.update = async (req, res) => {
  try {
    const { title, description } = req.body;
    let updateData = { title, description };
    if (req.file) updateData.imageUrl = '/uploads/' + req.file.filename;
    await Facility.findByIdAndUpdate(req.params.id, updateData);
    res.redirect('/admin/facilities');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Admin: Delete facility
exports.delete = async (req, res) => {
  try {
    await Facility.findByIdAndDelete(req.params.id);
    res.redirect('/admin/facilities');
  } catch (err) {
    res.status(500).send('Server Error');
  }
};

// Public: List all facilities
exports.publicList = async (req, res) => {
  try {
    const facilities = await Facility.find().sort({ createdAt: -1 });
    res.render('pages/facilities', { facilities });
  } catch (err) {
    res.status(500).send('Server Error');
  }
}; 