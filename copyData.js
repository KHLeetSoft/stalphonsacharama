const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const localUri = 'mongodb://localhost:27017/chavarhighschool1';
const atlasUri = 'mongodb+srv://innovationleetsoft:Leethesh@cluster0.jxywvn1.mongodb.net/chavarhighschool1?retryWrites=true&w=majority';

async function copyAllCollections() {
  const localClient = new MongoClient(localUri, { useNewUrlParser: true, useUnifiedTopology: true });
  const atlasClient = new MongoClient(atlasUri, { useNewUrlParser: true, useUnifiedTopology: true });

  try {
    await localClient.connect();
    await atlasClient.connect();
    console.log('Connected to both local and Atlas databases.');

    const localDb = localClient.db();
    const atlasDb = atlasClient.db();

    const collections = await localDb.listCollections().toArray();
    for (const coll of collections) {
      const name = coll.name;
      console.log(`Copying collection: ${name}`);
      const docs = await localDb.collection(name).find({}).toArray();
      if (docs.length > 0) {
        // Remove _id to avoid duplicate key error if needed
        const docsToInsert = docs.map(doc => {
          const d = { ...doc };
          delete d._id;
          return d;
        });
        await atlasDb.collection(name).deleteMany({}); // Optional: clear target collection first
        await atlasDb.collection(name).insertMany(docsToInsert);
        console.log(`Copied ${docs.length} documents to Atlas collection: ${name}`);
      } else {
        console.log(`No documents found in collection: ${name}`);
      }
    }
    console.log('All collections copied successfully!');
  } catch (err) {
    console.error('Error copying collections:', err);
  } finally {
    await localClient.close();
    await atlasClient.close();
    console.log('Connections closed.');
  }
}

copyAllCollections(); 