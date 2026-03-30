import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const DriverDashboard = () => {
  const [trips, setTrips] = useState([]);
  const [showStatusModal, setShowStatusModal] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const fetchMyTrips = async () => {
    try {
      const res = await axiosInstance.get('/api/trips/my-trips');
      setTrips(res.data);
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  useEffect(() => {
    fetchMyTrips();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleUpdateStatus = async () => {
    try {
      await axiosInstance.patch(`/api/trips/${showStatusModal._id}/status`, { status: newStatus });
      setShowStatusModal(null);
      setNewStatus('');
      fetchMyTrips();
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating status');
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
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? '0' : '220px', padding: isMobile ? '16px' : '32px', flex: 1 }}>

        {/* Mobile Header */}
        {isMobile && (
          <div style={{ backgroundColor: '#1C1C1E', color: 'white', padding: '16px', margin: '-16px -16px 16px -16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ backgroundColor: '#C0392B', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>RR</div>
              <span style={{ fontWeight: '600' }}>My Trips</span>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '13px', fontWeight: 'bold' }}>
              DV
            </div>
          </div>
        )}

        {/* Desktop Header */}
        {!isMobile && (
          <div style={{ marginBottom: '24px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>My Trips</h1>
            <p style={{ color: '#666' }}>Driver Panel / Assigned Trips</p>
          </div>
        )}

        {/* Mobile Card Layout */}
        {isMobile ? (
          <div>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
              Assigned trips <span style={{ backgroundColor: '#C0392B', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '12px', marginLeft: '8px' }}>{trips.length} trips</span>
            </p>
            {trips.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#999', backgroundColor: 'white', borderRadius: '8px' }}>
                No trips assigned to you yet.
              </div>
            ) : (
              trips.map((trip) => (
                <div key={trip._id} style={{ backgroundColor: 'white', borderRadius: '8px', padding: '16px', marginBottom: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{trip.tripId}</span>
                    <span style={{ backgroundColor: statusColor(trip.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                      {trip.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{trip.origin}</div>
                    </div>
                    <div style={{ flex: 1, textAlign: 'center', color: '#999', fontSize: '18px' }}>→</div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{trip.destination}</div>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px', fontSize: '13px', color: '#666' }}>
                    <div>Vehicle: <span style={{ color: '#333', fontWeight: '500' }}>{trip.vehicle?.plateNumber}</span></div>
                    <div>Date: <span style={{ color: '#333', fontWeight: '500' }}>{trip.scheduledDate ? new Date(trip.scheduledDate).toLocaleDateString() : '-'}</span></div>
                  </div>
                  <button
                    onClick={() => { setShowStatusModal(trip); setNewStatus(trip.status); }}
                    style={{ width: '100%', backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '10px', borderRadius: '4px', cursor: 'pointer', fontWeight: '600', fontSize: '14px' }}
                  >
                    Update Status
                  </button>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop Table Layout */
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0', fontWeight: '600' }}>
              My assigned trips
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Trip ID', 'Origin', 'Destination', 'Vehicle', 'Date', 'Status', 'Action'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', fontSize: '13px', color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {trips.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
                      No trips assigned to you yet.
                    </td>
                  </tr>
                ) : (
                  trips.map((trip) => (
                    <tr key={trip._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.tripId}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.origin}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.destination}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>{trip.vehicle?.plateNumber}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px' }}>
                        {trip.scheduledDate ? new Date(trip.scheduledDate).toLocaleDateString() : '-'}
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ backgroundColor: statusColor(trip.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                          {trip.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button
                          onClick={() => { setShowStatusModal(trip); setNewStatus(trip.status); }}
                          style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                        >
                          Update Status
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ backgroundColor: 'white', padding: '32px', borderRadius: '8px', width: '100%', maxWidth: '420px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px' }}>Update trip status</h2>
            <p style={{ color: '#666', fontSize: '14px', marginBottom: '24px' }}>
              Trip<br />
              <strong>{showStatusModal.tripId} — {showStatusModal.origin} to {showStatusModal.destination}</strong>
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: '500' }}>
                New status *
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', boxSizing: 'border-box' }}
              >
                <option value="Scheduled">Scheduled</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button
                onClick={() => { setShowStatusModal(null); setNewStatus(''); }}
                style={{ padding: '10px 20px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', backgroundColor: 'white' }}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                style={{ padding: '10px 20px', backgroundColor: '#C0392B', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;