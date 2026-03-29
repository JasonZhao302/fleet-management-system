const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, phone, gender, licenseNumber } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ firstName, lastName, email, password, role, phone, gender, licenseNumber });
        res.status(201).json({ 
            id: user.id, 
            firstName: user.firstName, 
            lastName: user.lastName, 
            email: user.email, 
            role: user.role,
            token: generateToken(user.id) 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ 
                id: user.id, 
                firstName: user.firstName, 
                lastName: user.lastName, 
                email: user.email, 
                role: user.role,
                token: generateToken(user.id) 
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        res.status(200).json({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            phone: user.phone,
            gender: user.gender,
            licenseNumber: user.licenseNumber,
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { firstName, lastName, email, phone, gender, licenseNumber } = req.body;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.gender = gender || user.gender;
        user.licenseNumber = licenseNumber || user.licenseNumber;

        const updatedUser = await user.save();
        res.json({ 
            id: updatedUser.id, 
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            email: updatedUser.email, 
            role: updatedUser.role,
            token: generateToken(updatedUser.id) 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerUser, loginUser, updateUserProfile, getProfile };