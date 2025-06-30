const News = require('../models/News');

// Get all news (Admin)
exports.getAllNews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const totalNews = await News.countDocuments();
    const totalPages = Math.ceil(totalNews / limit);

    const news = await News.find()
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.render('admin/news/index', {
      news,
      currentPage: page,
      totalPages,
      title: 'Manage News'
    });
  } catch (error) {
    res.status(500).render('admin/news/index', {
      news: [],
      currentPage: 1,
      totalPages: 1,
      title: 'Manage News',
      error: 'Failed to load news'
    });
  }
};

// Show create form
exports.showCreateForm = (req, res) => {
  res.render('admin/news/create', {
    admin: req.admin,
    title: 'Add News'
  });
};

// Create new news
exports.createNews = async (req, res) => {
  try {
    //console.log('Creating news with data:', req.body);
    //console.log('File uploaded:', req.file);
    //console.log('Admin info:', req.admin);

    const {
      title,
      content,
      category,
      tags,
      featured,
      metaTitle,
      metaDescription,
      seoKeywords
    } = req.body;

    // Validate required fields
    if (!title || !content || !category) {
      //console.log('Validation failed - missing required fields');
      return res.render('admin/news/create', {
        admin: req.admin,
        title: 'Add News',
        error: 'Title, content, and category are required.',
        formData: req.body
      });
    }

    // Check if admin exists
    if (!req.admin || !req.admin._id) {
      console.error('Admin not found or admin._id is undefined');
      return res.render('admin/news/create', {
        admin: req.admin,
        title: 'Add News',
        error: 'Authentication error. Please log in again.',
        formData: req.body
      });
    }

    // Generate a unique slug
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
    
    let slug = baseSlug;
    let counter = 1;
    
    // Check if slug already exists and make it unique
    while (await News.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newsData = {
      title,
      content,
      category,
      slug,
      image: req.file ? `/uploads/${req.file.filename}` : '',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'on',
      metaTitle: metaTitle || title,
      metaDescription: metaDescription || `${title} - Latest news and updates from our school.`,
      seoKeywords: seoKeywords ? seoKeywords.split(',').map(keyword => keyword.trim()) : [],
      author: req.admin._id,
      isPublished: false // Default to unpublished
    };

    //console.log('News data to save:', newsData);

    const news = new News(newsData);
    await news.save();
    //console.log('News created successfully with ID:', news._id);

    req.flash('success', 'News created successfully!');
    res.redirect('/admin/news');
  } catch (error) {
    console.error('Error creating news:', error);
    res.render('admin/news/create', {
      admin: req.admin,
      title: 'Add News',
      error: 'Failed to create news. Please try again. Error: ' + error.message,
      formData: req.body
    });
  }
};

// Show edit form
exports.showEditForm = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      req.flash('error', 'News not found.');
      return res.redirect('/admin/news');
    }

    res.render('admin/news/edit', {
      news,
      admin: req.admin,
      title: 'Edit News'
    });
  } catch (error) {
    console.error('Error fetching news:', error);
    req.flash('error', 'Failed to load news.');
    res.redirect('/admin/news');
  }
};

// Update news
exports.updateNews = async (req, res) => {
  try {
    const {
      title,
      content,
      category,
      tags,
      featured,
      metaTitle,
      metaDescription,
      seoKeywords
    } = req.body;

    const updateData = {
      title,
      content,
      category,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      featured: featured === 'on',
      metaTitle,
      metaDescription,
      seoKeywords: seoKeywords ? seoKeywords.split(',').map(keyword => keyword.trim()) : []
    };

    // Add image if uploaded
    if (req.file) {
      updateData.image = `/uploads/${req.file.filename}`;
    }

    await News.findByIdAndUpdate(req.params.id, updateData);

    req.flash('success', 'News updated successfully!');
    res.redirect('/admin/news');
  } catch (error) {
    console.error('Error updating news:', error);
    req.flash('error', 'Failed to update news. Please try again.');
    res.redirect(`/admin/news/edit/${req.params.id}`);
  }
};

// Delete news
exports.deleteNews = async (req, res) => {
  try {
    await News.findByIdAndDelete(req.params.id);
    req.flash('success', 'News deleted successfully!');
    res.redirect('/admin/news');
  } catch (error) {
    console.error('Error deleting news:', error);
    req.flash('error', 'Failed to delete news.');
    res.redirect('/admin/news');
  }
};

// Toggle publish status
exports.togglePublishStatus = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found.' });
    }

    news.isPublished = !news.isPublished;
    if (news.isPublished) {
      news.publishedDate = new Date();
    } else {
      news.publishedDate = null;
    }

    await news.save();

    res.json({ 
      success: true, 
      message: `News ${news.isPublished ? 'published' : 'unpublished'} successfully.`,
      isPublished: news.isPublished
    });
  } catch (error) {
    console.error('Error toggling publish status:', error);
    res.status(500).json({ success: false, message: 'Failed to update publish status.' });
  }
};

// Toggle featured status
exports.toggleFeaturedStatus = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ success: false, message: 'News not found.' });
    }

    news.featured = !news.featured;
    await news.save();

    res.json({ 
      success: true, 
      message: `News ${news.featured ? 'marked as featured' : 'unmarked as featured'} successfully.`,
      featured: news.featured
    });
  } catch (error) {
    console.error('Error toggling featured status:', error);
    res.status(500).json({ success: false, message: 'Failed to update featured status.' });
  }
};

// Get news details (Admin)
exports.getNewsDetails = async (req, res) => {
  try {
    const news = await News.findById(req.params.id)
      .populate('author', 'name');
    
    if (!news) {
      req.flash('error', 'News not found.');
      return res.redirect('/admin/news');
    }

    res.render('admin/news/view', {
      news,
      admin: req.admin,
      title: 'News Details'
    });
  } catch (error) {
    console.error('Error fetching news details:', error);
    req.flash('error', 'Failed to load news details.');
    res.redirect('/admin/news');
  }
};

// Get public news listing
exports.getPublicNews = async (req, res) => {
  try {
    //console.log('Public news request:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;
    const { category, search } = req.query;
    
    let query = { isPublished: true };
    
    // Build search conditions
    let searchConditions = [];
    
    if (search && search.trim()) {
      searchConditions.push(
        { title: { $regex: search.trim(), $options: 'i' } },
        { content: { $regex: search.trim(), $options: 'i' } }
      );
    }
    
    if (category && category.trim()) {
      query.category = category.trim();
    }
    
    // Add search conditions to query if any exist
    if (searchConditions.length > 0) {
      query.$or = searchConditions;
    }
    
    //console.log('Final query:', JSON.stringify(query, null, 2));

    const totalNews = await News.countDocuments(query);
    //console.log('Total news found:', totalNews);
    
    const totalPages = Math.ceil(totalNews / limit);

    const news = await News.find(query)
      .populate('author', 'name')
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit);

    //console.log('News articles fetched:', news.length);

    // Get featured news
    const featuredNews = await News.getFeaturedNews(3);

    // Get categories for filter
    const categories = await News.distinct('category', { isPublished: true });

    res.render('pages/news', {
      news,
      featuredNews,
      categories,
      currentPage: page,
      totalPages,
      currentFilters: { category, search },
      title: 'News & Updates'
    });
  } catch (error) {
    console.error('Error fetching public news:', error);
    res.render('pages/news', {
      news: [],
      featuredNews: [],
      categories: [],
      currentPage: 1,
      totalPages: 1,
      currentFilters: {},
      title: 'News & Updates',
      error: 'Failed to load news.'
    });
  }
};

// Get public news details
exports.getPublicNewsDetails = async (req, res) => {
  try {
    const news = await News.findOne({ slug: req.params.slug, isPublished: true })
      .populate('author', 'name');
    
    if (!news) {
      return res.status(404).render('pages/error', {
        title: 'News Not Found',
        error: { status: 404 },
        message: 'The requested news article could not be found or is not published.'
      });
    }

    // Increment view count - handle validation errors gracefully
    try {
      await news.incrementViewCount();
    } catch (viewCountError) {
      console.warn('Warning: Could not increment view count:', viewCountError.message);
      // Continue without incrementing view count rather than failing the entire request
    }

    // Get related news
    const relatedNews = await News.find({
      _id: { $ne: news._id },
      category: news.category,
      isPublished: true
    })
    .populate('author', 'name')
    .sort({ publishedDate: -1 })
    .limit(3);

    res.render('pages/news-detail', {
      news,
      relatedNews,
      title: news.metaTitle || news.title
    });
  } catch (error) {
    console.error('Error fetching news details:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      error: { status: 500 },
      message: 'Failed to load news details.'
    });
  }
};

// Get news by category
exports.getNewsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    const totalNews = await News.countDocuments({ category, isPublished: true });
    const totalPages = Math.ceil(totalNews / limit);

    const news = await News.find({ category, isPublished: true })
      .populate('author', 'name')
      .sort({ publishedDate: -1 })
      .skip(skip)
      .limit(limit);

    const categories = await News.distinct('category', { isPublished: true });

    res.render('pages/news', {
      news,
      featuredNews: [],
      categories,
      currentPage: page,
      totalPages,
      currentFilters: { category },
      title: `${category.charAt(0).toUpperCase() + category.slice(1)} News`
    });
  } catch (error) {
    console.error('Error fetching news by category:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      error: { status: 500 },
      message: 'Failed to load news.'
    });
  }
};

// Search news
exports.searchNews = async (req, res) => {
  try {
    const { q } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = 9;
    const skip = (page - 1) * limit;

    if (!q) {
      return res.redirect('/news');
    }

    const totalNews = await News.countDocuments({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    });
    const totalPages = Math.ceil(totalNews / limit);

    const news = await News.find({
      isPublished: true,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .populate('author', 'name')
    .sort({ publishedDate: -1 })
    .skip(skip)
    .limit(limit);

    const categories = await News.distinct('category', { isPublished: true });

    res.render('pages/news', {
      news,
      featuredNews: [],
      categories,
      currentPage: page,
      totalPages,
      currentFilters: { search: q },
      title: `Search Results for "${q}"`
    });
  } catch (error) {
    console.error('Error searching news:', error);
    res.status(500).render('pages/error', {
      title: 'Error',
      error: { status: 500 },
      message: 'Failed to search news.'
    });
  }
};

// Get statistics for admin dashboard
exports.getStatistics = async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const publishedNews = await News.countDocuments({ isPublished: true });
    const featuredNews = await News.countDocuments({ featured: true, isPublished: true });
    const newsByCategory = await News.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    //console.log('News Statistics:', {
    //   total: totalNews,
    //   published: publishedNews,
    //   featured: featuredNews,
    //   byCategory: newsByCategory
    // });

    res.json({
      success: true,
      statistics: {
        total: totalNews,
        published: publishedNews,
        featured: featuredNews,
        byCategory: newsByCategory
      }
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({ success: false, message: 'Error fetching statistics' });
  }
};

// Debug function to check news status
exports.debugNewsStatus = async (req, res) => {
  try {
    const allNews = await News.find().populate('author', 'name');
    const publishedNews = await News.find({ isPublished: true }).populate('author', 'name');
    
    //console.log('All news count:', allNews.length);
    //console.log('Published news count:', publishedNews.length);
    
    //console.log('All news:', allNews.map(n => ({
    //   id: n._id,
    //   title: n.title,
    //   isPublished: n.isPublished,
    //   publishedDate: n.publishedDate,
    //   author: n.author ? n.author.name : 'Unknown'
    // })));
    
    res.json({
      success: true,
      allNews: allNews.length,
      publishedNews: publishedNews.length,
      news: allNews.map(n => ({
        id: n._id,
        title: n.title,
        isPublished: n.isPublished,
        publishedDate: n.publishedDate,
        author: n.author ? n.author.name : 'Unknown'
      }))
    });
  } catch (error) {
    console.error('Error debugging news status:', error);
    res.status(500).json({ success: false, message: 'Error debugging news status' });
  }
};

// Publish all articles for testing
exports.publishAllArticles = async (req, res) => {
  try {
    //console.log('Publishing all unpublished articles...');
    
    // First, let's see what we have
    const allNews = await News.find();
    //console.log('All news before publishing:', allNews.map(n => ({
    //   id: n._id,
    //   title: n.title,
    //   isPublished: n.isPublished
    // })));
    
    const result = await News.updateMany(
      { isPublished: false },
      { 
        isPublished: true, 
        publishedDate: new Date() 
      }
    );
    
    //console.log(`Published ${result.modifiedCount} articles`);
    
    // Check what we have after publishing
    const publishedNews = await News.find({ isPublished: true });
    // console.log('Published news after update:', publishedNews.map(n => ({
    //   // id: n._id,
    //   // title: n.title,
    //   // isPublished: n.isPublished,
    //   // publishedDate: n.publishedDate
    // })));
    
    req.flash('success', `Published ${result.modifiedCount} articles successfully!`);
    res.redirect('/admin/news');
  } catch (error) {
    console.error('Error publishing articles:', error);
    req.flash('error', 'Failed to publish articles.');
    res.redirect('/admin/news');
  }
}; 