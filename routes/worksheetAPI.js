const express = require('express');
const router = express.Router();
const worksheetAPIController = require('../controllers/worksheetAPI');

router.get('/employees', worksheetAPIController.getAllEmployees);
router.get('/events', worksheetAPIController.getEvents);
router.get('/data', worksheetAPIController.getWorksheetData);
router.post('/add', worksheetAPIController.addWorksheetEntry);
router.post('/edit-entry/:id', worksheetAPIController.postEditEntry);
router.get('/accounts', worksheetAPIController.getAccounts);

module.exports = router;
