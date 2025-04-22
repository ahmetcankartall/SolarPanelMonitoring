const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect('mongodb+srv://MongoDb:MongoDb@database.o3gog.mongodb.net/?retryWrites=true&w=majority&appName=DataBase', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log(`MongoDB Bağlantısı Başarılı: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Hata: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 