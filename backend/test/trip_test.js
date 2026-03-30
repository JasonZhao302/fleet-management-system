const chai = require('chai');
const sinon = require('sinon');
const mongoose = require('mongoose');
const Trip = require('../models/Trip');
const { getTrips, createTrip, updateTrip, deleteTrip, updateTripStatus } = require('../controllers/tripController');
const { expect } = chai;

describe('Trip Controller Tests', () => {

    describe('getTrips', () => {
        it('should return all trips successfully', async () => {
            const mockTrips = [
                { tripId: 'FT-001', origin: 'Sydney', destination: 'Melbourne', status: 'Scheduled' },
                { tripId: 'FT-002', origin: 'Brisbane', destination: 'Gold Coast', status: 'In Progress' },
            ];
            const findStub = sinon.stub(Trip, 'find').returns({
                populate: sinon.stub().returns({
                    populate: sinon.stub().resolves(mockTrips)
                })
            });
            const req = {};
            const res = { json: sinon.spy() };

            await getTrips(req, res);

            expect(res.json.calledWith(mockTrips)).to.be.true;
            findStub.restore();
        });

        it('should return 500 if an error occurs', async () => {
            const findStub = sinon.stub(Trip, 'find').throws(new Error('DB Error'));
            const req = {};
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await getTrips(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            findStub.restore();
        });
    });

    describe('createTrip - Verify Trip Creation', () => {
        it('should create a trip successfully when vehicle and driver are provided', async () => {
            const vehicleId = new mongoose.Types.ObjectId();
            const driverId = new mongoose.Types.ObjectId();
            const mockTrip = {
                _id: new mongoose.Types.ObjectId(),
                tripId: 'FT-001',
                origin: 'Sydney',
                destination: 'Melbourne',
                scheduledDate: '2026-04-01',
                vehicle: vehicleId,
                driver: driverId,
                status: 'Scheduled'
            };

            const countStub = sinon.stub(Trip, 'countDocuments').resolves(0);
            const createStub = sinon.stub(Trip, 'create').resolves(mockTrip);
            const findByIdStub = sinon.stub(Trip, 'findById').returns({
                populate: sinon.stub().returns({
                    populate: sinon.stub().resolves(mockTrip)
                })
            });

            const req = { body: { origin: 'Sydney', destination: 'Melbourne', scheduledDate: '2026-04-01', vehicle: vehicleId, driver: driverId } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await createTrip(req, res);

            expect(res.status.calledWith(201)).to.be.true;
            expect(res.json.calledWith(mockTrip)).to.be.true;
            countStub.restore();
            createStub.restore();
            findByIdStub.restore();
        });

        it('should return 500 if vehicle is not provided', async () => {
            const countStub = sinon.stub(Trip, 'countDocuments').resolves(0);
            const createStub = sinon.stub(Trip, 'create').throws(new Error('vehicle is required'));

            const req = { body: { origin: 'Sydney', destination: 'Melbourne', scheduledDate: '2026-04-01', driver: new mongoose.Types.ObjectId() } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await createTrip(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'vehicle is required' })).to.be.true;
            countStub.restore();
            createStub.restore();
        });

        it('should return 500 if driver is not provided', async () => {
            const countStub = sinon.stub(Trip, 'countDocuments').resolves(0);
            const createStub = sinon.stub(Trip, 'create').throws(new Error('driver is required'));

            const req = { body: { origin: 'Sydney', destination: 'Melbourne', scheduledDate: '2026-04-01', vehicle: new mongoose.Types.ObjectId() } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await createTrip(req, res);

            expect(res.status.calledWith(500)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'driver is required' })).to.be.true;
            countStub.restore();
            createStub.restore();
        });
    });

    describe('updateTripStatus', () => {
        it('should update trip status successfully', async () => {
            const driverId = new mongoose.Types.ObjectId();
            const mockTrip = {
                _id: new mongoose.Types.ObjectId(),
                driver: driverId,
                status: 'Scheduled',
                save: sinon.stub().resolvesThis()
            };
            const findByIdStub = sinon.stub(Trip, 'findById').resolves(mockTrip);
            const req = { params: { id: mockTrip._id }, user: { id: driverId.toString() }, body: { status: 'In Progress' } };
            const res = { json: sinon.spy() };

            await updateTripStatus(req, res);

            expect(res.json.calledOnce).to.be.true;
            findByIdStub.restore();
        });

        it('should return 403 if driver is not authorised', async () => {
            const mockTrip = {
                _id: new mongoose.Types.ObjectId(),
                driver: new mongoose.Types.ObjectId(),
                status: 'Scheduled',
            };
            const findByIdStub = sinon.stub(Trip, 'findById').resolves(mockTrip);
            const req = { params: { id: mockTrip._id }, user: { id: new mongoose.Types.ObjectId().toString() }, body: { status: 'In Progress' } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await updateTripStatus(req, res);

            expect(res.status.calledWith(403)).to.be.true;
            expect(res.json.calledWithMatch({ message: 'Not authorised to update this trip' })).to.be.true;
            findByIdStub.restore();
        });

        it('should return 404 if trip not found', async () => {
            const findByIdStub = sinon.stub(Trip, 'findById').resolves(null);
            const req = { params: { id: new mongoose.Types.ObjectId() }, user: { id: new mongoose.Types.ObjectId().toString() }, body: {} };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await updateTripStatus(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            findByIdStub.restore();
        });
    });

    describe('deleteTrip', () => {
        it('should delete a trip successfully', async () => {
            const mockTrip = {
                _id: new mongoose.Types.ObjectId(),
                deleteOne: sinon.stub().resolves()
            };
            const findByIdStub = sinon.stub(Trip, 'findById').resolves(mockTrip);
            const req = { params: { id: mockTrip._id } };
            const res = { json: sinon.spy() };

            await deleteTrip(req, res);

            expect(res.json.calledWithMatch({ message: 'Trip deleted successfully' })).to.be.true;
            findByIdStub.restore();
        });

        it('should return 404 if trip not found', async () => {
            const findByIdStub = sinon.stub(Trip, 'findById').resolves(null);
            const req = { params: { id: new mongoose.Types.ObjectId() } };
            const res = { status: sinon.stub().returnsThis(), json: sinon.spy() };

            await deleteTrip(req, res);

            expect(res.status.calledWith(404)).to.be.true;
            findByIdStub.restore();
        });
    });
});