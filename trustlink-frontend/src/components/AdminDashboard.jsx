import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  ShieldCheck, Activity, Users, DollarSign, TrendingUp, AlertTriangle, 
  CheckCircle, RefreshCw, Award, ArrowUpRight, Scale, Search, ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const API_BASE = API_BASE_URL;

const AdminDashboard = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('pnl'); // 'overview' | 'pnl' | 'decorum' | 'users'
  const [metricsData, setMetricsData] = useState(null);
  const [bonds, setBonds] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Breach resolution modal state
  const [selectedBond, setSelectedBond] = useState(null);
  const [actionType, setActionType] = useState('PENALIZE_SEEKER');
  const [penaltyAmount, setPenaltyAmount] = useState(1500);
  const [trustPenalty, setTrustPenalty] = useState(15);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [metricsRes, bondsRes, usersRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/metrics`),
        axios.get(`${API_BASE}/admin/bonds`),
        axios.get(`${API_BASE}/admin/users`)
      ]);
      setMetricsData(metricsRes.data);
      setBonds(bondsRes.data);
      setUsersList(usersRes.data);
    } catch (err) {
      console.error("Admin data fetch error:", err);
      toast.error("Failed to load admin operations data");
    } finally {
      setLoading(false);
    }
  };

  const handleResolveBreach = async (e) => {
    e.preventDefault();
    if (!selectedBond) return;
    setResolving(true);
    try {
      const res = await axios.post(`${API_BASE}/admin/bonds/resolve-breach`, {
        bondId: selectedBond._id,
        action: actionType,
        penaltyAmount,
        trustScorePenalty: trustPenalty,
        resolutionNotes
      });
      toast.success(res.data.message);
      setSelectedBond(null);
      fetchAdminData();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resolve breach");
    } finally {
      setResolving(false);
    }
  };

  const handleUpdateTrustScore = async (userId, currentScore, delta) => {
    const newScore = Math.max(0, Math.min(100, currentScore + delta));
    try {
      await axios.patch(`${API_BASE}/admin/users/${userId}/trust-score`, { trustScore: newScore });
      toast.success(`Trust Score updated to ${newScore}`);
      setUsersList(prev => prev.map(u => u._id === userId ? { ...u, trustScore: newScore } : u));
    } catch (err) {
      toast.error("Failed to update trust score");
    }
  };

  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.role?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const m = metricsData?.metrics || {};
  const pnl = metricsData?.pnl || {};

  return (
    <div style={{ padding: '30px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Top Protocol Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '35px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(59, 130, 246, 0.15)', border: '1px solid #3b82f6', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: '#60a5fa', fontWeight: 'bold', marginBottom: '10px' }}>
            <ShieldCheck size={16} /> ORGANIZATION PROTOCOL CONTROL
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', margin: 0, letterSpacing: '-0.04em' }}>
            Operations & Financial Control Center
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', margin: '5px 0 0' }}>
            Real-time Decorum Breach Management, Profit & Loss Ledger, and Platform Protocol Governance.
          </p>
        </div>
        <button 
          onClick={fetchAdminData} 
          className="action-btn"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px', borderRadius: '12px' }}
        >
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Admin Tab Selector */}
      <div style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '6px', marginBottom: '35px' }}>
        <button 
          onClick={() => setActiveTab('pnl')}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: activeTab === 'pnl' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'pnl' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <DollarSign size={18} /> Profit & Loss Ledger
        </button>
        <button 
          onClick={() => setActiveTab('decorum')}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: activeTab === 'decorum' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'decorum' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Scale size={18} /> Decorum & Breach Desk {m.breachedBondsCount > 0 && <span style={{ background: '#ef4444', color: '#fff', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px' }}>{m.breachedBondsCount}</span>}
        </button>
        <button 
          onClick={() => setActiveTab('overview')}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: activeTab === 'overview' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'overview' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Activity size={18} /> Protocol Operations
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: activeTab === 'users' ? 'var(--accent-blue)' : 'transparent', color: activeTab === 'users' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
        >
          <Users size={18} /> User Directory
        </button>
      </div>

      {/* TAB 1: PROFIT & LOSS (P&L) FINANCIAL LEDGER */}
      {activeTab === 'pnl' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          
          {/* Top 4 Financial Metric Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px', marginBottom: '35px' }}>
            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(37,99,235,0.1), rgba(15,23,42,0.6))', border: '1px solid rgba(59,130,246,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#60a5fa' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>GROSS ESCROW VOLUME</span>
                <DollarSign size={20} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', margin: '15px 0 5px' }}>₹{(pnl.grossEscrowVolume || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Total capital locked in labor bonds</span>
            </div>

            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(15,23,42,0.6))', border: '1px solid rgba(16,185,129,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#34d399' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>PROTOCOL FEES EARNED</span>
                <TrendingUp size={20} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', margin: '15px 0 5px', color: '#34d399' }}>₹{(pnl.totalProtocolFees || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>5% Protocol commission fee</span>
            </div>

            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(15,23,42,0.6))', border: '1px solid rgba(239,68,68,0.3)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f87171' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>SLASHED BREACH PENALTIES</span>
                <AlertTriangle size={20} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', margin: '15px 0 5px', color: '#f87171' }}>₹{(pnl.totalBreachRefunds || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Penalties levied on contract breaches</span>
            </div>

            <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(168,85,247,0.15), rgba(15,23,42,0.8))', border: '1px solid rgba(168,85,247,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#c084fc' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>NET PROTOCOL PROFIT</span>
                <Award size={20} />
              </div>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.2rem', margin: '15px 0 5px', color: '#c084fc' }}>₹{(pnl.netProfit || 0).toLocaleString()}</h2>
              <span style={{ fontSize: '0.8rem', color: '#34d399' }}>▲ Positive Net Retained Margin</span>
            </div>
          </div>

          {/* Profit & Loss Breakdown Table */}
          <div className="card" style={{ padding: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <DollarSign color="var(--accent-blue)" /> Financial Profit & Loss Statement (P&L)
            </h3>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>FINANCIAL ITEM</th>
                  <th style={{ padding: '12px' }}>DESCRIPTION</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>AMOUNT (₹)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold' }}>Gross Escrow Volume</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Total capital committed by Providers & Seekers</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', fontWeight: 'bold' }}>₹{(pnl.grossEscrowVolume || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#34d399' }}>Protocol Service Revenue (5%)</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Commission fee on completed and resolved bonds</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: '#34d399', fontWeight: 'bold' }}>+ ₹{(pnl.totalProtocolFees || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold', color: '#f87171' }}>Breach Penalty Retained Share (20%)</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Protocol fee retained from decorum breach slashes</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: '#f87171', fontWeight: 'bold' }}>+ ₹{Math.round((pnl.totalBreachRefunds || 0) * 0.2).toLocaleString()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <td style={{ padding: '16px 12px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>Estimated Cloud & Gateway Expenses</td>
                  <td style={{ color: 'var(--text-secondary)' }}>Operating overhead (Server, SMS, Gateway)</td>
                  <td style={{ padding: '16px 12px', textAlign: 'right', color: 'var(--text-secondary)' }}>- ₹{(pnl.operatingExpenses || 0).toLocaleString()}</td>
                </tr>
                <tr style={{ background: 'rgba(59,130,246,0.08)' }}>
                  <td style={{ padding: '18px 12px', fontWeight: 'bold', fontSize: '1.1rem', color: '#60a5fa' }}>NET OPERATING PROFIT</td>
                  <td style={{ color: '#94a3b8' }}>Net Platform Retained Profit</td>
                  <td style={{ padding: '18px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: '#34d399' }}>₹{(pnl.netProfit || 0).toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* TAB 2: DECORUM & BREACH RESOLUTION DESK */}
      {activeTab === 'decorum' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="card" style={{ padding: '30px', marginBottom: '30px' }}>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: '0 0 10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Scale color="#f59e0b" /> Decorum & Contract Breach Resolution Desk
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '25px' }}>
              Inspect disputed or breached labor bonds. Apply decorum penalties, slash escrow collateral, refund affected parties, and adjust trust scores.
            </p>

            <div style={{ display: 'grid', gap: '20px' }}>
              {bonds.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No active or disputed bonds found.</div>
              ) : (
                bonds.map(b => (
                  <div 
                    key={b._id} 
                    style={{ 
                      background: b.status === 'BREACHED' || b.status === 'DISPUTED' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255,255,255,0.02)',
                      border: b.status === 'BREACHED' || b.status === 'DISPUTED' ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid var(--border-color)',
                      borderRadius: '16px',
                      padding: '20px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '15px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <span style={{ 
                            background: b.status === 'ACTIVE' ? 'rgba(16,185,129,0.2)' : b.status === 'ADMIN_RESOLVED' ? 'rgba(59,130,246,0.2)' : 'rgba(239,68,68,0.2)',
                            color: b.status === 'ACTIVE' ? '#34d399' : b.status === 'ADMIN_RESOLVED' ? '#60a5fa' : '#f87171',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' 
                          }}>
                            {b.status}
                          </span>
                          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Bond ID: {b._id}</span>
                        </div>
                        <h4 style={{ margin: '0 0 8px', fontSize: '1.1rem' }}>
                          Seeker: {b.seekerId?.email || 'N/A'} ↔ Provider: {b.providerId?.email || 'N/A'}
                        </h4>
                        <div style={{ display: 'flex', gap: '20px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                          <span>Monthly Salary: ₹{b.monthlySalary?.toLocaleString()}</span>
                          <span>Escrow Contribution: ₹{b.providerEscrowContribution?.toLocaleString()}</span>
                          <span>Seeker Token: ₹{b.seekerInitialToken?.toLocaleString()}</span>
                        </div>
                        {b.adminResolution && (
                          <div style={{ marginTop: '10px', fontSize: '0.85rem', color: '#60a5fa', background: 'rgba(59,130,246,0.1)', padding: '8px 12px', borderRadius: '8px' }}>
                            ⚖️ Admin Resolution: {b.adminResolution}
                          </div>
                        )}
                      </div>

                      <div>
                        <button 
                          onClick={() => { setSelectedBond(b); setPenaltyAmount(Math.round((b.providerEscrowContribution || 3000) * 0.4)); }}
                          className="action-btn"
                          style={{ padding: '10px 18px', borderRadius: '10px', background: b.status === 'ADMIN_RESOLVED' ? 'rgba(255,255,255,0.05)' : 'var(--accent-blue)', color: '#fff' }}
                        >
                          {b.status === 'ADMIN_RESOLVED' ? 'Re-inspect Case' : 'Resolve Decorum Breach'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 3: PROTOCOL OPERATIONS & METRICS */}
      {activeTab === 'overview' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '35px' }}>
            <div className="card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>TOTAL REGISTERED USERS</span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', margin: '10px 0 0' }}>{m.totalUsers || 0}</h2>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>WORKER SEEKERS</span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', margin: '10px 0 0', color: '#60a5fa' }}>{m.totalSeekers || 0}</h2>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>JOB PROVIDERS</span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', margin: '10px 0 0', color: '#34d399' }}>{m.totalProviders || 0}</h2>
            </div>
            <div className="card" style={{ padding: '24px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>ACTIVE LABOR BONDS</span>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '2.4rem', margin: '10px 0 0', color: '#c084fc' }}>{m.activeBonds || 0}</h2>
            </div>
          </div>
        </motion.div>
      )}

      {/* TAB 4: USER DIRECTORY & TRUST MANAGEMENT */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <div className="card" style={{ padding: '30px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: 0 }}>
                Platform Users & Decorum Score Directory
              </h3>
              <div style={{ position: 'relative', width: '280px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }} />
                <input 
                  type="text" 
                  placeholder="Search user email..." 
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="form-input"
                  style={{ paddingLeft: '40px', paddingRight: '12px' }}
                />
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
                  <th style={{ padding: '12px' }}>EMAIL</th>
                  <th style={{ padding: '12px' }}>ROLE</th>
                  <th style={{ padding: '12px' }}>TRUST SCORE</th>
                  <th style={{ padding: '12px', textAlign: 'right' }}>DECORUM CONTROLS</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '14px 12px', fontWeight: 'bold' }}>{u.email}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{ background: u.role === 'seeker' ? 'rgba(59,130,246,0.15)' : u.role === 'provider' ? 'rgba(16,185,129,0.15)' : 'rgba(168,85,247,0.15)', color: u.role === 'seeker' ? '#60a5fa' : u.role === 'provider' ? '#34d399' : '#c084fc', padding: '3px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                        {u.role?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px' }}>
                      <strong style={{ color: u.trustScore >= 70 ? '#34d399' : u.trustScore >= 40 ? '#f59e0b' : '#f87171' }}>
                        {u.trustScore} / 100
                      </strong>
                    </td>
                    <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                      <button 
                        onClick={() => handleUpdateTrustScore(u._id, u.trustScore, 10)}
                        style={{ padding: '6px 12px', marginRight: '6px', borderRadius: '8px', border: '1px solid #34d399', background: 'rgba(16,185,129,0.1)', color: '#34d399', cursor: 'pointer' }}
                      >
                        +10 Score
                      </button>
                      <button 
                        onClick={() => handleUpdateTrustScore(u._id, u.trustScore, -15)}
                        style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'rgba(239,68,68,0.1)', color: '#f87171', cursor: 'pointer' }}
                      >
                        -15 Penalize
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* RESOLVE BREACH MODAL */}
      <AnimatePresence>
        {selectedBond && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(5px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="card" style={{ width: '100%', maxWidth: '500px', padding: '35px' }}>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: '0 0 15px' }}>
                ⚖️ Resolve Decorum & Contract Breach
              </h3>

              <form onSubmit={handleResolveBreach}>
                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Resolution Action</label>
                  <select 
                    value={actionType} 
                    onChange={e => setActionType(e.target.value)}
                    className="form-input"
                    style={{ width: '100%' }}
                  >
                    <option value="PENALIZE_SEEKER">Penalize Seeker (Worker Abandonment)</option>
                    <option value="PENALIZE_PROVIDER">Penalize Provider (Wrongful Termination)</option>
                    <option value="MUTUAL_SETTLE">Mutual Settlement (50/50 Escrow Split)</option>
                  </select>
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Penalty Amount Slashed (₹)</label>
                  <input 
                    type="number" 
                    value={penaltyAmount}
                    onChange={e => setPenaltyAmount(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div style={{ marginBottom: '15px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Trust Score Penalty (Points)</label>
                  <input 
                    type="number" 
                    value={trustPenalty}
                    onChange={e => setTrustPenalty(Number(e.target.value))}
                    className="form-input"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Resolution Summary Notes</label>
                  <textarea 
                    value={resolutionNotes}
                    onChange={e => setResolutionNotes(e.target.value)}
                    placeholder="Enter formal organization protocol notes..."
                    className="form-input"
                    rows="3"
                    required
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="submit" className="action-btn" style={{ flex: 1, padding: '14px' }} disabled={resolving}>
                    {resolving ? 'Executing...' : 'Enforce Resolution'}
                  </button>
                  <button type="button" onClick={() => setSelectedBond(null)} style={{ padding: '14px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AdminDashboard;
