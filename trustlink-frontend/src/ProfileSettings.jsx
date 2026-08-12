import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Select from 'react-select';
import toast from 'react-hot-toast';
import { 
  UserCircle, 
  Briefcase, 
  RefreshCw, 
  Calendar, 
  Clock, 
  ShieldCheck, 
  User, 
  Phone, 
  MapPin, 
  Award, 
  CheckCircle2, 
  Zap, 
  Building2, 
  Save,
  CreditCard
} from 'lucide-react';
import './MainDashboard.css';
import { SKILLS_DATA } from './utils/skillsList';
import { API_BASE_URL } from './apiConfig';

const API_BASE = API_BASE_URL;
const skillOptions = SKILLS_DATA.map(s => ({ value: s, label: s }));

const ProfileSettings = ({ user, setUser, role }) => {
  const [profile, setProfile] = useState(user?.profile || {});
  const [saving, setSaving] = useState(false);
  const [bonds, setBonds] = useState([]);

  // Sync profile whenever user prop changes
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
    const tId = toast.loading("Saving Profile Settings...");
    try {
      const res = await axios.patch(`${API_BASE}/auth/profile/${user._id}`, { profile });
      if (setUser) setUser(res.data);
      toast.success("Profile Integrity Saved!", { id: tId });
    } catch (err) {
      toast.error("Failed to update profile", { id: tId });
    } finally {
      setSaving(false);
    }
  };

  const handleRenewBond = async (bondId) => {
    const tId = toast.loading("Checking System Connectivity...");
    try {
      const health = await axios.get(`${API_BASE}/bonds/health`);
      if (!health.data.connected) {
        return toast.error("System Network Unreachable. Gateway Offline.", { id: tId });
      }

      toast.loading("Calculating Gamified Mathematics...", { id: tId });
      await axios.post(`${API_BASE}/bonds/renew`, { bondId, extraMonths: 3 });
      toast.success("Bond Renewed & Trust Gamified!", { id: tId });
      
      axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
    } catch (err) { 
      toast.error(err.response?.data?.message || "Renewal Transaction Failed.", { id: tId }); 
    }
  };

  const handleSeekerPay = async (bond) => {
    const tId = toast.loading("Opening Escrow Payment Gateway...");
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
        toast.error("Payment gateway script not loaded. Please refresh your browser.");
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
          const vId = toast.loading("Confirming escrow deposit...");
          try {
            await axios.post(`${API_BASE}/bonds/seeker-pay`, {
              bondId: bond._id,
              razorpayPaymentId: response.razorpay_payment_id
            });
            toast.success("✅ Payment confirmed! Bond is now ACTIVE!", { id: vId });
            axios.get(`${API_BASE}/bonds/user/${user._id}`).then(res => setBonds(res.data)).catch(console.error);
          } catch(err) {
            toast.error("Verification failed: " + (err.response?.data?.message || err.message), { id: vId });
          }
        },
        prefill: { email: user?.email, name: user?.profile?.fullName || '' },
        theme: { color: "#6366f1" },
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

  const displayName = role === 'seeker' 
    ? (profile.fullName || 'Seeker User') 
    : (profile.companyName || 'Provider Enterprise');

  // Calculate Dynamic Protocol Trust Score (0 - 100)
  const calculateTrustScore = () => {
    let score = 40; // Base score
    if (profile.fullName || profile.companyName) score += 15;
    if (profile.phone) score += 15;
    if (profile.city) score += 10;
    if (bonds.length > 0) score += Math.min(20, bonds.length * 10);
    return Math.min(100, score);
  };

  const trustScore = calculateTrustScore();

  return (
    <div className="dashboard-content" style={{ animation: 'fadeIn 0.5s', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Hero Header Banner */}
      <div 
        className="card card-glow" 
        style={{ 
          padding: '30px 35px', 
          background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.7))', 
          borderRadius: '24px', 
          border: '1px solid rgba(255, 255, 255, 0.12)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
          <div style={{ 
            width: '72px', 
            height: '72px', 
            borderRadius: '22px', 
            background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : role === 'provider' ? 'linear-gradient(135deg, #059669, #10b981)' : 'linear-gradient(135deg, #7c3aed, #a855f7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 25px rgba(99, 102, 241, 0.3)'
          }}>
            {role === 'seeker' ? <User size={36} color="#fff" /> : <Building2 size={36} color="#fff" />}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: '800', margin: 0, color: '#f8fafc' }}>
                {displayName}
              </h2>
              <span className="role-badge" style={{ background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'linear-gradient(135deg, #059669, #10b981)', color: '#fff' }}>
                {role}
              </span>
            </div>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>{user?.email}</span>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#64748b' }}></span>
              <span style={{ color: '#38bdf8', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={14} /> Identity Verified
              </span>
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Active Bonds</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#818cf8', fontFamily: 'Outfit' }}>{bonds.filter(b => b.status === 'ACTIVE').length}</span>
          </div>
          <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '12px 20px', textAlign: 'center' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', fontWeight: '600', textTransform: 'uppercase' }}>Trust Score</span>
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#34d399', fontFamily: 'Outfit' }}>98.5%</span>
          </div>
        </div>
      </div>

      {/* Pending Payment Alert Banner */}
      {role === 'seeker' && bonds.filter(b => b.status === 'PENDING_SEEKER_PAYMENT').map(b => (
        <div key={b._id} style={{
          background: 'linear-gradient(135deg, rgba(234, 179, 8, 0.15), rgba(245, 158, 11, 0.08))',
          border: '1px solid rgba(234, 179, 8, 0.4)',
          borderRadius: '20px',
          padding: '22px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '20px',
          boxShadow: '0 0 30px rgba(234, 179, 8, 0.15)',
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ background: 'rgba(234, 179, 8, 0.2)', padding: '12px', borderRadius: '14px', color: '#eab308' }}>
              <CreditCard size={26} />
            </div>
            <div>
              <h4 style={{ fontWeight: '800', fontSize: '1.1rem', margin: '0 0 4px', color: '#fef08a' }}>
                Escrow Action Required: Confirm Bond Token
              </h4>
              <p style={{ margin: 0, fontSize: '0.88rem', color: '#cbd5e1' }}>
                Provider deposited ₹{b.providerEscrowContribution}. Complete your ₹{b.seekerInitialToken} half-salary token to activate protection.
              </p>
            </div>
          </div>
          <button
            className="btn-premium-primary"
            style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000', fontWeight: '800', padding: '14px 26px', borderRadius: '14px' }}
            onClick={() => handleSeekerPay(b)}
          >
            💰 Pay ₹{b.seekerInitialToken} Now
          </button>
        </div>
      ))}

      {/* Main Settings Form Card */}
      <div className="card" style={{ padding: '32px 36px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '18px' }}>
          <div style={{ background: 'rgba(99, 102, 241, 0.15)', padding: '10px', borderRadius: '14px', color: '#818cf8' }}>
            {role === 'seeker' ? <UserCircle size={24}/> : <Briefcase size={24}/>}
          </div>
          <div>
            <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', margin: 0, fontWeight: '700' }}>
              {role === 'seeker' ? 'Seeker Profile Configuration' : 'Company & Business Details'}
            </h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
              Update your account details, location, contact preferences, and skill catalog.
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                {role === 'seeker' ? 'Full Legal Name' : 'Company / Business Name'}
              </label>
              <div style={{ position: 'relative' }}>
                {role === 'seeker' ? (
                  <User size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                ) : (
                  <Building2 size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                )}
                <input 
                  type="text" 
                  className="form-input-premium" 
                  style={{ paddingLeft: '48px' }}
                  placeholder={role === 'seeker' ? 'e.g. Rahul Sharma' : 'e.g. Shree Maruti Logistics'} 
                  value={profile[role === 'seeker' ? 'fullName' : 'companyName'] || ''} 
                  onChange={e => setProfile({...profile, [role === 'seeker' ? 'fullName' : 'companyName']: e.target.value})} 
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                Contact Phone Number
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="form-input-premium" 
                  style={{ paddingLeft: '48px' }}
                  placeholder="+91 98765 43210" 
                  value={profile.phone || ''} 
                  onChange={e => setProfile({...profile, phone: e.target.value})} 
                  required
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                City / Primary Region
              </label>
              <div style={{ position: 'relative' }}>
                <MapPin size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                <input 
                  type="text" 
                  className="form-input-premium" 
                  style={{ paddingLeft: '48px' }}
                  placeholder="e.g. Mumbai, Surat, Bengaluru" 
                  value={profile.city || ''} 
                  onChange={e => setProfile({...profile, city: e.target.value})} 
                  required
                />
              </div>
            </div>

            {role === 'seeker' && (
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                  Total Experience (Years)
                </label>
                <div style={{ position: 'relative' }}>
                  <Award size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                  <input 
                    type="number" 
                    className="form-input-premium" 
                    style={{ paddingLeft: '48px' }}
                    min="0"
                    placeholder="e.g. 5"
                    value={profile.experienceYears || 0} 
                    onChange={e => setProfile({...profile, experienceYears: e.target.value})} 
                  />
                </div>
              </div>
            )}
          </div>

          {role === 'seeker' ? (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                Skills & Technical Expertise (250+ Verified Catalog)
              </label>
              <Select 
                isMulti
                options={skillOptions}
                value={skillOptions.filter(opt => profile.skills?.includes(opt.value))}
                onChange={(selectedOptions) => setProfile({...profile, skills: selectedOptions.map(opt => opt.value)})}
                className="react-select-container"
                classNamePrefix="react-select"
                placeholder="Search and select relevant skills..."
                styles={{
                  control: (base, state) => ({
                    ...base,
                    background: 'rgba(255, 255, 255, 0.03)',
                    borderColor: state.isFocused ? '#6366f1' : 'rgba(255, 255, 255, 0.08)',
                    borderRadius: '14px',
                    padding: '6px',
                    boxShadow: state.isFocused ? '0 0 20px rgba(99, 102, 241, 0.25)' : 'none',
                    color: '#ffffff'
                  }),
                  menu: (base) => ({
                    ...base,
                    background: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '14px',
                    color: '#ffffff',
                    zIndex: 100,
                    overflow: 'hidden'
                  }),
                  option: (base, state) => ({
                    ...base,
                    background: state.isFocused ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: state.isFocused ? '#38bdf8' : '#cbd5e1',
                    cursor: 'pointer'
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: 'rgba(99, 102, 241, 0.25)',
                    border: '1px solid rgba(99, 102, 241, 0.4)',
                    borderRadius: '10px'
                  }),
                  multiValueLabel: (base) => ({
                    ...base,
                    color: '#a5b4fc',
                    fontWeight: '600',
                    padding: '3px 8px'
                  }),
                  multiValueRemove: (base) => ({
                    ...base,
                    color: '#a5b4fc',
                    ':hover': {
                      backgroundColor: 'rgba(244, 63, 94, 0.3)',
                      color: '#f43f5e'
                    }
                  })
                }}
              />
            </div>
          ) : (
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
                Full Registered Business Address
              </label>
              <textarea 
                className="form-input-premium" 
                rows="3"
                placeholder="Full address of factory, office, or commercial premises..." 
                value={profile.companyAddress || ''} 
                onChange={e => setProfile({...profile, companyAddress: e.target.value})} 
                required
              />
            </div>
          )}

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'flex-end' }}>
            <button 
              type="submit" 
              disabled={saving} 
              className="btn-premium-primary"
              style={{ padding: '14px 32px', borderRadius: '14px', fontSize: '0.95rem' }}
            >
              <Save size={18} style={{ marginRight: '8px' }} />
              {saving ? 'Saving Integrity...' : 'Save Profile Settings'}
            </button>
          </div>
        </form>
      </div>

      {/* Bond Management Analytics Card */}
      <div className="card" style={{ padding: '32px 36px', borderRadius: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', padding: '10px', borderRadius: '14px', color: '#34d399' }}>
              <ShieldCheck size={24}/>
            </div>
            <div>
              <h3 style={{ fontFamily: 'Outfit', fontSize: '1.35rem', margin: 0, fontWeight: '700' }}>
                Bond Escrow & Gamified Trust Analytics
              </h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>
                Real-time overview of initialized labor contracts, escrow guarantees, and renewal states.
              </p>
            </div>
          </div>
          <span style={{ fontSize: '0.85rem', background: 'rgba(255, 255, 255, 0.04)', padding: '6px 14px', borderRadius: '12px', color: '#94a3b8', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            Total Bonds: <strong>{bonds.length}</strong>
          </span>
        </div>

        {bonds.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '18px', border: '1px dashed rgba(255, 255, 255, 0.08)' }}>
            <Zap size={36} color="#64748b" style={{ marginBottom: '10px' }} />
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>No active or historical bond agreements recorded yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {bonds.map(b => (
              <div 
                key={b._id} 
                style={{ 
                  padding: '20px 24px', 
                  border: '1px solid rgba(255, 255, 255, 0.08)', 
                  borderRadius: '18px', 
                  background: 'rgba(15, 23, 42, 0.5)',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontWeight: '800', fontSize: '1.05rem', color: '#f8fafc', fontFamily: 'Outfit' }}>
                      Bond Protocol #{b._id.toString().slice(-6).toUpperCase()}
                    </span>
                  </div>
                  <span className="role-badge" style={{
                    background: b.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.2)' : b.status === 'PENDING_SEEKER_PAYMENT' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(100, 116, 139, 0.2)',
                    color: b.status === 'ACTIVE' ? '#34d399' : b.status === 'PENDING_SEEKER_PAYMENT' ? '#fef08a' : '#cbd5e1',
                    border: `1px solid ${b.status === 'ACTIVE' ? 'rgba(16, 185, 129, 0.4)' : b.status === 'PENDING_SEEKER_PAYMENT' ? 'rgba(234, 179, 8, 0.4)' : 'rgba(100, 116, 139, 0.4)'}`
                  }}>
                    {b.status}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', padding: '14px', background: 'rgba(255,255,255,0.02)', borderRadius: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    <Calendar size={16} color="#818cf8" /> 
                    <span><strong>Start:</strong> {new Date(b.startDate || b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1', fontSize: '0.85rem' }}>
                    <Clock size={16} color="#38bdf8" /> 
                    <span><strong>Expiry:</strong> {new Date(b.endDate || b.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <strong>Token Paid:</strong> <span style={{ color: '#34d399' }}>₹{b.seekerInitialToken}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                    <strong>Escrow Built:</strong> <span style={{ color: '#818cf8' }}>₹{b.providerEscrowContribution}</span>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
                  {b.status === 'ACTIVE' && role === 'provider' && (
                    <button 
                      className="btn-premium-primary" 
                      style={{ padding: '10px 20px', fontSize: '0.85rem', borderRadius: '12px' }} 
                      onClick={() => handleRenewBond(b._id)}
                    >
                      <RefreshCw size={15} style={{ marginRight: '6px' }} /> Renew Bond (+3 Months & Gamified Trust)
                    </button>
                  )}
                  
                  {b.status === 'PENDING_SEEKER_PAYMENT' && role === 'seeker' && (
                    <button 
                      className="btn-premium-primary" 
                      style={{ background: 'linear-gradient(135deg, #eab308, #ca8a04)', color: '#000', padding: '10px 20px', fontSize: '0.85rem', borderRadius: '12px' }} 
                      onClick={() => handleSeekerPay(b)}
                    >
                      Pay Escrow Token (₹{b.seekerInitialToken})
                    </button>
                  )}

                  {b.status === 'ACTIVE' && role === 'seeker' && (
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span style={{ color: '#34d399', fontWeight: '700', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircle2 size={16} /> Token Escrow Active
                      </span>
                      <button 
                        className="action-btn" 
                        style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', fontSize: '0.8rem', borderRadius: '12px' }} 
                        onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'REQUEST_MUTUAL_SEEKER')}
                      >
                        Request Mutual Cancel
                      </button>
                    </div>
                  )}

                  {b.status === 'MUTUAL_CANCEL_REQ_SEEKER' && role === 'provider' && (
                    <button 
                      className="action-btn" 
                      style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '12px' }} 
                      onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'APPROVE_MUTUAL')}
                    >
                      Approve Seeker's Mutual Cancel
                    </button>
                  )}
                  
                  {b.status === 'MUTUAL_CANCEL_REQ_PROVIDER' && role === 'seeker' && (
                    <button 
                      className="action-btn" 
                      style={{ backgroundColor: '#f59e0b', color: '#fff', padding: '8px 16px', fontSize: '0.85rem', borderRadius: '12px' }} 
                      onClick={() => resolveBond(b.applicationId?._id || b.applicationId, 'APPROVE_MUTUAL')}
                    >
                      Approve Provider's Mutual Cancel
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default ProfileSettings;

