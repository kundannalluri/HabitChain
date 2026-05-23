import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Activity, Trophy, User as UserIcon } from 'lucide-react';

const navLinkStyle = {
  color: 'var(--text-sub)',
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '0.4rem',
  fontSize: '0.875rem',
  fontWeight: 500,
  padding: '0.4rem 0.75rem',
  borderRadius: 'var(--radius-sm)',
  transition: 'color 0.15s, background 0.15s'
};

const primaryNavBtnStyle = {
  ...navLinkStyle,
  padding: '0.45rem 1.1rem',
  background: 'var(--primary)',
  color: '#ffffff',
  border: 'none',
  borderRadius: '99px',
  boxShadow: '0 2px 8px rgba(37, 99, 235, 0.25)',
  transition: 'transform 0.2s, box-shadow 0.2s, background 0.2s'
};

export const Layout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getBtnStyle = (path) => {
    const isActive = location.pathname.startsWith(path);
    return {
      ...primaryNavBtnStyle,
      background: isActive ? '#1e3a8a' : 'var(--primary)',
      boxShadow: isActive ? 'inset 0 3px 6px rgba(0,0,0,0.2)' : '0 2px 8px rgba(37, 99, 235, 0.25)',
      transform: isActive ? 'translateY(1px)' : 'none',
      color: isActive ? '#e0e7ff' : '#ffffff'
    };
  };

  const onEnter = (e, path) => {
    if (location.pathname.startsWith(path)) return;
    e.currentTarget.style.background = 'var(--primary-light)'; 
    e.currentTarget.style.transform = 'translateY(-1px)';
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.35)';
  };

  const onLeave = (e, path) => {
    if (location.pathname.startsWith(path)) return;
    e.currentTarget.style.background = 'var(--primary)'; 
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.25)';
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav className="nav-container" style={{ margin: 0, borderRadius: 0 }}>
        <span className="logo" style={{ fontSize: '1.4rem', cursor: 'default', userSelect: 'none' }}>HabitChain</span>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <Link to="/dashboard" style={getBtnStyle('/dashboard')}
            onMouseEnter={e => onEnter(e, '/dashboard')}
            onMouseLeave={e => onLeave(e, '/dashboard')}>
            <Activity size={16} /> Dashboard
          </Link>
          <Link to="/leaderboard" style={getBtnStyle('/leaderboard')}
            onMouseEnter={e => onEnter(e, '/leaderboard')}
            onMouseLeave={e => onLeave(e, '/leaderboard')}>
            <Trophy size={16} /> Leaderboard
          </Link>
          <Link to="/profile" style={getBtnStyle('/profile')}
            onMouseEnter={e => onEnter(e, '/profile')}
            onMouseLeave={e => onLeave(e, '/profile')}>
            <UserIcon size={15} /> Profile
          </Link>
        </div>
      </nav>
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '1.5rem 2rem', width: '100%', flex: 1 }}>
        {children}
      </main>
    </div>
  );
};
