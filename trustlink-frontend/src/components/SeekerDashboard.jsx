import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search, MapPin, Briefcase, Filter, Sparkles, DollarSign, CheckCircle2, Clock, ShieldCheck, AlertTriangle, ArrowUpRight, ChevronRight, Award } from 'lucide-react';
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
      
      {/* Sub-navigation Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
        {[
          { key: 'find', label: 'Find Verified Opportunities', icon: Search },
          { key: 'applications', label: `My Applications (${myApplications.length})`, icon: Briefcase },
          { key: 'ledger', label: 'Escrow Bond Ledger', icon: DollarSign },
        ].map(tab => {
          const IconComp = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              className={`action-btn ${isActive ? '' : 'secondary-btn'}`}
              style={{ padding: '10px 20px', fontSize: '0.88rem', display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '14px' }}
              onClick={() => setActiveTab(tab.key)}
            >
              <IconComp size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'find' && (
        <>
          {/* Profile incomplete warning */}
          {!isProfileComplete() && (
            <div style={{ 
              background: 'rgba(245, 158, 11, 0.08)', 
              border: '1px solid rgba(245, 158, 11, 0.3)', 
              borderRadius: '20px', 
              padding: '16px 24px', 
              marginBottom: '28px', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '14px',
              backdropFilter: 'blur(12px)'
            }}>
              <AlertTriangle size={24} color="#f59e0b" style={{ flexShrink: 0 }} />
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                <strong style={{ color: '#f59e0b' }}>Profile Incomplete:</strong> Complete your profile in <strong>⚙️ Manage Profile</strong> (Name, Phone & City) to apply for protocol jobs.
              </p>
            </div>
          )}

          {/* Search & Filter Header Bar */}
          <div className="card" style={{ padding: '24px', marginBottom: '28px' }}>
            <form onSubmit={(e) => { e.preventDefault(); fetchNearbyJobs(); }} style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
              <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="form-input-premium" 
                  placeholder="Filter by City..." 
                  value={filterCity} 
                  onChange={e => setFilterCity(e.target.value)} 
                  style={{ paddingLeft: '48px' }} 
                />
              </div>

              <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
                <Briefcase size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <select 
                  className="form-input-premium" 
                  value={filterSkill} 
                  onChange={e => setFilterSkill(e.target.value)} 
                  style={{ paddingLeft: '48px' }}
                >
                  <option value="">All Protocol Skills</option>
                  {SKILLS_DATA.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>

              <button type="submit" className="btn-premium-primary" style={{ padding: '14px 28px', borderRadius: '14px', gap: '8px' }}>
                <Filter size={16} /> Filter Jobs
              </button>
            </form>
          </div>

          {/* Job Postings Grid */}
          <div className="jobs-list" style={{ display: 'grid', gap: '18px' }}>
            {visibleJobs.length === 0 ? (
              <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                <Sparkles size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
                <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.1rem' }}>No Verified Jobs Found</h4>
                <p style={{ margin: 0, fontSize: '0.88rem' }}>Try clearing filters or search for another location.</p>
              </div>
            ) : visibleJobs.map(job => {
              const existingApp = myApplications.find(a => a.jobId?._id === job._id || a.jobId === job._id);
              return (
                <div key={job._id} className="card card-glow" style={{ padding: '24px 30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <h4 style={{ margin: 0, fontSize: '1.2rem', fontFamily: 'Outfit', color: '#ffffff' }}>{job.title}</h4>
                        <span style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', color: '#818cf8', fontSize: '0.75rem', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                          VERIFIED PROTOCOL
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '20px', fontSize: '0.88rem', color: '#94a3b8', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={15} color="#38bdf8" /> {job.providerId?.profile?.companyName || 'Verified Provider'}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={15} color="#a855f7" /> {job.city}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: '700' }}>
                          <DollarSign size={15} /> ₹{job.salary}/month
                        </span>
                      </div>
                    </div>

                    <div>
                      {existingApp ? (
                        <span className="role-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid #6366f1', color: '#818cf8', padding: '8px 18px' }}>
                          {existingApp.status}
                        </span>
                      ) : (
                        <button 
                          className="btn-premium-primary" 
                          style={{ padding: '12px 24px', borderRadius: '14px', fontSize: '0.9rem', gap: '8px' }}
                          onClick={() => applyForJob(job)}
                        >
                          Apply Now <ArrowUpRight size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div style={{ display: 'grid', gap: '18px' }}>
          {myApplications.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <Briefcase size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <h4 style={{ color: '#fff', margin: '0 0 6px', fontSize: '1.1rem' }}>No Active Applications</h4>
              <p style={{ margin: 0, fontSize: '0.88rem' }}>Browse jobs under <strong>Find Verified Opportunities</strong> to apply.</p>
            </div>
          ) : myApplications.map(app => {
            const b = bondMap[app._id?.toString()] || Object.values(bondMap).find(x => (x.applicationId?._id || x.applicationId)?.toString() === app._id?.toString());
            return (
              <div key={app._id} className="card card-glow" style={{ padding: '26px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                  <div>
                    <h4 style={{ margin: '0 0 8px', fontSize: '1.2rem', fontFamily: 'Outfit', color: '#fff' }}>{app.jobId?.title || 'Contract Position'}</h4>
                    <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                      ₹{app.jobId?.salary}/month • {app.jobId?.city}
                    </p>
                    <div style={{ marginTop: '14px' }}>
                      <span className="role-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8', padding: '6px 16px' }}>
                        {app.status}
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    {app.status === 'BOND_PENDING' && b && (
                      <button className="btn-premium-primary" style={{ padding: '14px 24px', borderRadius: '14px', fontSize: '0.9rem', gap: '8px' }} onClick={() => handleSeekerPay(b)}>
                        <ShieldCheck size={18} /> Confirm Escrow Deposit (₹{b.seekerInitialToken})
                      </button>
                    )}
                    {app.status === 'HIRED' && (
                      <button className="action-btn secondary-btn" style={{ borderColor: '#f59e0b', color: '#f59e0b' }} onClick={() => resolveBond(app._id, 'REQUEST_MUTUAL_SEEKER')}>
                        Request Settlement
                      </button>
                    )}
                    {b?.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && (
                      <div style={{ marginTop: '10px', textAlign: 'right' }}>
                         <p style={{ color: '#f59e0b', fontWeight: 'bold', margin: '0 0 8px', fontSize: '0.88rem' }}>⚠️ Provider requested a Mutual Settlement</p>
                         <button className="btn-premium-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '10px 20px', borderRadius: '12px' }} onClick={() => resolveBond(app._id, 'APPROVE_MUTUAL')}>
                           Approve Settlement
                         </button>
                      </div>
                    )}
                    {b?.status === 'MUTUAL_CANCEL_REQ_SEEKER' && (
                      <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>⏳ Waiting for provider approval...</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bond Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="ledger-content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            
            <div className="card card-glow" style={{ padding: '26px', borderTop: '4px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '8px' }}>
                <CheckCircle2 size={20} />
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Earnings Payout</span>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff' }}>
                ₹{totalPayoutRecv.toLocaleString()}
              </div>
            </div>

            <div className="card card-glow" style={{ padding: '26px', borderTop: '4px solid #6366f1' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8', marginBottom: '8px' }}>
                <ShieldCheck size={20} />
                <span style={{ fontSize: '0.82rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Committed Escrow Deposits</span>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff' }}>
                ₹{totalInvestment.toLocaleString()}
              </div>
            </div>

          </div>

          <h3 style={{ marginBottom: '22px', fontSize: '1.3rem', fontFamily: 'Outfit', display: 'flex', alignItems: 'center', gap: '10px', color: '#fff' }}>
            <DollarSign size={20} color="#818cf8" /> Smart Escrow Ledger History
          </h3>

          {bonds.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
              <Clock size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
              <p style={{ margin: 0, fontSize: '0.88rem' }}>No escrow transaction history logged yet.</p>
            </div>
          ) : bonds.map(b => {
             const isGain = b.seekerPayout > b.seekerInitialToken;
             const isRefund = b.status === 'MUTUALLY_CANCELLED';
             const isLoss = b.status === 'BREACHED';
             
             return (
              <div key={b._id} className="card card-glow" style={{ padding: '24px 28px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <strong style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'Outfit' }}>{b.applicationId?.jobId?.title || 'Contract Protocol Bond'}</strong>
                      {isGain && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>1.8x Payout</span>}
                      {isRefund && <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>Refunded</span>}
                    </div>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
                      Protocol ID: {b._id.toString().slice(-8)} • {new Date(b.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'Outfit', color: isGain ? '#10b981' : (isLoss ? '#f43f5e' : '#ffffff') }}>
                      {b.seekerPayout > 0 ? `₹${b.seekerPayout}` : `₹${b.seekerInitialToken}`}
                    </div>
                    <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
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

