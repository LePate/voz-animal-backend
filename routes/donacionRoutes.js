
// ============================================
// routes/donacionRoutes.js
// ============================================
const express4 = require('express');
const router4 = express4.Router();

router4.get('/', (req, res) => {
  res.json({ message: 'Ruta de donaciones - En construcción' });
});

module.exports = router4;