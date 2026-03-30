import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const TripList = () => {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    origin: '', destination: '', scheduledDate: '',
    vehicle: '', driver: '', notes: '', status: 'Scheduled'
});

  const fetchAll = async () => {
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        axiosInstance.get('/api/trips'),
        axiosInstance.get('/api/vehicles'),
        axiosInstance.get('/api/drivers'),
      ]);
      setTrips(tripsRes.data);
      setVehicles(vehiclesRes.data);
      setDrivers(driversRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTrip) {
        await axiosInstance.put(`/api/trips/${editingTrip._id}`, formData);
      } else {
        await axiosInstance.post('/api/trips', formData);
      }
      setShowForm(false);
      setEditingTrip(null);
      setFormData({ origin: '', destination: '', scheduledDate: '', vehicle: '', driver: '', notes: '', status: 'Scheduled' });
      fetchAll();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving trip');
    }
  };

  const handleEdit = (trip) => {
    setEditingTrip(trip);
    setFormData({
      tripId: trip.tripId,
      origin: trip.origin,
      destination: trip.destination,
      scheduledDate: trip.scheduledDate ? trip.scheduledDate.split('T')[0] : '',
      vehicle: trip.vehicle?._id || '',
      driver: trip.driver?._id || '',
      notes: trip.notes || '',
      status: trip.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/trips/${id}`);
      setShowDeleteConfirm(null);
      fetchAll();
    } catch (error) {
      alert('Error deleting trip');
    }
  };

  const statusColor = (status) => {
    if (status === 'Completed') return '#27ae60';
    if (status === 'In Progress') return '#f39c12';
    if (status === 'Cancelled') return '#e74c3c';
    return '#3498db';
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', padding: '32px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Trips</h1>
            <p style={{ color: '#666' }}>RedRoad Logistics / Trips</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingTrip(null); setFormData({ tripId: '', origin: '', destination: '', scheduledDate: '', vehicle: '', driver: '', notes: '', status: 'Scheduled' }); }}
            style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Create Trip
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: '600' }}>All Trips</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                {['Trip ID', 'Origin', 'Destination', 'Driver', 'Vehicle', 'Date', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#666' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trips.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No trips yet. Create your first trip.</td>
                </tr>
              ) : (
                trips.map((trip) => (
                  <tr key={trip._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.tripId}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.origin}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.destination}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.driver?.firstName} {trip.driver?.lastName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.vehicle?.plateNumber}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.scheduledDate ? new Date(trip.scheduledDate).toLocaleDateString() : '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: statusColor(trip.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleEdit(trip)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>
                        Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm(trip._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{editingTrip ? 'Edit Trip' : 'Create Trip'}</h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
              {editingTrip ? 'Trip / Edit Trip' : 'Trip / Create Trip'}
            </p>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>* Required fields</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Origin *</label>
                  <input
                    type="text" placeholder="e.g. Sydney"
                    value={formData.origin}
                    onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Destination *</label>
                  <input
                    type="text" placeholder="e.g. Melbourne"
                    value={formData.destination}
                    onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Scheduled Date *</label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Assign Vehicle *</label>
                  <select
                    value={formData.vehicle}
                    onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  >
                    <option value="">Select vehicle</option>
                    {vehicles.map(v => (
                      <option key={v._id} value={v._id}>{v.vehicleId} — {v.plateNumber}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Assign Driver *</label>
                  <select
                    value={formData.driver}
                    onChange={(e) => setFormData({ ...formData, driver: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  >
                    <option value="">Select a driver</option>
                    {drivers.map(d => (
                      <option key={d._id} value={d._id}>{d.firstName} {d.lastName}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Notes</label>
                  <textarea
                    placeholder="Optional notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box', height: '80px', resize: 'vertical' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditingTrip(null); }} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingTrip ? 'Update Trip' : 'Create Trip'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Delete Trip</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Are you sure you want to delete this trip? This action cannot be undone.</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button onClick={() => setShowDeleteConfirm(null)} style={{ padding: '10px 24px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>
                Cancel
              </button>
              <button onClick={() => handleDelete(showDeleteConfirm)} style={{ padding: '10px 24px', backgroundColor: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripList;