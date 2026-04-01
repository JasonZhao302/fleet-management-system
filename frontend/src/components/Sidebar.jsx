import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = ({ isMobile = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  // Track whether mobile menu is open or closed
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Shared sidebar content used in both desktop and mobile drawer
  const SidebarContent = () => (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between' }}>
      <div>
        {/* Logo and brand */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid #333', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ backgroundColor: '#C0392B', color: 'white', padding: '8px', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            RR
          </div>
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '16px' }}>RedRoad</div>
            <div style={{ fontSize: '12px', color: '#999' }}>Logistics</div>
          </div>
          {/* Close button on mobile */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(false)}
              style={{ marginLeft: 'auto', backgroundColor: 'transparent', color: '#999', border: 'none', cursor: 'pointer', fontSize: '20px' }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Navigation links */}
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
                  onClick={() => setMenuOpen(false)}
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

      {/* User info and logout */}
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

  // Mobile version — hamburger button + slide-out drawer
  if (isMobile) {
    return (
      <>
        {/* Hamburger button in top right */}
        <button
          onClick={() => setMenuOpen(true)}
          style={{ backgroundColor: 'transparent', border: 'none', color: 'white', fontSize: '22px', cursor: 'pointer', padding: '4px' }}
        >
          ☰
        </button>

        {/* Dark overlay when menu is open */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 998 }}
          />
        )}

        {/* Slide-out drawer */}
        <div style={{
          position: 'fixed',
          top: 0,
          left: menuOpen ? 0 : '-260px',
          width: '260px',
          height: '100vh',
          backgroundColor: '#1C1C1E',
          color: 'white',
          zIndex: 999,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
        }}>
          <SidebarContent />
        </div>
      </>
    );
  }

  // Desktop version — fixed sidebar
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
      <SidebarContent />
    </div>
  );
};

export default Sidebar;