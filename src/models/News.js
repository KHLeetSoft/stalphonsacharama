const mongoose = require("mongoose");

const newsSchema = new mongoose.Schema(
  {
    title: { 
      type: String, 
      required: true 
    },
    slug: {
      type: String,
      required: true,
      unique: true
    },
    content: { 
      type: String, 
      required: true 
    },
    excerpt: {
      type: String,
      maxlength: 200
    },
    category: {
      type: String,
      required: true,
      enum: ['academic', 'events', 'achievements', 'announcements', 'sports', 'cultural', 'general']
    },
    image: { 
      type: String, 
      default: "" 
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    tags: [{ 
      type: String 
    }],
    isPublished: { 
      type: Boolean, 
      default: false 
    },
    publishedDate: { 
      type: Date 
    },
    featured: {
      type: Boolean,
      default: false
    },
    viewCount: {
      type: Number,
      default: 0
    },
    metaTitle: {
      type: String
    },
    metaDescription: {
      type: String
    },
    seoKeywords: [{
      type: String
    }]
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
newsSchema.index({ slug: 1, isPublished: 1, category: 1, featured: 1 });
newsSchema.index({ publishedDate: -1 });

// Virtual for formatted category name
newsSchema.virtual('categoryName').get(function() {
  const categories = {
    'academic': 'Academic',
    'events': 'Events',
    'achievements': 'Achievements',
    'announcements': 'Announcements',
    'sports': 'Sports',
    'cultural': 'Cultural',
    'general': 'General'
  };
  return categories[this.category] || this.category;
});

// Pre-save middleware to generate slug and excerpt
newsSchema.pre('save', function(next) {
  // Generate slug from title if not provided
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim('-');
  }

  // Generate excerpt from content if not provided
  if (!this.excerpt && this.content) {
    this.excerpt = this.content
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .substring(0, 200)
      .trim();
    
    if (this.excerpt.length === 200) {
      this.excerpt += '...';
    }
  }

  // Ensure excerpt is within 200 character limit
  if (this.excerpt && this.excerpt.length > 200) {
    this.excerpt = this.excerpt.substring(0, 197) + '...';
  }

  // Set published date when publishing
  if (this.isPublished && !this.publishedDate) {
    this.publishedDate = new Date();
  }

  next();
});

// Method to increment view count
newsSchema.methods.incrementViewCount = function() {
  this.viewCount += 1;
  return this.save();
};

// Static method to get featured news
newsSchema.statics.getFeaturedNews = function(limit = 5) {
  return this.find({ isPublished: true, featured: true })
    .populate('author', 'name')
    .sort({ publishedDate: -1 })
    .limit(limit);
};

// Static method to get news by category
newsSchema.statics.getNewsByCategory = function(category, limit = 10) {
  return this.find({ isPublished: true, category })
    .populate('author', 'name')
    .sort({ publishedDate: -1 })
    .limit(limit);
};

// Static method to search news
newsSchema.statics.searchNews = function(query, limit = 10) {
  return this.find({
    isPublished: true,
    $or: [
      { title: { $regex: query, $options: 'i' } },
      { content: { $regex: query, $options: 'i' } },
      { tags: { $in: [new RegExp(query, 'i')] } }
    ]
  })
  .populate('author', 'name')
  .sort({ publishedDate: -1 })
  .limit(limit);
};

module.exports = mongoose.model("News", newsSchema); 