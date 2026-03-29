const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
    vehicleId: { type: String, required: true, unique: true },
    plateNumber: { type: String, required: true, unique: true },
    model: { type: String, required: true },
    type: { type: String, required: true, enum: ['Semi-trailer', 'Rigid', 'B-Double'] },
    year: { type: Number, required: true },
    status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);