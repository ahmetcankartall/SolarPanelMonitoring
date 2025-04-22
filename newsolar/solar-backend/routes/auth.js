const express = require('express');
const router = express.Router();
const { register, login, getProfile, getUsers, addUser, deleteUser, updateUser } = require('../controllers/authController');
const { protect, admin, adminOrInstaller } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, adminOrInstaller, getUsers);
router.post('/users', protect, adminOrInstaller, addUser);
router.delete('/users/:id', protect, adminOrInstaller, deleteUser);
router.put('/users/:id', protect, adminOrInstaller, updateUser);

// Geçici erişim token'ı oluşturma endpoint'i
router.post('/temp-access', protect, adminOrInstaller, (req, res) => {
  try {
    const { userId } = req.body;
    // Basit bir token oluşturma işlemi (geliştirilebilir)
    const token = `temp_${userId}_${Date.now()}`;
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Token oluşturma hatası' });
  }
});

module.exports = router; 