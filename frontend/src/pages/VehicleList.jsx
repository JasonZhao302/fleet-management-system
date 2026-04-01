import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const VehicleList = () => {
  const [vehicles, setVehicles] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  // Track screen width to switch between mobile and desktop layouts
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [formData, setFormData] = useState({
    vehicleId: '', plateNumber: '', model: '', type: '', year: '', status: 'Active'
  });

  useEffect(() => {
    fetchVehicles();
    // Listen for window resize to update mobile/desktop layout
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchVehicles = async () => {
    try {
      const res = await axiosInstance.get('/api/vehicles');
      setVehicles(res.data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVehicle) {
        await axiosInstance.put(`/api/vehicles/${editingVehicle._id}`, formData);
      } else {
        await axiosInstance.post('/api/vehicles', formData);
      }
      setShowForm(false);
      setEditingVehicle(null);
      setFormData({ vehicleId: '', plateNumber: '', model: '', type: '', year: '', status: 'Active' });
      fetchVehicles();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving vehicle');
    }
  };

  const handleEdit = (vehicle) => {
    setEditingVehicle(vehicle);
    setFormData({
      vehicleId: vehicle.vehicleId,
      plateNumber: vehicle.plateNumber,
      model: vehicle.model,
      type: vehicle.type,
      year: vehicle.year,
      status: vehicle.status,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/vehicles/${id}`);
      setShowDeleteConfirm(null);
      fetchVehicles();
    } catch (error) {
      alert('Error deleting vehicle');
    }
  };

  const statusColor = (status) => status === 'Active' ? '#27ae60' : '#e74c3c';

  return (
    <div style={{ display: 'flex', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Hide sidebar on mobile */}
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? '0' : '220px', flex: 1 }}>

        {/* Mobile Header */}
        {isMobile && (
          <div style={{ backgroundColor: '#1C1C1E', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#C0392B', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>RR</div>
              <span style={{ fontWeight: '600' }}>Vehicles</span>
            </div>
            <Sidebar isMobile={true} />
          </div>
        )}

        <div style={{ padding: isMobile ? '16px' : '32px' }}>
          {/* Page heading and Add button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '4px' }}>Vehicles</h1>
              <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>RedRoad Logistics / Vehicles</p>
            </div>
            <button
              onClick={() => { setShowForm(true); setEditingVehicle(null); setFormData({ vehicleId: '', plateNumber: '', model: '', type: '', year: '', status: 'Active' }); }}
              style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: isMobile ? '8px 14px' : '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: isMobile ? '13px' : '14px' }}
            >
              + Add
            </button>
          </div>

          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: '600' }}>All Vehicles</div>

            {vehicles.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No vehicles yet. Add your first vehicle.</div>
            ) : isMobile ? (
              /* Mobile — card layout */
              <div style={{ padding: '12px' }}>
                {vehicles.map((vehicle) => (
                  <div key={vehicle._id} style={{ backgroundColor: '#f9f9f9', borderRadius: '8px', padding: '14px', marginBottom: '10px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '600', fontSize: '14px' }}>{vehicle.vehicleId}</span>
                      <span style={{ backgroundColor: statusColor(vehicle.status), color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px' }}>
                        {vehicle.status}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                      {vehicle.model} — {vehicle.type}
                    </div>
                    <div style={{ fontSize: '13px', color: '#666', marginBottom: '10px' }}>
                      Plate: {vehicle.plateNumber} | Year: {vehicle.year}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => handleEdit(vehicle)} style={{ flex: 1, backgroundColor: '#3498db', color: 'white', border: 'none', padding: '7px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm(vehicle._id)} style={{ flex: 1, backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '7px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Desktop — table layout */
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                    {['Vehicle ID', 'Plate No.', 'Model', 'Type', 'Year', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#666' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{vehicle.vehicleId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{vehicle.plateNumber}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{vehicle.model}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{vehicle.type}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{vehicle.year}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ backgroundColor: statusColor(vehicle.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                          {vehicle.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => handleEdit(vehicle)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>
                          Edit
                        </button>
                        <button onClick={() => setShowDeleteConfirm(vehicle._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', width: '100%', maxWidth: '560px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{editingVehicle ? 'Edit Vehicle' : 'Add Vehicle'}</h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
              {editingVehicle ? 'Vehicle / Edit Vehicle' : 'Vehicle / Add Vehicle'}
            </p>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>* Required fields</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Vehicle ID *</label>
                  <input type="text" placeholder="e.g. VH-001" value={formData.vehicleId} onChange={(e) => setFormData({ ...formData, vehicleId: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Plate Number *</label>
                  <input type="text" placeholder="e.g. ABC-123" value={formData.plateNumber} onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Model *</label>
                  <input type="text" placeholder="e.g. Kenworth T610" value={formData.model} onChange={(e) => setFormData({ ...formData, model: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Type *</label>
                  <select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required>
                    <option value="">Select type</option>
                    <option value="Semi-trailer">Semi-trailer</option>
                    <option value="Rigid">Rigid</option>
                    <option value="B-Double">B-Double</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Year *</label>
                  <input type="number" placeholder="e.g. 2022" value={formData.year} onChange={(e) => setFormData({ ...formData, year: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }} required />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditingVehicle(null); }} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingVehicle ? 'Update Vehicle' : 'Save Vehicle'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Delete Vehicle</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Are you sure you want to delete this vehicle? This action cannot be undone.</p>
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

export default VehicleList;