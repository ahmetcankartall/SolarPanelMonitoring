const mongoose = require('mongoose');
const User = require('../models/User');
const connectDB = require('../config/db');

const users = [
  {
    username: 'admin',
    password: 'admin123',
    role: 'admin'
  },
  {
    username: 'user',
    password: 'user123',
    role: 'user'
  }
];

const seedUsers = async () => {
  try {
    // MongoDB'ye bağlan
    await connectDB();

    // Mevcut kullanıcıları temizle
    await User.deleteMany({});
    console.log('Mevcut kullanıcılar silindi');

    // Yeni kullanıcıları ekle
    const createdUsers = await User.create(users);
    console.log('Kullanıcılar başarıyla eklendi:');
    createdUsers.forEach(user => {
      console.log(`- ${user.username} (${user.role})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Hata:', error.message);
    process.exit(1);
  }
};

seedUsers(); 