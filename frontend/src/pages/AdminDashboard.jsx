import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import axiosInstance from '../axiosConfig';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ vehicles: 0, drivers: 0, activeTrips: 0, completedTrips: 0 });
  const [recentTrips, setRecentTrips] = useState([]);
  // Track screen width to switch between mobile and desktop layouts
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vehicles, drivers and trips data in parallel
    const fetchData = async () => {
      try {
        const [vehiclesRes, driversRes, tripsRes] = await Promise.all([
          axiosInstance.get('/api/vehicles'),
          axiosInstance.get('/api/drivers'),
          axiosInstance.get('/api/trips'),
        ]);
        const trips = tripsRes.data;

        // Calculate summary stats for the dashboard cards
        setStats({
          vehicles: vehiclesRes.data.length,
          drivers: driversRes.data.length,
          activeTrips: trips.filter(t => t.status === 'In Progress').length,
          completedTrips: trips.filter(t => t.status === 'Completed').length,
        });

        // Show only the 5 most recent trips in the table
        setRecentTrips(trips.slice(0, 5));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();

    // Listen for window resize to update mobile/desktop layout
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Return colour based on trip status
  const statusColor = (status) => {
    if (status === 'Completed') return '#27ae60';
    if (status === 'In Progress') return '#f39c12';
    if (status === 'Cancelled') return '#e74c3c';
    return '#3498db';
  };

  return (
    <div style={{ display: 'flex', backgroundColor: '#F5F5F5', minHeight: '100vh' }}>
      {/* Hide sidebar on mobile */}
      {!isMobile && <Sidebar />}

      <div style={{ marginLeft: isMobile ? '0' : '220px', flex: 1 }}>

        {/* Mobile Header — shown only on small screens */}
        {isMobile && (
        <div style={{ backgroundColor: '#1C1C1E', color: 'white', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ backgroundColor: '#C0392B', padding: '6px 10px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>RR</div>
            <span style={{ fontWeight: '600' }}>Dashboard</span>
            </div>
            <Sidebar isMobile={true} />
        </div>
        )}

        <div style={{ padding: isMobile ? '16px' : '32px' }}>

          {/* Page heading */}
          <div style={{ marginBottom: isMobile ? '16px' : '32px' }}>
            <h1 style={{ fontSize: isMobile ? '20px' : '24px', fontWeight: 'bold', marginBottom: '4px' }}>Dashboard</h1>
            <p style={{ color: '#666', fontSize: isMobile ? '13px' : '14px' }}>RedRoad Logistics / Overview</p>
          </div>

          {/* Stats cards — 2 columns on mobile, 4 on desktop */}
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: isMobile ? '12px' : '20px', marginBottom: isMobile ? '20px' : '32px' }}>
            {[
              { label: 'Total Vehicles', value: stats.vehicles, sub: 'In system' },
              { label: 'Total Drivers', value: stats.drivers, sub: 'In system' },
              { label: 'Active Trips', value: stats.activeTrips, sub: 'In progress' },
              { label: 'Completed', value: stats.completedTrips, sub: 'This month' },
            ].map((card) => (
              <div key={card.label} style={{ backgroundColor: 'white', padding: isMobile ? '16px' : '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <div style={{ fontSize: isMobile ? '24px' : '32px', fontWeight: 'bold', marginBottom: '4px' }}>{card.value}</div>
                <div style={{ fontSize: isMobile ? '12px' : '14px', fontWeight: '600', marginBottom: '2px' }}>{card.label}</div>
                <div style={{ fontSize: '12px', color: '#999' }}>{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Recent trips section */}
          <div style={{ backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: isMobile ? '16px' : '24px' }}>
            <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', marginBottom: '16px' }}>Recent Trips</h2>

            {recentTrips.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>No trips yet. Create your first trip.</p>
            ) : isMobile ? (
              /* Mobile — card layout instead of table */
              recentTrips.map((trip) => (
                <div key={trip._id} style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontWeight: '600', fontSize: '14px' }}>{trip.tripId}</span>
                    <span style={{ backgroundColor: statusColor(trip.status), color: 'white', padding: '3px 8px', borderRadius: '12px', fontSize: '11px' }}>
                      {trip.status}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: '#555', marginBottom: '4px' }}>
                    {trip.origin} → {trip.destination}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', marginBottom: '8px' }}>
                    Driver: {trip.driver?.firstName} {trip.driver?.lastName}
                  </div>
                  <button
                    onClick={() => navigate('/admin/trips')}
                    style={{ backgroundColor: '#C0392B', color: 'white', border: 'none', padding: '4px 12px', borderRadius: '4px', cursor: 'pointer', fontSize: '12px' }}
                  >
                    View
                  </button>
                </div>
              ))
            ) : (
              /* Desktop — table layout */
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
    </div>
  );
};

export default AdminDashboard;