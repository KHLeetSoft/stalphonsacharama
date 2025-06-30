const mongoose = require('mongoose');
const ResultSummary = require('../models/ResultSummary');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chavarahighschool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const publishResult = async () => {
  try {
    // Find the first result summary and publish it
    const resultSummary = await ResultSummary.findOne();
    
    if (!resultSummary) {
      //console.log('No result summary found to publish.');
      return;
    }

    //console.log('Found result summary:', resultSummary.title);
    //console.log('Current published status:', resultSummary.isPublished);

    // Publish the result summary
    resultSummary.isPublished = true;
    resultSummary.publishedDate = new Date();
    await resultSummary.save();

    //console.log('Result summary published successfully!');
    //console.log('Published date:', resultSummary.publishedDate);

  } catch (error) {
    console.error('Error publishing result summary:', error);
  } finally {
    mongoose.connection.close();
  }
};

publishResult(); 