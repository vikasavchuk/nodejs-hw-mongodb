import mongoose from 'mongoose';

export const initMongoConnection = async () => {
  const { MONGODB_USER, MONGODB_PASSWORD, MONGODB_URL, MONGODB_DB } =
    process.env;

  if (!MONGODB_USER || !MONGODB_PASSWORD || !MONGODB_URL || !MONGODB_DB) {
    throw new Error(
      'Missing MongoDB connection details in environment variables',
    );
  }

  const connectionString = `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_URL}/${MONGODB_DB}?retryWrites=true&w=majority`;

  try {
    await mongoose.connect(connectionString);
    console.log('Mongo connection successfully established!');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    throw error;
  }
};