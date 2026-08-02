import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { UserCircle, Briefcase, RefreshCw, Calendar, Clock } from 'lucide-react';
import './MainDashboard.css';
import { SKILLS_DATA } from './utils/skillsList';
import { API_BASE_URL } from './apiConfig';

const API_BASE = API_BASE_URL;
const skillOptions = SKILLS_DATA.map(s => ({ value: s, label: s }));

const ProfileSettings = ({ user, setUser, role }) => {
  const [profile, setProfile] = useState(user?.profile || {});
  const [saving, setSaving] = useState(false);
  const [bonds, setBonds] = useState([]);
  const [currentSkill, setCurrentSkill] = useState('');

  // Sync profile whenever user prop changes (e.g. tab revisit)
  useEffect(() => {
    if (user?.profile) setProfile(user.profile);
  }, [user]);

  useEffect(() => {
    if (user && user._id) {
      axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const tId = toast.loading("Saving Profile...");
    try {
      const res = await axios.patch(`${API_BASE}/auth/profile/${user._id}`, { profile });
      // Update global user state so dashboard picks up new city/name immediately
      if (setUser) setUser(res.data);
      toast.success("Profile Saved!", { id: tId });
    } catch (err) {
      toast.error("Failed to update profile", { id: tId });
    } finally {
      setSaving(false);
    }
  };

  const addSkill = () => {
    if (currentSkill && !profile.skills?.includes(currentSkill)) {
      setProfile({ ...profile, skills: [...(profile.skills || []), currentSkill] });
      setCurrentSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile({ ...profile, skills: profile.skills.filter(s => s !== skill) });
  };

  const handleRenewBond = async (bondId) => {
    const tId = toast.loading("Checking Connectivity...");
    try {
      // 1. Healthcheck to Razorpay
      const health = await axios.get(`${API_BASE}/bonds/health`);
      if (!health.data.connected) {
        return toast.error("System Network Unreachable. Gateway Offline.", { id: tId });
      }

      toast.loading("Calculating Gamified Mathematics...", { id: tId });
      const { data } = await axios.post(`${API_BASE}/bonds/renew`, { bondId, extraMonths: 3 });
      toast.success("Bond Renewed & Trust Gamified!", { id: tId });
      
      axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
    } catch (err) { 
      toast.error(err.response?.data?.message || "Renewal Transaction Failed.", { id: tId }); 
    }
  };

  const handleSeekerPay = async (bond) => {
    const tId = toast.loading("Opening Payment Gateway...");
    try {
      const amount = Math.round(bond.seekerInitialToken);
      if (!amount || amount < 1) {
        toast.error("Invalid bond amount.", { id: tId });
        return;
      }

      const { data: config } = await axios.get(`${API_BASE}/bonds/config`);
      const { data: order } = await axios.post(`${API_BASE}/bonds/create-order`, {
        amount,
        bondId: bond._id
      });

      toast.dismiss(tId);

      if (!window.Razorpay) {
        toast.error("Payment gateway not loaded. Please refresh your browser.");
        return;
      }

      const options = {
        key: config.key,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "TrustLink Bond Escrow",
        description: `Worker Deposit — ₹${amount} (Half-Salary Token)`,
        order_id: order.id,
        handler: async (response) => {
          const vId = toast.loading("Confirming payment...");
          try {
            await axios.post(`${API_BASE}/bonds/seeker-pay`, {
              bondId: bond._id,
              razorpayPaymentId: response.razorpay_payment_id
            });
            toast.success("✅ Payment confirmed! Bond is now ACTIVE!", { id: vId });
            // Refresh bonds list
            axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
          } catch(err) {
            toast.error("Verification failed: " + (err.response?.data?.message || err.message), { id: vId });
          }
        },
        prefill: { email: user?.email, name: user?.profile?.fullName || '' },
        theme: { color: "#eab308" },
        modal: { ondismiss: () => toast("Payment window closed.") }
      };

      new window.Razorpay(options).open();
    } catch(err) {
      console.error("Seeker pay error:", err);
      toast.error("Error: " + (err.response?.data?.message || err.message), { id: tId });
    }
  };

  const resolveBond = async (applicationId, resolutionType) => {
    try {
      await axios.post(`${API_BASE}/bonds/resolve`, { applicationId, resolutionType });
      toast.success("Bond Handshake Action Synchronized");
      axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
    } catch (err) {
      toast.error("Failed handshake execution");
    }
  };

  return (
    <div className="dashboard-content" style={{ animation: 'fadeIn 0.5s', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      {/* Pending Payment Alert for Seeker */}
      {role === 'seeker' && bonds.filter(b => b.status === 'PENDING_SEEKER_PAYMENT').map(b => (
        <div key={b._id} style={{
          background: 'linear-gradient(135deg, #eab30833, #f59e0b22)',
          border: '2px solid #eab308',
          borderRadius: '16px',
          padding: '20px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div>
            <p style={{fontWeight: 'bold', fontSize: '1rem', margin: '0 0 4px', color: '#eab308'}}>
              ⚡ Action Required: Pay Your Bond Deposit
            </p>
            <p style={{margin: 0, fontSize: '0.85rem', color: 'var(--subtext-color)'}}>
              The Provider has already deposited ₹{b.providerEscrowContribution}. Pay your half (₹{b.seekerInitialToken}) to confirm the job and activate the bond.
            </p>
          </div>
          <button
            className="action-btn"
            style={{backgroundColor: '#eab308', color: '#000', fontWeight: 'bold', padding: '12px 20px', fontSize: '1rem', whiteSpace: 'nowrap'}}
            onClick={() => handleSeekerPay(b)}
          >
            💰 Pay ₹{b.seekerInitialToken} Now
          </button>
        </div>
      ))}

      <div className="card form-card">
        <h3 style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
          {role === 'seeker' ? <UserCircle size={22}/> : <Briefcase size={22}/>} 
          {role === 'seeker' ? 'Seeker Profile' : 'Company Profile'}
        </h3>
        <form onSubmit={handleSave} className="post-job-form">
          <div className="form-group" style={{marginTop: '20px'}}>
            <label>{role === 'seeker' ? 'Full Name' : 'Company Name'}</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder={role === 'seeker' ? 'John Doe' : 'Shree Maruti Plastic'} 
              value={profile[role === 'seeker' ? 'fullName' : 'companyName'] || ''} 
              onChange={e => setProfile({...profile, [role === 'seeker' ? 'fullName' : 'companyName']: e.target.value})} 
              required
            />
          </div>
          
          <div className="form-row">
             <div className="form-group">
                <label>Contact Phone</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="+91..." 
                  value={profile.phone || ''} 
                  onChange={e => setProfile({...profile, phone: e.target.value})} 
                  required
                />
             </div>
             <div className="form-group">
                <label>City / Region</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Mumbai, Delhi" 
                  value={profile.city || ''} 
                  onChange={e => setProfile({...profile, city: e.target.value})} 
                  required
                />
             </div>
          </div>
          <div className="form-row">
             {role === 'seeker' && (
               <div className="form-group">
                  <label>Experience (Years)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="0"
                    value={profile.experienceYears || 0} 
                    onChange={e => setProfile({...profile, experienceYears: e.target.value})} 
                  />
               </div>
             )}
          </div>
          
          {role === 'seeker' ? (
             <div className="form-group">
               <label>Skills Repository (250+ specific skills allowed)</label>
               <Select 
                 isMulti
                 options={skillOptions}
                 value={skillOptions.filter(opt => profile.skills?.includes(opt.value))}
                 onChange={(selectedOptions) => setProfile({...profile, skills: selectedOptions.map(opt => opt.value)})}
                 className="react-select-container"
                 classNamePrefix="react-select"
                 placeholder="Search & Add Skills..."
                 styles={{
                   control: (base) => ({
                     ...base,
                     background: 'var(--input-bg)',
                     borderColor: 'var(--border-color)',
                     color: 'var(--text-color)',
                     padding: '4px'
                   }),
                   menu: (base) => ({
                     ...base,
                     background: 'var(--card-bg)',
                     color: 'var(--text-color)',
                     zIndex: 100
                   }),
                   multiValue: (base) => ({
                     ...base,
                     backgroundColor: 'var(--accent-blue)',
                     borderRadius: '12px'
                   }),
                   multiValueLabel: (base) => ({
                     ...base,
                     color: 'white',
                     padding: '2px 8px'
                   })
                 }}
               />
             </div>
          ) : (
            <div className="form-group">
              <label>Business Address</label>
              <textarea 
                className="form-input" 
                placeholder="Full address of the factory/shop" 
                value={profile.companyAddress || ''} 
                onChange={e => setProfile({...profile, companyAddress: e.target.value})} 
                required
              />
            </div>
          )}
          
          <button type="submit" disabled={saving} className="action-btn gravity-btn post-btn">
            {saving ? 'Saving...' : 'Save Profile Integrity'}
          </button>
        </form>
      </div>

      <div className="card form-card">
        <h3>Bond Management Analytics</h3>
        <p style={{color: 'var(--subtext-color)', marginBottom: '20px'}}>Track historical and active bonds natively below.</p>
        
        {bonds.length === 0 ? <p>No bonds initialized yet.</p> : (
          <div style={{display: 'flex', flexDirection: 'column', gap: '15px'}}>
            {bonds.map(b => (
              <div key={b._id} style={{padding: '15px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-color)'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                  <h4 style={{margin: 0}}>Bond #{b._id.toString().slice(-6)}</h4>
                  <span className="role-badge" style={{background: b.status === 'ACTIVE' ? '#10b981' : '#64748b', color: '#fff'}}>{b.status}</span>
                </div>
                
                <div style={{display: 'flex', gap: '15px', marginTop: '10px', color: 'var(--subtext-color)', fontSize: '0.85rem'}}>
                  <span style={{display: 'flex', alignItems: 'center', gap: '5px'}}><Calendar size={14}/> <b>Start:</b> {new Date(b.startDate || b.createdAt).toLocaleDateString()}</span>
                  <span style={{display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-blue)'}}><Clock size={14}/> <b>End:</b> {new Date(b.endDate || b.createdAt).toLocaleDateString()}</span>
                </div>

                <p style={{margin: '10px 0 5px 0', fontSize: '0.9rem'}}><strong>Token Paid:</strong> ₹{b.seekerInitialToken} | <strong>Escrow Built:</strong> ₹{b.providerEscrowContribution}</p>
                
                {b.status === 'ACTIVE' && role === 'provider' && (
                  <div style={{marginTop: '15px'}}>
                    <button className="action-btn gravity-btn" style={{padding: '8px 16px', fontSize: '0.85rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '5px'}} onClick={() => handleRenewBond(b._id)}>
                      <RefreshCw size={16}/> Renew Bond (+3 Months & Gamified Trust)
                    </button>
                  </div>
                )}
                
                {b.status === 'PENDING_SEEKER_PAYMENT' && role === 'seeker' && (
                  <div style={{marginTop: '15px'}}>
                    <button className="action-btn gravity-btn" style={{padding: '8px 16px', fontSize: '0.85rem', width: 'auto', backgroundColor: '#eab308', color: '#000'}} onClick={() => handleSeekerPay(b)}>
                      Pay Escrow Token (₹{b.seekerInitialToken})
                    </button>
                  </div>
                )}

                {b.status === 'ACTIVE' && role === 'seeker' && (
                  <div style={{marginTop: '15px', display: 'flex', gap: '10px', alignItems: 'center'}}>
                    <p style={{color: '#10b981', fontWeight: 'bold', fontSize: '0.9rem', margin: 0}}>✅ Token Escrow Secured</p>
                    <button className="action-btn" style={{backgroundColor: '#f59e0b', color: '#fff', padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'REQUEST_MUTUAL_SEEKER')}>
                      Request Mutual Cancel
                    </button>
                  </div>
                )}

                {/* Handshake: Mutual Cancel Permissions */}
                {b.status === 'MUTUAL_CANCEL_REQ_SEEKER' && role === 'provider' && (
                  <div style={{marginTop: '15px'}}>
                    <button className="action-btn" style={{backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'APPROVE_MUTUAL')}>
                      Approve Seeker's Mutual Cancel
                    </button>
                  </div>
                )}
                
                {b.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && role === 'seeker' && (
                  <div style={{marginTop: '15px'}}>
                    <button className="action-btn" style={{backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', fontSize: '0.85rem'}} onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'APPROVE_MUTUAL')}>
                      Approve Provider's Mutual Cancel
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSettings;
