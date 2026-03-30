import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const adminLinks = [
    { path: '/admin/dashboard', label: 'Dashboard', section: 'MAIN' },
    { path: '/admin/vehicles', label: 'Vehicles', section: 'MANAGE' },
    { path: '/admin/drivers', label: 'Drivers', section: 'MANAGE' },
    { path: '/admin/trips', label: 'Trips', section: 'MANAGE' },
  ];

  const driverLinks = [
    { path: '/driver/dashboard', label: 'My Trips', section: 'MAIN' },
  ];

  const links = user?.role === 'admin' ? adminLinks : driverLinks;

  const sections = [...new Set(links.map(l => l.section))];

  return (
    <div style={{
      width: '220px',
      minHeight: '100vh',
      backgroundColor: '#1C1C1E',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'fixed',
      top: 0,
      left: 0,
    }}>
      <div>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#C0392B', color: 'white', padding: '8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            RR
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>RedRoad</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Logistics</div>
          </div>
        </div>

        <nav style={{ padding: '16px 0' }}>
          {sections.map(section => (
            <div key={section}>
              <div style={{ padding: '8px 20px', fontSize: '11px', color: '#666', fontWeight: '600', letterSpacing: '1px' }}>
                {section}
              </div>
              {links.filter(l => l.section === section).map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 20px',
                    color: location.pathname === link.path ? 'white' : '#999',
                    backgroundColor: location.pathname === link.path ? '#C0392B' : 'transparent',
                    textDecoration: 'none',
                    fontSize: '14px',
                    fontWeight: location.pathname === link.path ? '600' : '400',
                    borderRadius: '6px',
                    margin: '2px 10px',
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: location.pathname === link.path ? 'white' : '#666', display: 'inline-block' }}></span>
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </div>

      <div style={{ padding: '20px', borderTop: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: '#C0392B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', flexShrink: 0 }}>
            {user?.firstName?.[0]}{user?.lastName?.[0]}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'white', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.firstName} {user?.lastName}
            </div>
            <div style={{ fontSize: '11px', color: '#999', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
            </div>
        </div>
        <button
            onClick={handleLogout}
            style={{ backgroundColor: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: '12px', flexShrink: 0 }}
        >
            Logout
        </button>
        </div>
    </div>
  );
};

export default Sidebar;