const Trip = require('../models/Trip');

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

const createTrip = async (req, res) => {
    const { tripId, origin, destination, scheduledDate, vehicle, driver, notes, status } = req.body;
    try {
        const tripExists = await Trip.findOne({ tripId });
        if (tripExists) return res.status(400).json({ message: 'Trip ID already exists' });

        const trip = await Trip.create({ tripId, origin, destination, scheduledDate, vehicle, driver, notes, status });
        const populatedTrip = await Trip.findById(trip._id)
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.status(201).json(populatedTrip);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

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

const getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ driver: req.user.id })
            .populate('vehicle', 'vehicleId plateNumber model')
            .populate('driver', 'firstName lastName email');
        res.json(trips);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateTripStatus = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.id);
        if (!trip) return res.status(404).json({ message: 'Trip not found' });

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