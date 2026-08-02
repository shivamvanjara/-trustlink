import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './MainDashboard.css';
import ProfileSettings from './ProfileSettings';
import SeekerDashboard from './components/SeekerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import HistoryDashboard from './components/HistoryDashboard';

const MainDashboard = ({ role, isDarkMode, user, setUser, socket }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dashboard-dark' : 'dashboard-light'}`}>
      <header className="dashboard-header">
        <div style={{display: 'flex', gap: '40px', alignItems: 'baseline'}}>
          <h2>TrustLink</h2>
          <div className="header-links" style={{display: 'flex', gap: '20px', color: 'var(--accent-blue)', fontSize: '0.85rem', fontWeight: 'bold'}}>
            <Link to="/about" style={{textDecoration: 'none', color: 'var(--text-secondary)'}}>About</Link>
            <Link to="/how-it-works" style={{textDecoration: 'none', color: 'var(--text-secondary)'}}>Protocol</Link>
            <Link to="/future-scope" style={{textDecoration: 'none', color: 'var(--text-secondary)'}}>Roadmap</Link>
          </div>
        </div>
        <div style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
          {user && <span style={{fontWeight: '700', fontSize: '0.9rem', opacity: 0.8}}>{user.profile?.fullName || user.email}</span>}
          <span className="role-badge" style={{ background: role === 'seeker' ? 'var(--accent-blue)' : 'var(--success)', color: '#fff' }}>
            {role + ' dashboard'}
          </span>
        </div>
      </header>
      
      <div style={{display: 'flex', gap: '12px', marginBottom: '30px', justifyContent: 'center', flexWrap: 'wrap'}}>
        <button 
          className={`action-btn ${activeTab === 'dashboard' ? '' : 'secondary-btn'}`}
          onClick={() => setActiveTab('dashboard')}
        >
          🏠 My Dashboard
        </button>
        <button 
          className={`action-btn ${activeTab === 'history' ? '' : 'secondary-btn'}`}
          onClick={() => setActiveTab('history')}
        >
          📋 Work History
        </button>
        <button 
          className={`action-btn ${activeTab === 'profile' ? '' : 'secondary-btn'}`}
          onClick={() => setActiveTab('profile')}
        >
          ⚙️ Manage Profile
        </button>
      </div>

      {activeTab === 'dashboard' && (
        role === 'seeker' ? <SeekerDashboard user={user} socket={socket} /> : <ProviderDashboard user={user} socket={socket} />
      )}
      {activeTab === 'history' && (
        <HistoryDashboard user={user} role={role} />
      )}
      {activeTab === 'profile' && (
        <ProfileSettings user={user} setUser={setUser} role={role} />
      )}
    </div>
  );
};

export default MainDashboard;
