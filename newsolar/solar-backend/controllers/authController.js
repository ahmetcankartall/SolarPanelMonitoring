const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

// @desc    Kullanıcı kaydı
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcı var mı kontrol et
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      password
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı girişi
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kullanıcıyı bul
    const user = await User.findOne({ username });

    // Kullanıcı ve şifre kontrolü
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı bilgilerini getir
// @route   GET /api/auth/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (user) {
      res.json({
        _id: user._id,
        username: user.username,
        role: user.role
      });
    } else {
      res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Tüm kullanıcıları getir
// @route   GET /api/auth/users
// @access  Private/Admin
const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Admin tarafından kullanıcı ekleme
// @route   POST /api/auth/users
// @access  Private/Admin
const addUser = async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Kullanıcı var mı kontrol et
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
    }

    // Yeni kullanıcı oluştur
    const user = await User.create({
      username,
      password,
      role: role || 'user'
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        username: user.username,
        role: user.role,
        createdAt: user.createdAt
      });
    }
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı silme
// @route   DELETE /api/auth/users/:id
// @access  Private/Admin
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    // Admin kendisini silemesin
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'Admin kendisini silemez' });
    }

    await user.deleteOne();
    res.json({ message: 'Kullanıcı başarıyla silindi' });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

// @desc    Kullanıcı güncelleme
// @route   PUT /api/auth/users/:id
// @access  Private/Admin
const updateUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı' });
    }

    const { username, password, role } = req.body;

    // Kullanıcı adı değiştirilmek isteniyorsa ve başka bir kullanıcıda varsa hata ver
    if (username && username !== user.username) {
      const userExists = await User.findOne({ username });
      if (userExists) {
        return res.status(400).json({ message: 'Bu kullanıcı adı zaten kullanılıyor' });
      }
      user.username = username;
    }

    if (password) {
      user.password = password;
    }

    if (role) {
      // Admin kendisinin rolünü değiştiremesin
      if (user._id.toString() === req.user._id.toString() && role !== 'admin') {
        return res.status(400).json({ message: 'Admin kendi rolünü değiştiremez' });
      }
      user.role = role;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      username: updatedUser.username,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası' });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  getUsers,
  addUser,
  deleteUser,
  updateUser
}; 