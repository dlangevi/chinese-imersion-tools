import {MongoMemoryServer} from 'mongodb-memory-server';
import mongoose from 'mongoose';
import {closeDB, connectDB} from '../database.js';

const mongod = await MongoMemoryServer.create();
const mockDB = {
  connect: async () => {
    const uri = mongod.getUri();

    const mongooseOpts = {
      useNewUrlParser: true,
      // useFindAndModify: false,
      useUnifiedTopology: true,
    };

    // mongoose.connect(uri, mongooseOpts);
    connectDB(uri);
  },
  close: async () => {
    // await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await mongod.stop();
  },

};

export default mockDB;
