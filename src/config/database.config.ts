export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/elegant-leather',
};

console.log('Connecting to MongoDB:', databaseConfig.uri);