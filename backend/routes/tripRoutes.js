const express = require('express');
const router = express.Router();
const { getTrips, createTrip, updateTrip, deleteTrip, getMyTrips, updateTripStatus } = require('../controllers/tripController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getTrips);
router.post('/', protect, createTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.get('/my-trips', protect, getMyTrips);
router.patch('/:id/status', protect, updateTripStatus);

module.exports = router;