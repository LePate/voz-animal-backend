// ============================================
// routes/usuarioRoutes.js
// ============================================
const express6 = require('express');
const router6 = express6.Router();

router6.get('/', (req, res) => {
  res.json({ message: 'Ruta de usuarios - En construcción' });
});

module.exports = router6;