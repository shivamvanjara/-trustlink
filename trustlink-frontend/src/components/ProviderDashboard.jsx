import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LayoutGrid, PlusCircle, Users, Activity, Wallet, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProviderJobForm from './ProviderJobForm';
import { API_BASE_URL } from '../apiConfig';

const API_BASE = API_BASE_URL;

const ProviderDashboard = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('applications'); // 'post' | 'jobs' | 'applications' | 'transactions'
  const [providerApps, setProviderApps] = useState([]);
  const [allApps, setAllApps] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [bondMap, setBondMap] = useState({});

  const isProfileComplete = () => {
    const p = user?.profile;
    return !!(p?.companyName && p?.phone && p?.city);
  };

  useEffect(() => {
    if (user) { fetchMyJobs(); fetchProviderApps(); }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const refresh = () => { fetchProviderApps(); fetchMyJobs(); };
    const handleBondResolved = (data) => {
      toast.success(`Bond Settled! ₹${data.payout}`);
      refresh();
    };
    socket.on('NEW_APPLICATION', refresh);
    socket.on('APPLICATION_UPDATED', refresh);
    socket.on('BOND_RESOLVED', handleBondResolved);
    socket.on('BOND_UPDATED', refresh);
    return () => {
      socket.off('NEW_APPLICATION', refresh);
      socket.off('APPLICATION_UPDATED', refresh);
      socket.off('BOND_RESOLVED', handleBondResolved);
      socket.off('BOND_UPDATED', refresh);
    };
  }, [socket]);

  const fetchMyJobs = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/jobs/me/${user._id}`);
      setMyJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchProviderApps = async () => {
    if (!user?._id) return;
    try {
      const [appsRes, bondsRes] = await Promise.all([
        axios.get(`${API_BASE}/applications/provider/${user._id}`),
        axios.get(`${API_BASE}/bonds/user/${user._id}`)
      ]);
      const all = appsRes.data;
      setAllApps(all);
      setProviderApps(all.filter(a => !['CANCELLED', 'REJECTED'].includes(a.status)));
      setBonds(bondsRes.data);
      const map = {};
      bondsRes.data.forEach(b => {
        const appId = b.applicationId?._id || b.applicationId;
        if (appId) map[appId.toString()] = b;
      });
      setBondMap(map);
    } catch (err) { console.error(err); }
  };

  const updateAppStatus = async (appId, newStatus, extraData = {}) => {
    try {
      await axios.patch(`${API_BASE}/applications/${appId}/status`, { status: newStatus, ...extraData });
      toast.success('Status Updated');
      fetchProviderApps();
    } catch (err) { toast.error('Failed to update status'); }
  };

  const initiateRazorpayBond = async (app) => {
    if (!isProfileComplete()) {
      return toast.error('⚠️ Complete Company Profile first!');
    }
    setLoading(true);
    try {
      const { data: config } = await axios.get(`${API_BASE}/bonds/config`);
      const providerEscrow = Math.round((app.jobId?.salary || 0) * 0.5);

      const { data: order } = await axios.post(`${API_BASE}/bonds/create-order`, {
        amount: providerEscrow, bondId: app._id
      });

      const options = {
        key: config.key,
        amount: order.amount,
        name: "TrustLink Escrow",
        description: `Provider Deposit — ₹${providerEscrow}`,
        order_id: order.id,
        handler: async (response) => {
          await axios.post(`${API_BASE}/bonds/generate`, {
            applicationId: app._id,
            seekerId: app.seekerId._id || app.seekerId,
            providerId: user._id,
            monthlySalary: app.jobId?.salary,
            bondDurationMonths: app.jobId?.bondDurationMonths || 6,
            razorpayPaymentId: response.razorpay_payment_id
          });
          toast.success('✅ Deposit Confirmed!');
          fetchProviderApps();
        },
        theme: { color: "#6366f1" }
      };
      new window.Razorpay(options).open();
    } catch (err) { toast.error("Payment failed"); } finally { setLoading(false); }
  };

  const resolveBond = async (applicationId, resolutionType) => {
    try {
      await axios.post(`${API_BASE}/bonds/resolve`, { applicationId, resolutionType });
      toast.success("Action sent!");
      fetchProviderApps();
    } catch (err) { toast.error("Action failed"); }
  };

  // Stats
  const stats = [
    { label: 'Total Jobs', value: myJobs.length, icon: <LayoutGrid size={18}/>, color: 'var(--accent-blue)' },
    { label: 'Active Bonds', value: bonds.filter(b => b.status === 'ACTIVE').length, icon: <Activity size={18}/>, color: 'var(--success)' },
    { label: 'Deposited', value: `₹${bonds.reduce((s,b)=>s+(b.providerEscrowContribution||0),0)}`, icon: <Wallet size={18}/>, color: 'var(--text-primary)' }
  ];

  return (
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        {stats.map(s => (
          <div key={s.label} className="card" style={{ padding: '24px', display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{ background: s.color + '22', padding: '12px', borderRadius: '12px', color: s.color }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: '800' }}>{s.value}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[
          { key: 'post', label: '➕ New Job', icon: <PlusCircle size={16}/> },
          { key: 'jobs', label: `📋 My Jobs`, icon: <LayoutGrid size={16}/> },
          { key: 'applications', label: `👥 Candidates`, icon: <Users size={16}/> },
          { key: 'transactions', label: `💰 Transactions`, icon: <Wallet size={16}/> },
        ].map(tab => (
          <button
            key={tab.key}
            className={`action-btn ${activeTab === tab.key ? '' : 'secondary-btn'}`}
            style={{ padding: '10px 20px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.icon} <span style={{marginLeft: '6px'}}>{tab.label}</span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}
        >
          {activeTab === 'post' && (
            <div className="card" style={{ padding: '40px' }}>
               <ProviderJobForm user={user} onJobPosted={() => { fetchMyJobs(); setActiveTab('jobs'); }} />
            </div>
          )}

          {activeTab === 'jobs' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {myJobs.length === 0 ? <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No jobs posted yet.</p> :
               myJobs.map(job => (
                <div key={job._id} className="card" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px' }}>{job.title}</h4>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>📍 {job.city} • ₹{job.salary}/mo</p>
                  </div>
                  <span className="role-badge" style={{ color: job.status === 'OPEN' ? 'var(--success)' : 'inherit' }}>{job.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'applications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {providerApps.length === 0 ? <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No active candidates.</p> :
               providerApps.map(app => {
                const bond = bondMap[app._id?.toString()];
                return (
                  <div key={app._id} className="card" style={{ padding: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                      <div style={{flex: 1}}>
                        <h4 style={{ margin: '0 0 4px' }}>{app.jobId?.title}</h4>
                        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--accent-blue)', fontWeight: '600' }}>
                          Candidate: {app.seekerId?.profile?.fullName || app.seekerId?.email}
                        </p>
                        <div style={{marginTop: '10px'}}><span className="role-badge">{app.status}</span></div>
                      </div>
                      <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        {app.status === 'APPLIED' && (
                          <button className="action-btn" onClick={() => updateAppStatus(app._id, 'INTERVIEW_INVITED')}>Invite</button>
                        )}
                        {app.status === 'INTERVIEW_INVITED' && (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button className="action-btn" style={{background: 'var(--warning)', color: '#000'}} onClick={() => updateAppStatus(app._id, 'TRIAL_STARTED')}>Start 3-Day Trial</button>
                            <button className="action-btn" onClick={() => initiateRazorpayBond(app)}>💰 Direct Hire (₹{Math.round((app.jobId?.salary||0)*0.5)})</button>
                          </div>
                        )}
                        {app.status === 'TRIAL_STARTED' && (
                          <div style={{display: 'flex', gap: '8px'}}>
                            <button className="action-btn" onClick={() => initiateRazorpayBond(app)}>💰 End Trial & Hire (₹{Math.round((app.jobId?.salary||0)*0.5)})</button>
                            <button className="secondary-btn action-btn" onClick={() => updateAppStatus(app._id, 'REJECTED')}>Reject</button>
                          </div>
                        )}
                        {app.status === 'HIRED' && (
                          <div style={{display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center', width: '100%' }}>
                             <button className="action-btn" style={{background: 'var(--success)'}} onClick={() => resolveBond(app._id, 'COMPLETE')}>Mark Complete</button>
                             <button className="action-btn" style={{background: 'var(--warning)', color: '#000'}} onClick={() => resolveBond(app._id, 'REQUEST_MUTUAL_PROVIDER')}>Request Settlement</button>
                             <button className="secondary-btn action-btn" style={{color: 'var(--error)'}} onClick={() => resolveBond(app._id, 'RESIGN')}>Report Breach</button>
                          </div>
                        )}
                      </div>

                      {/* Mutual Settlement Handshake (Provider Side) */}
                      {bond?.status === 'MUTUAL_CANCEL_REQ_SEEKER' && (
                        <div style={{ marginTop: '15px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '16px', width: '100%' }}>
                          <p style={{ color: 'var(--warning)', fontWeight: 'bold', margin: '0 0 10px', fontSize: '0.85rem' }}>⚠️ Worker requested a Mutual Settlement</p>
                          <button className="action-btn" style={{ background: 'var(--warning)', color: '#000', padding: '8px 16px', fontSize: '0.82rem' }} onClick={() => resolveBond(app._id, 'APPROVE_MUTUAL')}>
                            ✅ Approve Settlement (₹{bond.mutualCancelSettlement} refund)
                          </button>
                        </div>
                      )}
                      {bond?.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && (
                        <div style={{ marginTop: '10px' }}>
                          <span style={{ color: 'var(--warning)', fontSize: '0.82rem', fontWeight: '600' }}>⏳ Waiting for worker to approve settlement...</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {bonds.length === 0 ? <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No transactions found.</p> :
           bonds.map(b => {
             const isRefund = b.status === 'MUTUALLY_CANCELLED';
             const isRecovery = b.status === 'BREACHED'; // Provider recovers worker's forfeit
             
             return (
              <div key={b._id} className={`card ledger-card status-${b.status?.toLowerCase().includes('cancel') ? 'cancelled' : b.status?.toLowerCase()}`} style={{ padding: '24px', marginBottom: '15px' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '1.1rem' }}>Bond #{b._id.toString().slice(-6)}</strong>
                        {isRecovery && <span className="roi-badge" style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)'}}>Capital Recovered</span>}
                        {isRefund && <span className="roi-badge" style={{background: 'rgba(245,158,11,0.1)', color: 'var(--warning)'}}>Partial Refund</span>}
                      </div>
                      <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                         {b.seekerId?.profile?.fullName || 'Verified Member'} • {new Date(b.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                       <div className="amount-display" style={{ color: isRecovery ? 'var(--success)' : 'var(--text-primary)' }}>
                          ₹{b.providerPayout > 0 ? b.providerPayout : b.providerEscrowContribution}
                       </div>
                       <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                          {b.status === 'ACTIVE' ? 'Escrow Pool' : b.status.replace('_', ' ')}
                       </span>
                    </div>
                 </div>
              </div>
             );
           })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ProviderDashboard;
