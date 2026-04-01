const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Generate a JWT token for the user with 30 day expiry
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// @desc    Register a new user (admin or driver)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { firstName, lastName, email, password, role, phone, gender, licenseNumber, dateOfBirth } = req.body;
    try {
        // Check if user with this email already exists
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Only include optional fields if they have values
        // This prevents Mongoose enum/Date validation errors on empty strings
        const userData = { firstName, lastName, email, password, role };
        if (phone) userData.phone = phone;
        if (gender) userData.gender = gender;
        if (licenseNumber) userData.licenseNumber = licenseNumber;
        if (dateOfBirth) userData.dateOfBirth = dateOfBirth;

        const user = await User.create(userData);

        // Return user details with JWT token
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

// @desc    Login user and return JWT token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        // Find user by email and verify password using bcrypt
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

// @desc    Get logged-in user profile
// @route   GET /api/auth/profile
// @access  Private
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

// @desc    Update logged-in user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Update only the fields provided in the request body
        const { firstName, lastName, email, phone, gender, licenseNumber } = req.body;
        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.phone = phone || user.phone;
        user.gender = gender || user.gender;
        user.licenseNumber = licenseNumber || user.licenseNumber;

        const updatedUser = await user.save();

        // Return updated user details with a fresh JWT token
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