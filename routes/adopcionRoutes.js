// ============================================
// routes/adopcionRoutes.js
// ============================================
const express3 = require('express');
const router3 = express3.Router();

router3.get('/', (req, res) => {
  res.json({ message: 'Ruta de adopciones - En construcción' });
});

module.exports = router3;