const express = require('express');
const router = express.Router();
const worksheetAPIController = require('../controllers/worksheetAPI');

router.get('/employees', worksheetAPIController.getAllEmployees);
router.get('/events', worksheetAPIController.getEvents);
router.get('/data', worksheetAPIController.getWorksheetData);
router.post('/add', worksheetAPIController.addWorksheetEntry);
//router.put('/edit/:id', worksheetAPIController.editWorksheetEntry);
router.post('/edit-entry/:id', worksheetAPIController.postEditEntry);
module.exports = router;