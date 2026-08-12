import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { LayoutGrid, PlusCircle, Users, Activity, Wallet, AlertCircle, CheckCircle2, DollarSign, ShieldCheck, UserCheck, Clock, Award, ArrowUpRight, MessageSquare, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProviderJobForm from './ProviderJobForm';
import { API_BASE_URL } from '../apiConfig';
import ChatModal from './ChatModal';
import ContractModal from './ContractModal';

const API_BASE = API_BASE_URL;

const ProviderDashboard = ({ user, socket }) => {
  const [activeTab, setActiveTab] = useState('applications'); // 'post' | 'jobs' | 'applications' | 'transactions'
  const [providerApps, setProviderApps] = useState([]);
  const [allApps, setAllApps] = useState([]); 
  const [loading, setLoading] = useState(false);
  const [myJobs, setMyJobs] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [bondMap, setBondMap] = useState({});
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

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

  // KPI Metrics
  const totalJobsCount = myJobs.length;
  const activeBondsCount = bonds.filter(b => b.status === 'ACTIVE').length;
  const totalEscrowDeposited = bonds.reduce((s,b) => s + (b.providerEscrowContribution || 0), 0);

  return (
    <div className="dashboard-content">
      
      {/* KPI Cards Header */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        <div className="card card-glow" style={{ padding: '24px 28px', borderTop: '4px solid #6366f1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#818cf8', marginBottom: '8px' }}>
            <LayoutGrid size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Job Postings</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff' }}>
            {totalJobsCount}
          </div>
        </div>

        <div className="card card-glow" style={{ padding: '24px 28px', borderTop: '4px solid #10b981' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#10b981', marginBottom: '8px' }}>
            <Activity size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Active Escrow Bonds</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff' }}>
            {activeBondsCount}
          </div>
        </div>

        <div className="card card-glow" style={{ padding: '24px 28px', borderTop: '4px solid #38bdf8' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#38bdf8', marginBottom: '8px' }}>
            <Wallet size={20} />
            <span style={{ fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Total Escrow Pool</span>
          </div>
          <div style={{ fontSize: '2.4rem', fontWeight: '800', fontFamily: 'Outfit', color: '#ffffff' }}>
            ₹{totalEscrowDeposited.toLocaleString()}
          </div>
        </div>

      </div>

      {/* Navigation Sub-Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap' }}>
        {[
          { key: 'post', label: 'Post New Job', icon: PlusCircle },
          { key: 'jobs', label: `My Job Openings (${myJobs.length})`, icon: LayoutGrid },
          { key: 'applications', label: `Candidates (${providerApps.length})`, icon: Users },
          { key: 'transactions', label: 'Escrow Transactions', icon: Wallet },
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

      <AnimatePresence mode="wait">
        <motion.div
           key={activeTab} 
           initial={{ opacity: 0, y: 10 }} 
           animate={{ opacity: 1, y: 0 }} 
           exit={{ opacity: 0, y: -10 }} 
           transition={{ duration: 0.2 }}
        >
          {activeTab === 'post' && (
            <div className="card card-glow" style={{ padding: '40px' }}>
               <ProviderJobForm user={user} onJobPosted={() => { fetchMyJobs(); setActiveTab('jobs'); }} />
            </div>
          )}

          {activeTab === 'jobs' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {myJobs.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <LayoutGrid size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>No job openings posted yet. Click <strong>Post New Job</strong> to start hiring.</p>
                </div>
              ) : (
                myJobs.map(job => (
                  <div key={job._id} className="card card-glow" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                    <div>
                      <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontFamily: 'Outfit', color: '#fff' }}>{job.title}</h4>
                      <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>
                        📍 {job.city} • ₹{job.salary}/month • {job.bondDurationMonths || 6} Months Protocol
                      </p>
                    </div>
                    <span className="role-badge" style={{ background: job.status === 'OPEN' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)', color: job.status === 'OPEN' ? '#10b981' : '#94a3b8', border: job.status === 'OPEN' ? '1px solid #10b981' : '1px solid rgba(255,255,255,0.1)' }}>
                      {job.status}
                    </span>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {providerApps.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Users size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>No candidate applications received yet.</p>
                </div>
              ) : (
                providerApps.map(app => {
                  const bond = bondMap[app._id?.toString()];
                  return (
                    <div key={app._id} className="card card-glow" style={{ padding: '26px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px' }}>
                        <div style={{ flex: 1 }}>
                          <h4 style={{ margin: '0 0 6px', fontSize: '1.2rem', fontFamily: 'Outfit', color: '#fff' }}>{app.jobId?.title}</h4>
                          <p style={{ margin: '0 0 10px', fontSize: '0.92rem', color: '#818cf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <UserCheck size={16} /> Candidate: {app.seekerId?.profile?.fullName || app.seekerId?.email}
                          </p>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', marginTop: '6px' }}>
                            <span className="role-badge" style={{ background: 'rgba(99, 102, 241, 0.15)', border: '1px solid rgba(99, 102, 241, 0.4)', color: '#818cf8' }}>
                              {app.status}
                            </span>
                            <button className="action-btn secondary-btn" style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', gap: '6px', alignItems: 'center', borderRadius: '12px' }} onClick={() => { setSelectedApp(app); setIsChatOpen(true); }}>
                              <MessageSquare size={14} /> Live Chat
                            </button>
                            <button className="action-btn secondary-btn" style={{ padding: '6px 14px', fontSize: '0.82rem', display: 'inline-flex', gap: '6px', alignItems: 'center', borderRadius: '12px' }} onClick={() => { setSelectedApp(app); setIsContractOpen(true); }}>
                              <FileText size={14} /> View Contract
                            </button>
                          </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                          {app.status === 'APPLIED' && (
                            <button className="btn-premium-primary" style={{ padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => updateAppStatus(app._id, 'INTERVIEW_INVITED')}>
                              Invite for Interview
                            </button>
                          )}
                          {app.status === 'INTERVIEW_INVITED' && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button className="action-btn" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => updateAppStatus(app._id, 'TRIAL_STARTED')}>
                                Start 3-Day Trial
                              </button>
                              <button className="btn-premium-primary" style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', gap: '6px' }} onClick={() => initiateRazorpayBond(app)}>
                                <ShieldCheck size={15} /> Direct Hire (₹{Math.round((app.jobId?.salary||0)*0.5)})
                              </button>
                            </div>
                          )}
                          {app.status === 'TRIAL_STARTED' && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button className="btn-premium-primary" style={{ padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem', gap: '6px' }} onClick={() => initiateRazorpayBond(app)}>
                                <ShieldCheck size={15} /> End Trial & Hire (₹{Math.round((app.jobId?.salary||0)*0.5)})
                              </button>
                              <button className="action-btn secondary-btn" style={{ color: '#f43f5e', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => updateAppStatus(app._id, 'REJECTED')}>
                                Reject Candidate
                              </button>
                            </div>
                          )}
                          {app.status === 'HIRED' && (
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                               <button className="btn-premium-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: '#fff', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => resolveBond(app._id, 'COMPLETE')}>
                                 Mark Complete
                               </button>
                               <button className="action-btn secondary-btn" style={{ borderColor: '#f59e0b', color: '#f59e0b', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => resolveBond(app._id, 'REQUEST_MUTUAL_PROVIDER')}>
                                 Request Settlement
                               </button>
                               <button className="action-btn secondary-btn" style={{ borderColor: '#f43f5e', color: '#f43f5e', padding: '10px 18px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => resolveBond(app._id, 'RESIGN')}>
                                 Report Breach
                               </button>
                            </div>
                          )}
                        </div>

                        {/* Mutual Settlement Handshake (Provider Side) */}
                        {bond?.status === 'MUTUAL_CANCEL_REQ_SEEKER' && (
                          <div style={{ marginTop: '16px', padding: '16px 20px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '16px', width: '100%' }}>
                            <p style={{ color: '#f59e0b', fontWeight: 'bold', margin: '0 0 10px', fontSize: '0.88rem' }}>⚠️ Worker requested a Mutual Settlement</p>
                            <button className="btn-premium-primary" style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#fff', padding: '10px 20px', borderRadius: '12px', fontSize: '0.85rem' }} onClick={() => resolveBond(app._id, 'APPROVE_MUTUAL')}>
                              Approve Settlement (₹{bond.mutualCancelSettlement} refund)
                            </button>
                          </div>
                        )}
                        {bond?.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && (
                          <div style={{ marginTop: '10px', width: '100%' }}>
                            <span style={{ color: '#f59e0b', fontSize: '0.85rem', fontWeight: '600' }}>⏳ Waiting for worker to approve settlement...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'transactions' && (
            <div style={{ display: 'grid', gap: '16px' }}>
              {bonds.length === 0 ? (
                <div className="card" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                  <Wallet size={36} color="#6366f1" style={{ marginBottom: '12px', opacity: 0.8 }} />
                  <p style={{ margin: 0, fontSize: '0.88rem' }}>No financial transactions recorded.</p>
                </div>
              ) : (
                bonds.map(b => {
                  const isRefund = b.status === 'MUTUALLY_CANCELLED';
                  const isRecovery = b.status === 'BREACHED';
                  
                  return (
                    <div key={b._id} className="card card-glow" style={{ padding: '24px 28px' }}>
                       <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                              <strong style={{ fontSize: '1.15rem', color: '#fff', fontFamily: 'Outfit' }}>Escrow Protocol #{b._id.toString().slice(-6)}</strong>
                              {isRecovery && <span style={{ background: 'rgba(16,185,129,0.12)', color: '#10b981', border: '1px solid rgba(16,185,129,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>Capital Recovered</span>}
                              {isRefund && <span style={{ background: 'rgba(245,158,11,0.12)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>Partial Refund</span>}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
                               Candidate: {b.seekerId?.profile?.fullName || 'Verified Member'} • {new Date(b.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                             <div style={{ fontSize: '1.4rem', fontWeight: '800', fontFamily: 'Outfit', color: isRecovery ? '#10b981' : '#ffffff' }}>
                                ₹{b.providerPayout > 0 ? b.providerPayout : b.providerEscrowContribution}
                             </div>
                             <span style={{ fontSize: '0.75rem', opacity: 0.7, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px', color: '#94a3b8' }}>
                                {b.status === 'ACTIVE' ? 'Escrow Pool' : b.status.replace('_', ' ')}
                             </span>
                          </div>
                       </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {/* Modals */}
      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        user={user} 
        recipientName={selectedApp?.seekerId?.profile?.fullName || selectedApp?.seekerId?.email || 'Candidate'} 
        socket={socket} 
        roomName={`room_${selectedApp?._id}`} 
      />

      <ContractModal 
        isOpen={isContractOpen} 
        onClose={() => setIsContractOpen(false)} 
        app={selectedApp} 
        bond={selectedApp ? bondMap[selectedApp._id?.toString()] : null} 
      />
    </div>
  );
};

export default ProviderDashboard;

