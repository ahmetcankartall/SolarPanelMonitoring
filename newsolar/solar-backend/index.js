const express = require('express');
const cors = require('cors');
const axios = require('axios');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');

// MongoDB bağlantısı
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// ThingSpeak'ten veri çekme endpoint'i
app.get('/solar-data', async (req, res) => {
  try {
    const apiUrl = 'https://api.thingspeak.com/channels/2839931/feeds.json?api_key=SGBRW9FN3TGU80GQ';
    console.log('ThingSpeak API isteği gönderiliyor:', apiUrl);
    const response = await axios.get(apiUrl);
    
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Veri çekme hatası:', error.message);
    res.status(500).json({ 
      error: 'ThingSpeak verisi çekilemedi', 
      message: error.message,
      details: error.response ? error.response.data : 'No additional error details'
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});