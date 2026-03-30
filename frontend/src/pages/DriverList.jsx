import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const DriverList = () => {
  const [drivers, setDrivers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', password: '',
    phone: '', licenseNumber: '', dateOfBirth: '', status: 'Active'
    });

  const fetchDrivers = async () => {
    try {
      const res = await axiosInstance.get('/api/drivers');
      setDrivers(res.data);
    } catch (error) {
      console.error('Error fetching drivers:', error);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDriver) {
        await axiosInstance.put(`/api/drivers/${editingDriver._id}`, formData);
      } else {
        await axiosInstance.post('/api/drivers', formData);
      }
      setShowForm(false);
      setEditingDriver(null);
      setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', licenseNumber: '', dateOfBirth: '', status: 'Active' });
      fetchDrivers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error saving driver');
    }
  };

  const handleEdit = (driver) => {
    setEditingDriver(driver);
    setFormData({
      firstName: driver.firstName,
      lastName: driver.lastName,
      email: driver.email,
      password: '',
      phone: driver.phone || '',
      licenseNumber: driver.licenseNumber || '',
      dateOfBirth: driver.dateOfBirth ? driver.dateOfBirth.split('T')[0] : '',
      status: driver.status,
    });
    setShowForm(true);
};

  const handleDelete = async (id) => {
    try {
      await axiosInstance.delete(`/api/drivers/${id}`);
      setShowDeleteConfirm(null);
      fetchDrivers();
    } catch (error) {
      alert('Error deleting driver');
    }
  };

  const statusColor = (status) => status === 'Active' ? '#27ae60' : '#e74c3c';

  return (
    <div style={{ display: 'flex', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ marginLeft: '220px', padding: '32px', flex: 1 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Drivers</h1>
            <p style={{ color: '#666' }}>RedRoad Logistics / Drivers</p>
          </div>
          <button
            onClick={() => { setShowForm(true); setEditingDriver(null); setFormData({ firstName: '', lastName: '', email: '', password: '', phone: '', licenseNumber: '', dateOfBirth: '', status: 'Active' }); }}
            style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
          >
            + Add Driver
          </button>
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: '600' }}>All Drivers</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                {['Full Name', 'Email', 'Phone', 'License No.', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#666' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {drivers.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No drivers yet. Add your first driver.</td>
                </tr>
              ) : (
                drivers.map((driver) => (
                  <tr key={driver._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{driver.firstName} {driver.lastName}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{driver.email}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{driver.phone || '-'}</td>
                    <td style={{ padding: '12px 16px', fontSize: '14px' }}>{driver.licenseNumber || '-'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: statusColor(driver.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                        {driver.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => handleEdit(driver)} style={{ backgroundColor: '#3498db', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', marginRight: '8px' }}>
                        Edit
                      </button>
                      <button onClick={() => setShowDeleteConfirm(driver._id)} style={{ backgroundColor: '#e74c3c', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
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
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '560px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '4px' }}>{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
            <p style={{ color: '#666', marginBottom: '24px', fontSize: '14px' }}>
              {editingDriver ? 'Driver / Edit Driver' : 'Driver / Add Driver'}
            </p>
            <p style={{ fontSize: '13px', color: '#999', marginBottom: '16px' }}>* Required fields</p>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>First Name *</label>
                    <input
                        type="text" placeholder="e.g. James"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                        required
                    />
                    </div>
                    <div>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Last Name *</label>
                    <input
                        type="text" placeholder="e.g. Smith"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                        required
                    />
                    </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Email *</label>
                  <input
                    type="email" placeholder="e.g. james@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Phone Number *</label>
                  <input
                    type="text" placeholder="e.g. 0412 345 678"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>License No. *</label>
                  <input
                    type="text" placeholder="e.g. LIC-001"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Date of Birth *</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Status *</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
                {!editingDriver && (
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>Password *</label>
                    <input
                      type="password" placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
                      required={!editingDriver}
                    />
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" onClick={() => { setShowForm(false); setEditingDriver(null); }} style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}>
                  Cancel
                </button>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>
                  {editingDriver ? 'Update Driver' : 'Save Driver'}
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
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '12px' }}>Delete Driver</h2>
            <p style={{ color: '#666', marginBottom: '24px' }}>Are you sure you want to delete this driver? This action cannot be undone.</p>
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

export default DriverList;