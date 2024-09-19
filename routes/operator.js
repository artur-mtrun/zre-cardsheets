const express = require('express');

const router = express.Router();
const operatorController = require('../controllers/operators');

router.get('/operator-list', operatorController.getOperators);
router.get('/add-operator', operatorController.getAddOperator);
router.post('/add-operator', operatorController.postAddOperator);
module.exports = router;