const express = require('express');
const router = express.Router();
const axios = require('axios');
const { protect } = require('../middleware/auth');

// ThingSpeak'ten veri çekme endpoint'i
router.get('/', protect, async (req, res) => {
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

module.exports = router; 