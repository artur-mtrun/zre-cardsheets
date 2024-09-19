const express = require('express');
const router = express.Router();
const areaController = require('../controllers/areas');

router.get('/area-list', areaController.getAreas);
router.get('/add-area', areaController.getAddArea);
router.post('/add-area', areaController.postAddArea);

module.exports = router;