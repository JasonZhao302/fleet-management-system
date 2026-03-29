const express = require('express');
const router = express.Router();
const { getDrivers, addDriver, updateDriver, deleteDriver } = require('../controllers/driverController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getDrivers);
router.post('/', protect, addDriver);
router.put('/:id', protect, updateDriver);
router.delete('/:id', protect, deleteDriver);

module.exports = router;