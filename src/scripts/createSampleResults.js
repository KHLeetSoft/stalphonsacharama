const mongoose = require('mongoose');
const ResultSummary = require('../models/ResultSummary');
const Admin = require('../models/Admin');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chavarahighschool', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const createSampleResults = async () => {
  try {
    // Get the first admin user
    const admin = await Admin.findOne();
    if (!admin) {
      //console.log('No admin user found. Please create an admin user first.');
      return;
    }

    // Sample result summaries
    const sampleResults = [
      {
        title: 'Class 10 Final Examination Results 2024',
        academicYear: '2023-24',
        class: '10',
        examType: 'final',
        examDate: new Date('2024-03-15'),
        totalStudents: 120,
        appearedStudents: 118,
        passedStudents: 115,
        distinctionStudents: 25,
        firstDivisionStudents: 45,
        secondDivisionStudents: 35,
        thirdDivisionStudents: 10,
        passPercentage: 97.5,
        averageScore: 78.5,
        highestScore: 98.5,
        lowestScore: 45.2,
        description: 'Excellent performance in Class 10 final examinations with 97.5% pass rate.',
        isPublished: true,
        publishedDate: new Date(),
        tags: ['class10', 'final', 'excellent'],
        createdBy: admin._id
      },
      {
        title: 'Class 12 Board Examination Results 2024',
        academicYear: '2023-24',
        class: '12',
        examType: 'board',
        examDate: new Date('2024-04-20'),
        totalStudents: 95,
        appearedStudents: 94,
        passedStudents: 92,
        distinctionStudents: 30,
        firstDivisionStudents: 40,
        secondDivisionStudents: 20,
        thirdDivisionStudents: 2,
        passPercentage: 97.9,
        averageScore: 82.3,
        highestScore: 99.1,
        lowestScore: 52.0,
        description: 'Outstanding results in Class 12 board examinations with 97.9% pass rate.',
        isPublished: true,
        publishedDate: new Date(),
        tags: ['class12', 'board', 'outstanding'],
        createdBy: admin._id
      },
      {
        title: 'Class 8 Mid-Term Examination Results',
        academicYear: '2023-24',
        class: '8',
        examType: 'mid-term',
        examDate: new Date('2024-01-15'),
        totalStudents: 85,
        appearedStudents: 84,
        passedStudents: 80,
        distinctionStudents: 15,
        firstDivisionStudents: 35,
        secondDivisionStudents: 25,
        thirdDivisionStudents: 5,
        passPercentage: 95.2,
        averageScore: 75.8,
        highestScore: 96.5,
        lowestScore: 48.0,
        description: 'Good performance in Class 8 mid-term examinations.',
        isPublished: true,
        publishedDate: new Date(),
        tags: ['class8', 'midterm', 'good'],
        createdBy: admin._id
      },
      {
        title: 'Class 6 Unit Test Results',
        academicYear: '2023-24',
        class: '6',
        examType: 'unit-test',
        examDate: new Date('2024-02-10'),
        totalStudents: 75,
        appearedStudents: 74,
        passedStudents: 70,
        distinctionStudents: 10,
        firstDivisionStudents: 30,
        secondDivisionStudents: 25,
        thirdDivisionStudents: 5,
        passPercentage: 94.6,
        averageScore: 72.4,
        highestScore: 95.0,
        lowestScore: 50.0,
        description: 'Satisfactory performance in Class 6 unit tests.',
        isPublished: false, // This one is not published
        tags: ['class6', 'unittest', 'satisfactory'],
        createdBy: admin._id
      }
    ];

    // Clear existing result summaries
    await ResultSummary.deleteMany({});
    //console.log('Cleared existing result summaries');

    // Insert sample results
    const insertedResults = await ResultSummary.insertMany(sampleResults);
    //console.log(`Created ${insertedResults.length} sample result summaries`);

    //console.log('Sample result summaries created successfully!');
    //console.log('Published results:', insertedResults.filter(r => r.isPublished).length);
    //console.log('Unpublished results:', insertedResults.filter(r => !r.isPublished).length);

  } catch (error) {
    console.error('Error creating sample results:', error);
  } finally {
    mongoose.connection.close();
  }
};

createSampleResults(); 