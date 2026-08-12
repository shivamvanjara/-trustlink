import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, LayoutDashboard, History, UserCog, Sparkles } from 'lucide-react';
import './MainDashboard.css';
import ProfileSettings from './ProfileSettings';
import SeekerDashboard from './components/SeekerDashboard';
import ProviderDashboard from './components/ProviderDashboard';
import HistoryDashboard from './components/HistoryDashboard';
import AdminDashboard from './components/AdminDashboard';

const MainDashboard = ({ role, isDarkMode, user, setUser, socket }) => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className={`dashboard-container ${isDarkMode ? 'dashboard-dark' : 'dashboard-light'}`}>
      
      {/* Ultra-Premium Glass Navigation Header */}
      <header className="dashboard-header">
        <div style={{ display: 'flex', gap: '35px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h2 style={{ margin: 0, fontSize: '1.55rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.03em' }}>TrustLink</h2>
          </div>

          <div className="header-links" style={{ display: 'flex', gap: '22px', fontSize: '0.88rem', fontWeight: '600' }}>
            <Link to="/about" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>About</Link>
            <Link to="/how-it-works" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>Protocol</Link>
            <Link to="/future-scope" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>Roadmap</Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#1e293b', padding: '6px 14px', borderRadius: '10px', border: '1px solid #334155' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
              <span style={{ fontWeight: '600', fontSize: '0.88rem', color: '#f8fafc' }}>
                {user.profile?.fullName || user.profile?.companyName || user.email}
              </span>
            </div>
          )}
          <span style={{ 
            background: '#1e293b', 
            color: '#f8fafc',
            border: '1px solid #334155',
            borderRadius: '10px',
            padding: '5px 14px',
            fontSize: '0.78rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.04em'
          }}>
            {role}
          </span>
        </div>
      </header>
      
      {/* Bespoke Interactive Tab Switcher */}
      {role !== 'admin' && (
        <div style={{
          display: 'inline-flex',
          gap: '8px',
          marginBottom: '32px',
          background: 'rgba(15, 23, 42, 0.6)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '20px',
          padding: '6px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
        }}>
          <button 
            type="button"
            className={`action-btn ${activeTab === 'dashboard' ? '' : 'secondary-btn'}`}
            style={{ 
              borderRadius: '14px', 
              padding: '12px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.9rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={17} /> My Dashboard
          </button>

          <button 
            type="button"
            className={`action-btn ${activeTab === 'history' ? '' : 'secondary-btn'}`}
            style={{ 
              borderRadius: '14px', 
              padding: '12px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.9rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setActiveTab('history')}
          >
            <History size={17} /> Work History
          </button>

          <button 
            type="button"
            className={`action-btn ${activeTab === 'profile' ? '' : 'secondary-btn'}`}
            style={{ 
              borderRadius: '14px', 
              padding: '12px 24px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              fontSize: '0.9rem',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
            onClick={() => setActiveTab('profile')}
          >
            <UserCog size={17} /> Manage Profile
          </button>
        </div>
      )}

      {/* Tab Views */}
      {activeTab === 'dashboard' && (
        role === 'admin' ? (
          <AdminDashboard user={user} socket={socket} />
        ) : role === 'seeker' ? (
          <SeekerDashboard user={user} socket={socket} />
        ) : (
          <ProviderDashboard user={user} socket={socket} />
        )
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

