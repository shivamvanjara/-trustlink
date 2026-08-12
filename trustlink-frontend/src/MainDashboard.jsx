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
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ 
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(6, 182, 212, 0.25))', 
              border: '1px solid rgba(16, 185, 129, 0.4)', 
              padding: '10px', 
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 22px rgba(16, 185, 129, 0.35)'
            }}>
              <ShieldCheck size={26} color="#34d399"/>
            </div>
            <h2 style={{ margin: 0 }}>TrustLink</h2>
          </div>

          <div className="header-links" style={{ display: 'flex', gap: '22px', fontSize: '0.88rem', fontWeight: '600' }}>
            <Link to="/about" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>About</Link>
            <Link to="/how-it-works" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>Protocol</Link>
            <Link to="/future-scope" style={{ textDecoration: 'none', color: '#94a3b8', transition: 'color 0.2s' }}>Roadmap</Link>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.03)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block', boxShadow: '0 0 10px #10b981' }}></span>
              <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#f8fafc' }}>
                {user.profile?.fullName || user.profile?.companyName || user.email}
              </span>
            </div>
          )}
          <span className="role-badge" style={{ 
            background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : role === 'provider' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)', 
            color: '#fff' 
          }}>
            {role} protocol
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

