const User = require('../models/User');

const getDrivers = async (req, res) => {
    try {
        const drivers = await User.find({ role: 'driver' }).select('-password');
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const addDriver = async (req, res) => {
    const { firstName, lastName, email, password, phone, licenseNumber, dateOfBirth, status } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'Email already exists' });

        const driver = await User.create({
            firstName, lastName, email, password,
            phone, licenseNumber, dateOfBirth,
            status, role: 'driver'
        });

        const driverResponse = await User.findById(driver._id).select('-password');
        res.status(201).json(driverResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateDriver = async (req, res) => {
    try {
        const driver = await User.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        const { firstName, lastName, email, phone, licenseNumber, dateOfBirth, status } = req.body;
        driver.firstName = firstName || driver.firstName;
        driver.lastName = lastName || driver.lastName;
        driver.email = email || driver.email;
        driver.phone = phone || driver.phone;
        driver.licenseNumber = licenseNumber || driver.licenseNumber;
        driver.dateOfBirth = dateOfBirth || driver.dateOfBirth;
        driver.status = status || driver.status;

        const updatedDriver = await driver.save();
        const driverResponse = await User.findById(updatedDriver._id).select('-password');
        res.json(driverResponse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteDriver = async (req, res) => {
    try {
        const driver = await User.findById(req.params.id);
        if (!driver) return res.status(404).json({ message: 'Driver not found' });

        await driver.deleteOne();
        res.json({ message: 'Driver deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getDrivers, addDriver, updateDriver, deleteDriver };