const BookList = require('../models/BookList');
const fs = require('fs');
const path = require('path');

// Helper function to get subject color
const getSubjectColor = (subject) => {
  const colors = {
    'english': 'primary',
    'hindi': 'warning',
    'mathematics': 'success',
    'science': 'info',
    'social-studies': 'secondary',
    'computer': 'dark',
    'art': 'danger',
    'music': 'light',
    'physical-education': 'success',
    'general-knowledge': 'primary',
    'other': 'secondary'
  };
  return colors[subject] || 'secondary';
};

// Helper function to get book type color
const getBookTypeColor = (bookType) => {
  const colors = {
    'textbook': 'primary',
    'workbook': 'success',
    'reference': 'info',
    'storybook': 'warning',
    'activity-book': 'danger',
    'other': 'secondary'
  };
  return colors[bookType] || 'secondary';
};

// Get all book lists (admin)
exports.getAllBookLists = async (req, res) => {
  try {
    const { class: classFilter, subject, bookType, status, search, academicYear } = req.query;
    let query = {};
    
    // Filter by class
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    
    // Filter by subject
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Filter by book type
    if (bookType && bookType !== 'all') {
      query.bookType = bookType;
    }
    
    // Filter by academic year
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      if (status === 'required') {
        query.isRequired = true;
      } else if (status === 'optional') {
        query.isRequired = false;
      } else if (status === 'active') {
        query.isActive = true;
      } else if (status === 'inactive') {
        query.isActive = false;
      }
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
        { isbn: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const books = await BookList.find(query)
      .populate('createdBy', 'name')
      .sort({ class: 1, subject: 1, priority: -1 });
    
    res.render('admin/book-lists/index', {
      books,
      admin: req.admin,
      title: 'Book Lists',
      filters: { class: classFilter, subject, bookType, status, search, academicYear },
      getSubjectColor,
      getBookTypeColor
    });
  } catch (error) {
    console.error('Error fetching book lists:', error);
    res.status(500).render('admin/book-lists/index', {
      books: [],
      admin: req.admin,
      title: 'Book Lists',
      error: 'Failed to load book lists.',
      filters: {},
      getSubjectColor,
      getBookTypeColor
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/book-lists/create', {
    admin: req.admin,
    title: 'Add Book to List'
  });
};

// Create new book list entry
exports.createBookList = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      class: classValue, 
      subject, 
      bookType, 
      publisher, 
      isbn, 
      edition, 
      academicYear, 
      description, 
      price, 
      isRequired, 
      tags 
    } = req.body;
    
    let coverImage = '';
    
    // Handle cover image upload
    if (req.file) {
      coverImage = `/uploads/${req.file.filename}`;
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    const bookList = new BookList({
      title,
      author,
      class: classValue,
      subject,
      bookType,
      publisher,
      isbn,
      edition,
      academicYear,
      description,
      price: parseFloat(price) || 0,
      isRequired: isRequired === 'true',
      coverImage,
      tags: tagsArray,
      createdBy: req.admin._id
    });
    
    await bookList.save();
    res.redirect('/admin/book-lists');
  } catch (error) {
    console.error('Error creating book list entry:', error);
    res.status(500).render('admin/book-lists/create', {
      admin: req.admin,
      title: 'Add Book to List',
      error: 'Failed to create book list entry.',
      formData: req.body
    });
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const book = await BookList.findById(req.params.id);
    if (!book) {
      return res.redirect('/admin/book-lists');
    }
    
    res.render('admin/book-lists/edit', {
      book,
      admin: req.admin,
      title: 'Edit Book List Entry'
    });
  } catch (error) {
    console.error('Error fetching book list entry:', error);
    res.redirect('/admin/book-lists');
  }
};

// Update book list entry
exports.updateBookList = async (req, res) => {
  try {
    const { 
      title, 
      author, 
      class: classValue, 
      subject, 
      bookType, 
      publisher, 
      isbn, 
      edition, 
      academicYear, 
      description, 
      price, 
      isRequired, 
      tags 
    } = req.body;
    
    const book = await BookList.findById(req.params.id);
    if (!book) {
      return res.redirect('/admin/book-lists');
    }
    
    // Handle cover image upload
    if (req.file) {
      // Delete old image if exists
      if (book.coverImage) {
        const oldImagePath = path.join(__dirname, '..', 'public', book.coverImage);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      book.coverImage = `/uploads/${req.file.filename}`;
    }
    
    // Convert tags string to array
    const tagsArray = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];
    
    book.title = title;
    book.author = author;
    book.class = classValue;
    book.subject = subject;
    book.bookType = bookType;
    book.publisher = publisher;
    book.isbn = isbn;
    book.edition = edition;
    book.academicYear = academicYear;
    book.description = description;
    book.price = parseFloat(price) || 0;
    book.isRequired = isRequired === 'true';
    book.tags = tagsArray;
    book.lastUpdated = new Date();
    
    await book.save();
    res.redirect('/admin/book-lists');
  } catch (error) {
    console.error('Error updating book list entry:', error);
    res.redirect('/admin/book-lists');
  }
};

// Delete book list entry
exports.deleteBookList = async (req, res) => {
  try {
    const book = await BookList.findById(req.params.id);
    if (!book) {
      return res.redirect('/admin/book-lists');
    }
    
    // Delete associated cover image
    if (book.coverImage) {
      const imagePath = path.join(__dirname, '..', 'public', book.coverImage);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    
    await BookList.findByIdAndDelete(req.params.id);
    res.redirect('/admin/book-lists');
  } catch (error) {
    console.error('Error deleting book list entry:', error);
    res.redirect('/admin/book-lists');
  }
};

// Toggle required status
exports.toggleRequiredStatus = async (req, res) => {
  try {
    const book = await BookList.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    book.isRequired = !book.isRequired;
    await book.save();
    
    res.json({ 
      success: true, 
      isRequired: book.isRequired,
      message: book.isRequired ? 'Book marked as required' : 'Book marked as optional'
    });
  } catch (error) {
    console.error('Error toggling required status:', error);
    res.status(500).json({ success: false, message: 'Error updating required status' });
  }
};

// Toggle active status
exports.toggleActiveStatus = async (req, res) => {
  try {
    const book = await BookList.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    book.isActive = !book.isActive;
    await book.save();
    
    res.json({ 
      success: true, 
      isActive: book.isActive,
      message: book.isActive ? 'Book activated successfully' : 'Book deactivated successfully'
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
    const book = await BookList.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }
    
    book.priority = parseInt(priority);
    await book.save();
    
    res.json({ 
      success: true, 
      priority: book.priority,
      message: 'Priority updated successfully'
    });
  } catch (error) {
    console.error('Error updating priority:', error);
    res.status(500).json({ success: false, message: 'Error updating priority' });
  }
};

// Get public book lists
exports.getPublicBookLists = async (req, res) => {
  try {
    const { class: classFilter, subject, bookType, search, academicYear } = req.query;
    let query = { isActive: true };
    
    // Filter by class
    if (classFilter && classFilter !== 'all') {
      query.class = classFilter;
    }
    
    // Filter by subject
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Filter by book type
    if (bookType && bookType !== 'all') {
      query.bookType = bookType;
    }
    
    // Filter by academic year
    if (academicYear && academicYear !== 'all') {
      query.academicYear = academicYear;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const books = await BookList.find(query)
      .populate('createdBy', 'name')
      .sort({ class: 1, subject: 1, priority: -1 });
    
    // Group books by class
    const booksByClass = {};
    books.forEach(book => {
      if (!booksByClass[book.class]) {
        booksByClass[book.class] = [];
      }
      booksByClass[book.class].push(book);
    });
    
    res.render('pages/book-lists', {
      books,
      booksByClass,
      title: 'Book Lists',
      classFilter: classFilter || 'all',
      subject: subject || 'all',
      bookType: bookType || 'all',
      academicYear: academicYear || 'all',
      search: search || '',
      getSubjectColor,
      getBookTypeColor
    });
  } catch (error) {
    console.error('Error fetching public book lists:', error);
    res.render('pages/book-lists', {
      books: [],
      booksByClass: {},
      title: 'Book Lists',
      classFilter: 'all',
      subject: 'all',
      bookType: 'all',
      academicYear: 'all',
      search: '',
      getSubjectColor,
      getBookTypeColor
    });
  }
};

// Get books for specific class
exports.getBooksByClass = async (req, res) => {
  try {
    const { class: classValue } = req.params;
    const { subject, bookType, search } = req.query;
    
    let query = { class: classValue, isActive: true };
    
    // Filter by subject
    if (subject && subject !== 'all') {
      query.subject = subject;
    }
    
    // Filter by book type
    if (bookType && bookType !== 'all') {
      query.bookType = bookType;
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
        { publisher: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const books = await BookList.find(query)
      .populate('createdBy', 'name')
      .sort({ subject: 1, priority: -1 });
    
    // Group books by subject
    const booksBySubject = {};
    books.forEach(book => {
      if (!booksBySubject[book.subject]) {
        booksBySubject[book.subject] = [];
      }
      booksBySubject[book.subject].push(book);
    });
    
    const classNames = {
      'nursery': 'Nursery',
      'lkg': 'LKG',
      'ukg': 'UKG',
      '1': 'Class 1',
      '2': 'Class 2',
      '3': 'Class 3',
      '4': 'Class 4',
      '5': 'Class 5',
      '6': 'Class 6',
      '7': 'Class 7',
      '8': 'Class 8',
      '9': 'Class 9',
      '10': 'Class 10',
      '11': 'Class 11',
      '12': 'Class 12'
    };
    
    res.render('pages/book-list-class', {
      books,
      booksBySubject,
      classValue,
      className: classNames[classValue] || classValue,
      title: `${classNames[classValue] || classValue} Book List`,
      subject: subject || 'all',
      bookType: bookType || 'all',
      search: search || '',
      getSubjectColor,
      getBookTypeColor
    });
  } catch (error) {
    console.error('Error fetching books by class:', error);
    res.status(500).render('error', {
      title: 'Error',
      message: 'An error occurred while loading the book list.'
    });
  }
};

// Get statistics for admin dashboard
exports.getStatistics = async (req, res) => {
  try {
    const totalBooks = await BookList.countDocuments();
    const activeBooks = await BookList.countDocuments({ isActive: true });
    const requiredBooks = await BookList.countDocuments({ isRequired: true });
    const booksByClass = await BookList.aggregate([
      { $group: { _id: '$class', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    res.json({
      success: true,
      statistics: {
        total: totalBooks,
        active: activeBooks,
        required: requiredBooks,
        byClass: booksByClass
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
}; 