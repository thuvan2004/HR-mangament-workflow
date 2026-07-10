const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/flowwise_ai');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    console.error('Please ensure MongoDB is running locally or specify a valid MONGODB_URI in your .env file.');
    process.exit(1);
  }
};

module.exports = connectDB;
