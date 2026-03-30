import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ vehicles: 0, drivers: 0, activeTrips: 0, completedTrips: 0 });
  const [recentTrips, setRecentTrips] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
          axiosInstance.get('/api/vehicles'),
          axiosInstance.get('/api/drivers'),
          axiosInstance.get('/api/trips'),
        ]);

        const trips = tripsRes.data;
        setStats({
          vehicles: vehiclesRes.data.length,
          drivers: driversRes.data.length,
          activeTrips: trips.filter(t => t.status === 'In Progress').length,
          completedTrips: trips.filter(t => t.status === 'Completed').length,
        });
        setRecentTrips(trips.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

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
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '8px' }}>Dashboard</h1>
        <p style={{ color: '#666', marginBottom: '32px' }}>RedRoad Logistics / Overview</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '32px' }}>
          {[
            { label: 'Total Vehicles', value: stats.vehicles, sub: 'In system' },
            { label: 'Total Drivers', value: stats.drivers, sub: 'In system' },
            { label: 'Active Trips', value: stats.activeTrips, sub: 'In progress' },
            { label: 'Completed', value: stats.completedTrips, sub: 'This month' },
          ].map((card) => (
            <div key={card.label} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '4px' }}>{card.value}</div>
              <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '2px' }}>{card.label}</div>
              <div style={{ fontSize: '12px', color: '#999' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>Recent Trips</h2>
          {recentTrips.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>No trips yet. Create your first trip.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f0f0f0' }}>
                  {['Trip ID', 'Origin', 'Destination', 'Driver', 'Vehicle', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '10px', fontSize: '13px', color: '#666' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTrips.map((trip) => (
                  <tr key={trip._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px 10px', fontSize: '14px' }}>{trip.tripId}</td>
                    <td style={{ padding: '12px 10px', fontSize: '14px' }}>{trip.origin}</td>
                    <td style={{ padding: '12px 10px', fontSize: '14px' }}>{trip.destination}</td>
                    <td style={{ padding: '12px 10px', fontSize: '14px' }}>{trip.driver?.firstName} {trip.driver?.lastName}</td>
                    <td style={{ padding: '12px 10px', fontSize: '14px' }}>{trip.vehicle?.plateNumber}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{ backgroundColor: statusColor(trip.status), color: 'white', padding: '4px 10px', borderRadius: '12px', fontSize: '12px' }}>
                        {trip.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <button onClick={() => navigate('/admin/trips')} style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}>
                        View
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
  );
};

export default AdminDashboard;