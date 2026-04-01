const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
// @access  Private (Admin)
const getVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find();
        res.json(vehicles);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a new vehicle
// @route   POST /api/vehicles
// @access  Private (Admin)
const addVehicle = async (req, res) => {
    const { vehicleId, plateNumber, model, type, year, status } = req.body;
    try {
        // Check if vehicle ID already exists
        const vehicleExists = await Vehicle.findOne({ vehicleId });
        if (vehicleExists) {
            return res.status(400).json({ message: 'Vehicle ID already exists' });
        }
        const vehicle = await Vehicle.create({ vehicleId, plateNumber, model, type, year, status });
        res.status(201).json(vehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vehicle
// @route   PUT /api/vehicles/:id
// @access  Private (Admin)
const updateVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        // Update only the fields provided in the request body
        const { vehicleId, plateNumber, model, type, year, status } = req.body;
        vehicle.vehicleId = vehicleId || vehicle.vehicleId;
        vehicle.plateNumber = plateNumber || vehicle.plateNumber;
        vehicle.model = model || vehicle.model;
        vehicle.type = type || vehicle.type;
        vehicle.year = year || vehicle.year;
        vehicle.status = status || vehicle.status;

        const updatedVehicle = await vehicle.save();
        res.json(updatedVehicle);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vehicle
// @route   DELETE /api/vehicles/:id
// @access  Private (Admin)
const deleteVehicle = async (req, res) => {
    try {
        const vehicle = await Vehicle.findById(req.params.id);
        if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

        await vehicle.deleteOne();
        res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getVehicles, addVehicle, updateVehicle, deleteVehicle };