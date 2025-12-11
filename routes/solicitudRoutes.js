// ============================================
// routes/solicitudRoutes.js
// ============================================
const express2 = require('express');
const router2 = express2.Router();

router2.get('/', (req, res) => {
  res.json({ message: 'Ruta de solicitudes - En construcción' });
});

module.exports = router2;