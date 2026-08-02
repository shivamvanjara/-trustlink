import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SKILLS_DATA } from '../utils/skillsList';
import { API_BASE_URL } from '../apiConfig';

const API_BASE = API_BASE_URL;

const SeekerDashboard = ({ user, socket }) => {
  const [nearbyJobs, setNearbyJobs] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [bondMap, setBondMap] = useState({});
  const [filterCity, setFilterCity] = useState('');
  const [filterSkill, setFilterSkill] = useState('');
  const [activeTab, setActiveTab] = useState('find'); // 'find' | 'applications' | 'ledger'
  const [bonds, setBonds] = useState([]);
  const [cancelledJobIds, setCancelledJobIds] = useState(new Set());

  const isProfileComplete = () => {
    const p = user?.profile;
    return p?.fullName && p?.phone && p?.city;
  };

  useEffect(() => {
    if (user) {
      fetchMyApplications();
      fetchNearbyJobs();
    }
  }, [user]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => { fetchMyApplications(); fetchNearbyJobs(); };
    const handleBondResolved = (data) => {
      toast.success(`Bond Settled! Payout: ₹${data.payout}`);
      handleUpdate();
    };
    socket.on('APPLICATION_UPDATED', handleUpdate);
    socket.on('BOND_RESOLVED', handleBondResolved);
    socket.on('BOND_UPDATED', handleUpdate);
    return () => {
      socket.off('APPLICATION_UPDATED', handleUpdate);
      socket.off('BOND_RESOLVED', handleBondResolved);
      socket.off('BOND_UPDATED', handleUpdate);
    };
  }, [socket]);

  const fetchNearbyJobs = async (city = filterCity, skill = filterSkill) => {
    try {
      const params = new URLSearchParams({ seekerId: user._id });
      if (city) params.set('city', city);
      if (skill) params.set('skill', skill);
      const res = await axios.get(`${API_BASE}/jobs/nearby?${params.toString()}`);
      setNearbyJobs(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMyApplications = async () => {
    if (!user?._id) return;
    try {
      const res = await axios.get(`${API_BASE}/applications/seeker/${user._id}`);
      const all = res.data;
      
      const cancelledJobIdSet = new Set();
      all.filter(a => a.status === 'CANCELLED').forEach(a => {
        if (a.jobId?._id) cancelledJobIdSet.add(a.jobId._id.toString());
        else if (a.jobId) cancelledJobIdSet.add(a.jobId.toString());
      });
      setCancelledJobIds(cancelledJobIdSet);
      setMyApplications(all.filter(a => !['CANCELLED', 'REJECTED'].includes(a.status)));
      
      const bondsRes = await axios.get(`${API_BASE}/bonds/user/${user._id}`);
      setBonds(bondsRes.data);
      const map = {};
      bondsRes.data.forEach(b => {
        const appIdObj = b.applicationId?._id || b.applicationId;
        if (appIdObj) map[appIdObj.toString()] = b;
      });
      setBondMap(map);
    } catch (err) { console.error(err); }
  };

  const applyForJob = async (job) => {
    if (!isProfileComplete()) {
      return toast.error('⚠️ Complete your profile (Name, Phone, City) before applying!');
    }
    try {
      await axios.post(`${API_BASE}/applications`, {
        jobId: job._id,
        seekerId: user._id,
        providerId: job.providerId._id || job.providerId
      });
      toast.success('Applied successfully!');
      setActiveTab('applications');
      fetchMyApplications();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to apply');
    }
  };

  const handleSeekerPay = async (bondOrAppId) => {
    const tId = toast.loading("Opening Payment Gateway...");
    try {
      let bond = bondOrAppId;
      if (typeof bondOrAppId === 'string' || !bondOrAppId.seekerInitialToken) {
        bond = bonds.find(b => 
          (b.applicationId?._id || b.applicationId)?.toString() === bondOrAppId?.toString() ||
          b._id?.toString() === bondOrAppId?.toString()
        );
      }
      if (!bond) { toast.error("Bond not found.", { id: tId }); return; }

      const amount = Math.round(bond.seekerInitialToken);
      const { data: config } = await axios.get(`${API_BASE}/bonds/config`);
      const { data: order } = await axios.post(`${API_BASE}/bonds/create-order`, { amount, bondId: bond._id });
      toast.dismiss(tId);

      const options = {
        key: config.key,
        amount: order.amount,
        name: "TrustLink Escrow",
        description: `Worker Deposit — ₹${amount}`,
        order_id: order.id,
        handler: async (response) => {
          const vId = toast.loading("Syncing...");
          await axios.post(`${API_BASE}/bonds/seeker-pay`, { bondId: bond._id, razorpayPaymentId: response.razorpay_payment_id });
          toast.success("✅ Job Confirmed!", { id: vId });
          fetchMyApplications();
        },
        theme: { color: "#6366f1" }
      };
      new window.Razorpay(options).open();
    } catch(err) { toast.error("Payment error", { id: tId }); }
  };

  const resolveBond = async (applicationId, resolutionType) => {
    try {
      await axios.post(`${API_BASE}/bonds/resolve`, { applicationId, resolutionType });
      toast.success("Action sent!");
      fetchMyApplications();
    } catch (err) { toast.error("Action failed"); }
  };

  const visibleJobs = nearbyJobs.filter(job => !cancelledJobIds.has(job._id?.toString()));

  // Financial Stats
  const totalPayoutRecv = bonds.reduce((sum, b) => sum + (b.seekerPayout || 0), 0);
  const totalInvestment = bonds.reduce((sum, b) => sum + (b.seekerTokenPaid ? b.seekerInitialToken : 0), 0);

  return (
    <div className="dashboard-content">
      {/* Sub-tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'find', label: '🔍 Find Work' },
          { key: 'applications', label: `📋 My Jobs (${myApplications.length})` },
          { key: 'ledger', label: '💰 Bond Ledger' },
        ].map(tab => (
          <button
            key={tab.key}
            className={`action-btn ${activeTab === tab.key ? '' : 'secondary-btn'}`}
            style={{ padding: '8px 16px', fontSize: '0.88rem' }}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'find' && (
        <>
          {/* Profile incomplete warning */}
          {!isProfileComplete() && (
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--warning)', borderRadius: '16px', padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{fontSize: '1.2rem'}}>⚠️</span>
              <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                <strong>Action Needed:</strong> Complete your profile in ⚙️ Settings to apply for jobs.
              </p>
            </div>
          )}

          <div className="card" style={{padding: '20px', marginBottom: '24px'}}>
            <form onSubmit={(e) => {e.preventDefault(); fetchNearbyJobs();}} style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
              <input type="text" className="form-input" placeholder="Search City..." value={filterCity} onChange={e => setFilterCity(e.target.value)} style={{flex: 1, minWidth: '150px'}} />
              <select className="form-input" value={filterSkill} onChange={e => setFilterSkill(e.target.value)} style={{flex: 1, minWidth: '150px'}}>
                <option value="">All Skills</option>
                {SKILLS_DATA.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <button type="submit" className="action-btn">Filter</button>
            </form>
          </div>

          <div className="jobs-list">
            {visibleJobs.length === 0 ? (
              <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No matching jobs found.</p>
            ) : visibleJobs.map(job => {
              const existingApp = myApplications.find(a => a.jobId?._id === job._id || a.jobId === job._id);
              return (
                <div key={job._id} className="card">
                  <div className="job-item" style={{padding: '24px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <h4 style={{margin: '0 0 10px'}}>{job.title}</h4>
                      <div className="job-meta" style={{display: 'flex', gap: '15px', fontSize: '0.85rem', color: 'var(--text-secondary)'}}>
                        <span>🏢 {job.providerId?.profile?.companyName || 'Verified'}</span>
                        <span>📍 {job.city}</span>
                        <span>💰 ₹{job.salary}/mo</span>
                      </div>
                    </div>
                    {existingApp ? (
                      <span className="role-badge" style={{color: 'var(--accent-blue)'}}>{existingApp.status}</span>
                    ) : (
                      <button className="action-btn" onClick={() => applyForJob(job)}>Apply Now</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'applications' && (
        <div className="postings-list">
          {myApplications.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No active jobs or applications.</p>
          ) : myApplications.map(app => {
            const b = bondMap[app._id?.toString()] || Object.values(bondMap).find(x => (x.applicationId?._id || x.applicationId)?.toString() === app._id?.toString());
            return (
              <div key={app._id} className="card" style={{padding: '24px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h4 style={{margin: '0 0 8px'}}>{app.jobId?.title || 'Job'}</h4>
                    <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{app.jobId?.salary}/mo • {app.jobId?.city}</p>
                    <div style={{marginTop: '12px'}}><span className="role-badge">{app.status}</span></div>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    {app.status === 'BOND_PENDING' && b && (
                      <button className="action-btn" onClick={() => handleSeekerPay(b)}>💰 Confirm with ₹{b.seekerInitialToken}</button>
                    )}
                    {app.status === 'HIRED' && (
                      <button className="secondary-btn action-btn" style={{borderColor: 'var(--warning)', color: 'var(--warning)'}} onClick={() => resolveBond(app._id, 'REQUEST_MUTUAL_SEEKER')}>Request Settlement</button>
                    )}
                    {b?.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && (
                      <div style={{ marginTop: '10px', textAlign: 'right' }}>
                         <p style={{ color: 'var(--warning)', fontWeight: 'bold', margin: '0 0 8px', fontSize: '0.85rem' }}>⚠️ Provider requested a Mutual Settlement</p>
                         <button className="action-btn" style={{background: 'var(--warning)', color: '#000'}} onClick={() => resolveBond(app._id, 'APPROVE_MUTUAL')}>Approve Settlement</button>
                      </div>
                    )}
                    {b?.status === 'MUTUAL_CANCEL_REQ_SEEKER' && (
                      <span style={{ color: 'var(--warning)', fontSize: '0.82rem', fontWeight: '600' }}>⏳ Waiting for provider to approve settlement...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="ledger-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div className="card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--accent-blue)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--accent-blue)' }}>₹{totalPayoutRecv}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>TOTAL EARNINGS (PAYOUTS)</div>
            </div>
            <div className="card" style={{ padding: '24px', textAlign: 'center', borderTop: '4px solid var(--success)' }}>
              <div style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--success)' }}>₹{totalInvestment}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '8px' }}>PAID ESCROW DEPOSITS</div>
            </div>
          </div>

          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>📊 Digital Asset History</h3>
          {bonds.length === 0 ? (
            <p style={{textAlign: 'center', color: 'var(--text-secondary)'}}>No financial records yet.</p>
          ) : bonds.map(b => {
             const isGain = b.seekerPayout > b.seekerInitialToken;
             const isRefund = b.status === 'MUTUALLY_CANCELLED';
             const isLoss = b.status === 'BREACHED';
             
             return (
              <div key={b._id} className={`card ledger-card status-${b.status?.toLowerCase().includes('cancel') ? 'cancelled' : b.status?.toLowerCase()}`} style={{ padding: '24px', marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{b.applicationId?.jobId?.title || 'Work Bond'}</strong>
                      {isGain && <span className="roi-badge" style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)'}}>1.8x Gain</span>}
                      {isRefund && <span className="roi-badge" style={{background: 'rgba(245,158,11,0.1)', color: 'var(--warning)'}}>0.8x Refund</span>}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>ID: {b._id.toString().slice(-8)} • {new Date(b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="amount-display" style={{ color: isGain ? 'var(--success)' : (isLoss ? 'var(--error)' : 'var(--text-primary)') }}>
                      {b.seekerPayout > 0 ? `₹${b.seekerPayout}` : `₹${b.seekerInitialToken}`}
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.6, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px' }}>
                      {b.status === 'ACTIVE' ? 'Escrow Committed' : b.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              </div>
             );
          })}
        </div>
      )}
    </div>
  );
};

export default SeekerDashboard;
