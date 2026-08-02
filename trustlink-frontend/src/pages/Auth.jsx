import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, UserCheck, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../MainDashboard.css';
import { API_BASE_URL } from '../apiConfig';

const Auth = ({ user, setUser, role, setRole }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    const slowNotice = setTimeout(() => {
      toast("Waking up backend server (Render free tier), please wait...", { icon: "⏳", duration: 5000 });
    }, 4000);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: formData.email,
        password: formData.password,
        role: role
      });
      clearTimeout(slowNotice);
      toast.success(res.data.message);
      setIsSignup(false);
    } catch (err) {
      clearTimeout(slowNotice);
      console.error("Signup Error Details:", err);
      const errorMsg = err.response?.data?.message || 
        (err.message === "Network Error" || !err.response 
          ? "Network Error: Cannot reach Backend URL. Check VITE_API_BASE_URL setting in Vercel!" 
          : err.message || "Signup Failed");
      toast.error(errorMsg, { duration: 6000 });
    } finally {
      clearTimeout(slowNotice);
      setLoading(false);
    }
  };

  const handleLogin1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    const slowNotice = setTimeout(() => {
      toast("Waking up backend server (Render free tier), please wait...", { icon: "⏳", duration: 5000 });
    }, 4000);

    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-step1`, {
        email: formData.email,
        password: formData.password,
        role: role
      });
      clearTimeout(slowNotice);
      if (res.data?.otp) {
        const digits = res.data.otp.split('');
        setOtpArray(digits);
        setFormData(prev => ({ ...prev, otp: res.data.otp }));
        toast.success(`Code: ${res.data.otp} (Sent to Email)`, { duration: 8000, icon: '🔑' });
      } else {
        toast.success("Security Code Sent to Email!");
      }
      setStep(2);
    } catch (err) {
      clearTimeout(slowNotice);
      console.error("Login Step 1 Error Details:", err);
      const errorMsg = err.response?.data?.message || 
        (err.message === "Network Error" || !err.response 
          ? "Network Error: Cannot reach Backend URL. Check VITE_API_BASE_URL setting in Vercel!" 
          : err.message || "Login Failed");
      toast.error(errorMsg, { duration: 6000 });
    } finally {
      clearTimeout(slowNotice);
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otpArray];
    newOtp[index] = val;
    setOtpArray(newOtp);
    setFormData(prev => ({...prev, otp: newOtp.join('')}));
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleLogin2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-step2`, {
        email: formData.email,
        otp: formData.otp
      });
      setUser(res.data.user);
      toast.success("Identity Verified");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="card" 
        style={{ width: '100%', maxWidth: '450px', padding: '50px', position: 'relative', overflow: 'hidden' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', background: 'var(--accent-blue-active)', padding: '15px', borderRadius: '20px', marginBottom: '20px' }}>
            <ShieldCheck size={40} color="var(--accent-blue)"/>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.5rem', margin: '0 0 10px', letterSpacing: '-0.05em' }}>TrustLink</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Secure Native Labor Protocols</p>
        </div>

        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '5px', marginBottom: '30px' }}>
          <button 
            onClick={() => setRole('seeker')} 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: role === 'seeker' ? 'var(--accent-blue)' : 'transparent', color: role === 'seeker' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }}
          >
            Seeker
          </button>
          <button 
            onClick={() => setRole('provider')} 
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: 'none', background: role === 'provider' ? 'var(--accent-blue)' : 'transparent', color: role === 'provider' ? '#fff' : 'var(--text-secondary)', fontWeight: '700', cursor: 'pointer', transition: '0.3s' }}
          >
            Provider
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="auth-form" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
              onSubmit={isSignup ? handleSignup : handleLogin1}
            >
              <div style={{ marginBottom: '20px', position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}/>
                <input 
                  type="email" placeholder="Email Address" required className="form-input" style={{ paddingLeft: '55px' }}
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div style={{ marginBottom: '30px', position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}/>
                <input 
                  type="password" placeholder="Secure Password" required className="form-input" style={{ paddingLeft: '55px' }}
                  value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button type="submit" className="action-btn" style={{ width: '100%', padding: '18px' }} disabled={loading}>
                {loading ? 'Processing...' : (isSignup ? 'Create Secure Account' : 'Authenticate')} <ArrowRight size={18} style={{ marginLeft: '10px' }}/>
              </button>

              <p 
                style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.9rem', color: 'var(--text-secondary)', cursor: 'pointer' }}
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Already registered? Login" : "New to TrustLink? Sign Up"}
              </p>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
              onSubmit={handleLogin2}
            >
              <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                <h3 style={{ margin: '0 0 10px' }}>Security Verification</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Enter the 6-digit code sent to your email.</p>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '30px' }}>
                {otpArray.map((digit, i) => (
                  <input 
                    key={i} type="text" maxLength="1" value={digit}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    style={{ width: '45px', height: '55px', textAlign: 'center', fontSize: '1.2rem', fontWeight: '800', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-color)', color: '#fff', outline: 'none' }}
                  />
                ))}
              </div>

              <button type="submit" className="action-btn" style={{ width: '100%', padding: '18px' }} disabled={loading}>
                {loading ? 'Verifying...' : 'Verify Identity'} <UserCheck size={18} style={{ marginLeft: '10px' }}/>
              </button>
              
              <p 
                style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.8rem', color: 'var(--accent-blue)', cursor: 'pointer' }}
                onClick={() => setStep(1)}
              >
                Back to credentials
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
