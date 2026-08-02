import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Calendar, Briefcase, Award, MessageSquare, Star, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL } from '../apiConfig';

const API_BASE = API_BASE_URL;

const QUESTION_LABELS = {
  punctuality: '⏰ Punctuality',
  quality: '🎯 Quality',
  communication: '💬 Communication',
  reliability: '🤝 Reliability',
  overall: '⭐ Overall'
};

const HistoryDashboard = ({ user, role }) => {
  const [historyApps, setHistoryApps] = useState([]);
  const [bonds, setBonds] = useState([]);
  const [reviewModal, setReviewModal] = useState(null);
  const [reviewedApps, setReviewedApps] = useState(new Set());

  const [metrics, setMetrics] = useState({
    punctuality: 3, quality: 3, communication: 3, reliability: 3, overall: 3
  });
  const [comments, setComments] = useState('');

  useEffect(() => {
    if (!user?._id) return;
    const path = role === 'provider' ? 'provider' : 'seeker';
    
    // Fetch apps & bonds in parallel
    Promise.all([
      axios.get(`${API_BASE}/applications/${path}/${user._id}`),
      axios.get(`${API_BASE}/bonds/user/${user._id}`)
    ]).then(([appRes, bondRes]) => {
      // Show rejected/cancelled apps OR apps linked to Terminated Bonds
      const allApps = appRes.data;
      const allBonds = bondRes.data;
      setBonds(allBonds);
      
      const terminationStatuses = ['MUTUALLY_CANCELLED', 'BREACHED', 'COMPLETED'];
      const filtered = allApps.filter(a => {
        if (['REJECTED', 'CANCELLED'].includes(a.status)) return true;
        const b = allBonds.find(x => (x.applicationId?._id || x.applicationId)?.toString() === a._id.toString());
        return b && terminationStatuses.includes(b.status);
      });
      setHistoryApps(filtered);
    }).catch(console.error);
  }, [user, role]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewModal) return;
    try {
      const targetId = role === 'provider'
        ? (reviewModal.seekerId?._id || reviewModal.seekerId)
        : (reviewModal.providerId?._id || reviewModal.providerId);

      await axios.post(`${API_BASE}/reviews`, {
        applicationId: reviewModal._id,
        reviewerId: user._id,
        targetId,
        metrics,
        comments
      });

      toast.success("✅ Trust Review Submitted!");
      setReviewedApps(prev => new Set([...prev, reviewModal._id]));
      setReviewModal(null);
    } catch (err) {
      toast.error("Failed to submit review.");
    }
  };

  const getSettlementColor = (status) => {
    if (status === 'COMPLETED') return 'var(--success)';
    if (status === 'BREACHED') return 'var(--error)';
    return 'var(--warning)';
  };

  return (
    <div className="dashboard-content">
      <div className="section-header" style={{ marginBottom: '40px' }}>
        <div>
          <h2 style={{ fontSize: '2.4rem', marginBottom: '8px' }}>Work History</h2>
          <p style={{ color: 'var(--text-secondary)' }}>Review your past professional engagements and bond settlements.</p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {historyApps.length === 0 ? (
          <div className="card" style={{ padding: '60px', textAlign: 'center' }}>
            <Briefcase size={48} style={{ opacity: 0.1, marginBottom: '20px' }}/>
            <p style={{ color: 'var(--text-secondary)' }}>No history records found.</p>
          </div>
        ) : historyApps.map((app, idx) => {
          const bond = bonds.find(b => (b.applicationId?._id || b.applicationId)?.toString() === app._id.toString());
          const alreadyReviewed = reviewedApps.has(app._id);
          const status = bond?.status || app.status;

          return (
            <motion.div 
              key={app._id} 
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              className="card" style={{ padding: '0', overflow: 'hidden' }}
            >
              <div style={{ padding: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ flex: 1, minWidth: '300px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <h4 style={{ margin: 0, fontSize: '1.4rem' }}>{app.jobId?.title || 'Unknown Contract'}</h4>
                    <span className="role-badge" style={{ 
                      background: status === 'COMPLETED' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255,255,255,0.05)',
                      color: status === 'COMPLETED' ? 'var(--success)' : 'var(--text-secondary)',
                      borderColor: status === 'COMPLETED' ? 'var(--success)' : 'rgba(255,255,255,0.1)'
                    }}>
                      {status}
                    </span>
                  </div>
                  
                  <p style={{ margin: '15px 0', display: 'flex', gap: '20px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={14}/> {new Date(app.createdAt).toLocaleDateString()}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Award size={14}/> ₹{app.jobId?.salary}/mo</span>
                    <span>📍 {app.jobId?.city}</span>
                  </p>

                  {bond && (
                    <div style={{ 
                      marginTop: '20px', padding: '15px 20px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px', display: 'flex', gap: '30px' 
                    }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Seeker Payout</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: bond.seekerPayout > 0 ? 'var(--success)' : 'var(--text-primary)' }}>₹{bond.seekerPayout || 0}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Provider Payout</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800' }}>₹{bond.providerPayout || 0}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  {bond && !alreadyReviewed && (
                    <button 
                      className="action-btn"
                      onClick={() => setReviewModal(app)}
                    >
                      <Star size={18}/> Leave Review
                    </button>
                  )}
                  {alreadyReviewed && (
                    <span style={{ color: 'var(--success)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Award size={18}/> Review Recorded
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Review Modal */}
      <AnimatePresence>
        {reviewModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="card" style={{ width: '100%', maxWidth: '500px', padding: '40px' }}
            >
              <h3 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Trust Review</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '30px' }}>Your feedback permanently affects the trust reputation of this partner.</p>

              <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {Object.entries(QUESTION_LABELS).map(([key, label]) => (
                  <div key={key}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <label style={{ fontSize: '0.9rem', fontWeight: '600' }}>{label}</label>
                      <span style={{ color: 'var(--warning)', fontWeight: '800' }}>{metrics[key]} / 5</span>
                    </div>
                    <input 
                      type="range" min="1" max="5" value={metrics[key]} 
                      onChange={e => setMetrics({ ...metrics, [key]: parseInt(e.target.value) })}
                      style={{ width: '100%', accentColor: 'var(--accent-blue)' }} 
                    />
                  </div>
                ))}

                <div style={{ marginTop: '10px' }}>
                  <label style={{ fontSize: '0.9rem', fontWeight: '600', display: 'block', marginBottom: '10px' }}>Comments</label>
                  <textarea 
                    className="form-input" placeholder="Professional feedback..." value={comments} onChange={e => setComments(e.target.value)}
                    style={{ minHeight: '100px', resize: 'vertical' }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                  <button type="submit" className="action-btn" style={{ flex: 1 }}>Submit Trust Score</button>
                  <button type="button" className="action-btn secondary-btn" onClick={() => setReviewModal(null)}>Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HistoryDashboard;
