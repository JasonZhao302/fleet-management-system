const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Vehicle = require('../models/Vehicle');
const { getVehicles, addVehicle, updateVehicle, deleteVehicle } = require('../controllers/vehicleController');
const { expect } = chai;

describe('Vehicle Controller Tests', () => {

    describe('getVehicles', () => {
        it('should return all vehicles successfully', async () => {
            const mockVehicles = [
                { vehicleId: 'VH-001', plateNumber: 'ABC-123', model: 'Kenworth T610', type: 'Semi-trailer', year: 2022, status: 'Active' },
                { vehicleId: 'VH-002', plateNumber: 'XYZ-456', model: 'Mack Anthem', type: 'Rigid', year: 2021, status: 'Active' },
            ];
            const findStub = sinon.stub(Vehicle, 'find').resolves(mockVehicles);
            const req = {};
            const res = { json: sinon.spy() };

            await getVehicles(req, res);

            expect(findStub.calledOnce).to.be.true;
            expect(res.json.calledWith(mockVehicles)).to.be.true;
            findStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findStub = sinon.stub(Vehicle, 'find').throws(new Error('DB Error'));
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await getVehicles(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            findStub.restore();
        });
    });

    describe('addVehicle', () => {
        it('should create a new vehicle successfully', async () => {
            const mockVehicle = { _id: new mongoose.Types.ObjectId(), vehicleId: 'VH-001', plateNumber: 'ABC-123', model: 'Kenworth T610', type: 'Semi-trailer', year: 2022, status: 'Active' };
            const findOneStub = sinon.stub(Vehicle, 'findOne').resolves(null);
            const createStub = sinon.stub(Vehicle, 'create').resolves(mockVehicle);
            const req = { body: { vehicleId: 'VH-001', plateNumber: 'ABC-123', model: 'Kenworth T610', type: 'Semi-trailer', year: 2022, status: 'Active' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await addVehicle(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(mockVehicle)).to.be.true;
            findOneStub.restore();
            createStub.restore();
        });

        it('should return 400 if vehicle ID already exists', async () => {
            const findOneStub = sinon.stub(Vehicle, 'findOne').resolves({ vehicleId: 'VH-001' });
            const req = { body: { vehicleId: 'VH-001' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await addVehicle(req, res);

            expect(res.status.calledWith(400)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Vehicle ID already exists' })).to.be.true;
            findOneStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findOneStub = sinon.stub(Vehicle, 'findOne').throws(new Error('DB Error'));
            const req = { body: { vehicleId: 'VH-001' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await addVehicle(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            findOneStub.restore();
        });
    });

    describe('updateVehicle', () => {
        it('should update a vehicle successfully', async () => {
            const mockVehicle = {
                _id: new mongoose.Types.ObjectId(),
                vehicleId: 'VH-001',
                plateNumber: 'ABC-123',
                model: 'Kenworth T610',
                type: 'Semi-trailer',
                year: 2022,
                status: 'Active',
                save: sinon.stub().resolvesThis()
            };
            const findByIdStub = sinon.stub(Vehicle, 'findById').resolves(mockVehicle);
            const req = { params: { id: mockVehicle._id }, body: { status: 'Inactive' } };
            const res = { json: sinon.spy() };

            await updateVehicle(req, res);

            expect(findByIdStub.calledOnce).to.be.true;
            expect(res.json.calledOnce).to.be.true;
            findByIdStub.restore();
        });

        it('should return 404 if vehicle not found', async () => {
            const findByIdStub = sinon.stub(Vehicle, 'findById').resolves(null);
            const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await updateVehicle(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Vehicle not found' })).to.be.true;
            findByIdStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findByIdStub = sinon.stub(Vehicle, 'findById').throws(new Error('DB Error'));
            const req = { params: { id: new mongoose.Types.ObjectId() }, body: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await updateVehicle(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            findByIdStub.restore();
        });
    });

    describe('deleteVehicle', () => {
        it('should delete a vehicle successfully', async () => {
            const mockVehicle = {
                _id: new mongoose.Types.ObjectId(),
                deleteOne: sinon.stub().resolves()
            };
            const findByIdStub = sinon.stub(Vehicle, 'findById').resolves(mockVehicle);
            const req = { params: { id: mockVehicle._id } };
            const res = { json: sinon.spy() };

            await deleteVehicle(req, res);

            expect(findByIdStub.calledOnce).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Vehicle deleted successfully' })).to.be.true;
            findByIdStub.restore();
        });

        it('should return 404 if vehicle not found', async () => {
            const findByIdStub = sinon.stub(Vehicle, 'findById').resolves(null);
            const req = { params: { id: new mongoose.Types.ObjectId() } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await deleteVehicle(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Vehicle not found' })).to.be.true;
            findByIdStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findByIdStub = sinon.stub(Vehicle, 'findById').throws(new Error('DB Error'));
            const req = { params: { id: new mongoose.Types.ObjectId() } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await deleteVehicle(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            findByIdStub.restore();
        });
    });
});