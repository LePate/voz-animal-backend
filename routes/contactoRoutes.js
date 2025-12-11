// ============================================
// routes/contactoRoutes.js
// ============================================
const express5 = require('express');
const router5 = express5.Router();

router5.get('/', (req, res) => {
  res.json({ message: 'Ruta de contacto - En construcción' });
});

module.exports = router5;