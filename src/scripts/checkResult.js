const mongoose = require('mongoose');
const ResultSummary = require('../models/ResultSummary');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chavarahighschool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const checkResult = async () => {
  try {
    const resultId = '6860b9aed0c40d276cffc73c';
    
    
    // Check if the result exists
    const resultSummary = await ResultSummary.findById(resultId);
    
    if (!resultSummary) {
      
      // List all available result summaries
      const allResults = await ResultSummary.find({});
      allResults.forEach((result, index) => {

      });
      
      return;
    }

    ////console.log('✅ Result summary found!');
    ////console.log('Title:', resultSummary.title);
    ////console.log('Published:', resultSummary.isPublished);
    ////console.log('Class:', resultSummary.class);
    ////console.log('Exam Type:', resultSummary.examType);
    ////console.log('Academic Year:', resultSummary.academicYear);
    ////console.log('Created At:', resultSummary.createdAt);
    ////console.log('Published Date:', resultSummary.publishedDate);

    if (!resultSummary.isPublished) {
      ////console.log('\n⚠️  Result summary is not published. Publishing it now...');
      resultSummary.isPublished = true;
      resultSummary.publishedDate = new Date();
      await resultSummary.save();
      ////console.log('✅ Result summary published successfully!');
    }

  } catch (error) {
    console.error('Error checking result summary:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkResult(); 