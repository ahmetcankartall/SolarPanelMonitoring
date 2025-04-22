const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../utils/jwt');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Token'ı al
      token = req.headers.authorization.split(' ')[1];

      // Token'ı doğrula
      const decoded = jwt.verify(token, JWT_SECRET);

      // Kullanıcıyı bul ve şifreyi hariç tut
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      res.status(401).json({ message: 'Yetkilendirme başarısız' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Token bulunamadı' });
  }
};

const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Admin yetkisi gerekli' });
  }
};

const adminOrInstaller = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'installer')) {
    // Eğer kullanıcı installer rolündeyse ve DELETE/PUT isteği geliyorsa ek kontrol yap
    if (req.user.role === 'installer' && (req.method === 'DELETE' || req.method === 'PUT')) {
      // İsteğin yolunu kontrol et, yalnızca '/api/auth/users/:id' şeklindeyse izin ver
      const urlParts = req.originalUrl.split('/');
      const isUserEndpoint = urlParts.includes('users') && urlParts.length > 4;
      
      if (isUserEndpoint) {
        next();
      } else {
        res.status(403).json({ message: 'Admin yetkisi gerekli' });
      }
    } else {
      next();
    }
  } else {
    res.status(403).json({ message: 'Admin veya Installer yetkisi gerekli' });
  }
};

module.exports = { protect, admin, adminOrInstaller }; 