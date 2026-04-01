const Trip = require('../models/Trip');

// @desc    Get all trips (with vehicle and driver details)
// @route   GET /api/trips
// @access  Private (Admin)
const getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new trip with auto-generated trip ID
// @route   POST /api/trips
// @access  Private (Admin)
const createTrip = async (req, res) => {
    const { origin, destination, scheduledDate, vehicle, driver, notes, status } = req.body;
    try {
        // Auto-generate trip ID based on existing trip count e.g. FT-001
        const count = await Trip.countDocuments();
        const tripId = `FT-${String(count + 1).padStart(3, '0')}`;

        const trip = await Trip.create({ tripId, origin, destination, scheduledDate, vehicle, driver, notes, status });

        // Return populated trip with vehicle and driver details
        const populatedTrip = await Trip.findById(trip._id)
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.status(201).json(populatedTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a trip
// @route   PUT /api/trips/:id
// @access  Private (Admin)
const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Update only the fields provided in the request body
        const { tripId, origin, destination, scheduledDate, vehicle, driver, notes, status } = req.body;
        trip.tripId = tripId || trip.tripId;
        trip.origin = origin || trip.origin;
        trip.destination = destination || trip.destination;
        trip.scheduledDate = scheduledDate || trip.scheduledDate;
        trip.vehicle = vehicle || trip.vehicle;
        trip.driver = driver || trip.driver;
        trip.notes = notes || trip.notes;
        trip.status = status || trip.status;

        const updatedTrip = await trip.save();
        const populatedTrip = await Trip.findById(updatedTrip._id)
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.json(populatedTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a trip
// @route   DELETE /api/trips/:id
// @access  Private (Admin)
const deleteTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        await trip.deleteOne();
        res.json({ message: 'Trip deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get trips assigned to the logged-in driver
// @route   GET /api/trips/my-trips
// @access  Private (Driver)
const getMyTrips = async (req, res) => {
    try {
        // Filter trips by the logged-in driver's ID
        const trips = await Trip.find({ driver: req.user.id })
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update trip status (driver only)
// @route   PATCH /api/trips/:id/status
// @access  Private (Driver)
const updateTripStatus = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Ensure the driver can only update their own trips
        if (trip.driver.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorised to update this trip' });
        }

        trip.status = req.body.status || trip.status;
        const updatedTrip = await trip.save();
        res.json(updatedTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTrips, createTrip, updateTrip, deleteTrip, getMyTrips, updateTripStatus };