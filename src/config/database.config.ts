export const databaseConfig = {
  uri: process.env.MONGODB_URI || 'mongodb+srv://elegantdeploy_db_user:oRGs6GcekIm7HNiA@elegantcluster.4xoxhp8.mongodb.net/elegant-leather?retryWrites=true&w=majority',
};

console.log('Connecting to MongoDB:', databaseConfig.uri);
