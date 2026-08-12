import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, UserCheck, ArrowRight, Sparkles, Building, User, KeyRound, RefreshCw, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import '../MainDashboard.css';
import { API_BASE_URL } from '../apiConfig';

const Auth = ({ user, setUser, role, setRole }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [step, setStep] = useState(1); 
  const [formData, setFormData] = useState({ email: '', password: '', otp: '' });
  const [otpArray, setOtpArray] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/signup`, {
        email: formData.email,
        password: formData.password,
        role: role
      });
      toast.success(res.data.message || "Account Created! Please Login.");
      setIsSignup(false);
    } catch (err) {
      console.error("Signup Error:", err);
      toast.error(err.response?.data?.message || "Signup Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    const tId = toast.loading("Verifying credentials & sending OTP email...");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-step1`, {
        email: formData.email,
        password: formData.password,
        role: role
      });
      toast.success(res.data?.message || "6-digit OTP code sent to your email!", { id: tId });
      setStep(2);
      setResendCooldown(30);
    } catch (err) {
      console.error("Login Step 1 Error:", err);
      toast.error(err.response?.data?.message || "Invalid Email or Password", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    const tId = toast.loading("Resending OTP Code...");
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
        email: formData.email
      });
      toast.success(res.data?.message || "Fresh 6-digit OTP sent to email!", { id: tId });
      setResendCooldown(30);
      setOtpArray(['', '', '', '', '', '']);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP", { id: tId });
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (e, index) => {
    const val = e.target.value;
    if (isNaN(val)) return;
    const newOtp = [...otpArray];
    newOtp[index] = val;
    setOtpArray(newOtp);
    setFormData(prev => ({ ...prev, otp: newOtp.join('') }));
    if (val && e.target.nextSibling) e.target.nextSibling.focus();
  };

  const handleOtpKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otpArray[index] && e.target.previousSibling) {
      e.target.previousSibling.focus();
    }
  };

  const handleLogin2 = async (e) => {
    e.preventDefault();
    const finalOtp = otpArray.join('').trim();
    if (finalOtp.length !== 6) {
      toast.error("Please enter the complete 6-digit code sent to your email");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login-step2`, {
        email: formData.email,
        otp: finalOtp
      });
      setUser(res.data.user);
      toast.success("Identity Verified! Welcome to TrustLink.");
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.15), transparent 70%), #030712', padding: '20px' }}>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="card-glow"
        style={{ width: '100%', maxWidth: '460px', background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '28px', padding: '45px', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ display: 'inline-flex', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(168, 85, 247, 0.2))', border: '1px solid rgba(99, 102, 241, 0.4)', padding: '16px', borderRadius: '22px', marginBottom: '18px', boxShadow: '0 0 30px rgba(99, 102, 241, 0.3)' }}>
            <ShieldCheck size={38} color="#818cf8"/>
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2.6rem', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-0.04em', background: 'linear-gradient(to right, #ffffff, #a5b4fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            TrustLink
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0, fontWeight: '500' }}>
            Next-Gen Labor Protocol & Escrow Guarantee
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '4px', marginBottom: '30px' }}>
          <button 
            type="button"
            onClick={() => setRole('seeker')} 
            style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: role === 'seeker' ? 'linear-gradient(135deg, #4f46e5, #6366f1)' : 'transparent', color: role === 'seeker' ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <User size={15} /> Seeker
          </button>
          <button 
            type="button"
            onClick={() => setRole('provider')} 
            style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: role === 'provider' ? 'linear-gradient(135deg, #059669, #10b981)' : 'transparent', color: role === 'provider' ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Building size={15} /> Provider
          </button>
          <button 
            type="button"
            onClick={() => setRole('admin')} 
            style={{ flex: 1, padding: '11px', borderRadius: '12px', border: 'none', background: role === 'admin' ? 'linear-gradient(135deg, #7c3aed, #a855f7)' : 'transparent', color: role === 'admin' ? '#fff' : '#94a3b8', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Sparkles size={15} /> Admin
          </button>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.form 
              key="auth-form" 
              initial={{ opacity: 0, x: -15 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 15 }}
              onSubmit={isSignup ? handleSignup : handleLogin1}
            >
              <div style={{ marginBottom: '18px', position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}/>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  required 
                  className="form-input-premium" 
                  style={{ paddingLeft: '50px' }}
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div style={{ marginBottom: '28px', position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '18px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }}/>
                <input 
                  type="password" 
                  placeholder="Secure Password" 
                  required 
                  className="form-input-premium" 
                  style={{ paddingLeft: '50px' }}
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})}
                />
              </div>

              <button 
                type="submit" 
                className="btn-premium-primary" 
                style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '1rem' }} 
                disabled={loading}
              >
                {loading ? 'Sending Verification Email...' : (isSignup ? 'Create Secure Account' : 'Authenticate')} 
                <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
              </button>

              <p 
                style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.88rem', color: '#94a3b8', cursor: 'pointer', transition: '0.2s' }}
                onClick={() => setIsSignup(!isSignup)}
              >
                {isSignup ? "Already registered? Sign In" : "New to TrustLink? Create an Account"}
              </p>
            </motion.form>
          ) : (
            <motion.form 
              key="otp-form" 
              initial={{ opacity: 0, x: 15 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -15 }}
              onSubmit={handleLogin2}
            >
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'inline-flex', background: 'rgba(99,102,241,0.1)', padding: '12px', borderRadius: '50%', marginBottom: '12px', color: '#818cf8' }}>
                  <KeyRound size={26} />
                </div>
                <h3 style={{ fontFamily: 'Outfit', fontSize: '1.4rem', margin: '0 0 6px' }}>Two-Factor Security</h3>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0 }}>
                  Enter the 6-digit verification code sent to <br/>
                  <strong style={{ color: '#f8fafc' }}>{formData.email}</strong>
                </p>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
                {otpArray.map((digit, i) => (
                  <input 
                    key={i} 
                    type="text" 
                    maxLength="1" 
                    value={digit}
                    onChange={(e) => handleOtpChange(e, i)}
                    onKeyDown={(e) => handleOtpKeyDown(e, i)}
                    style={{ 
                      width: '46px', 
                      height: '56px', 
                      textAlign: 'center', 
                      fontSize: '1.4rem', 
                      fontWeight: '800', 
                      borderRadius: '12px', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: digit ? '1px solid #6366f1' : '1px solid rgba(255,255,255,0.1)', 
                      color: '#ffffff', 
                      outline: 'none',
                      boxShadow: digit ? '0 0 15px rgba(99,102,241,0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>

              <button 
                type="submit" 
                className="btn-premium-primary" 
                style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '1rem', marginBottom: '16px' }} 
                disabled={loading}
              >
                {loading ? 'Verifying Code...' : 'Verify & Authorize'} 
                <UserCheck size={18} style={{ marginLeft: '8px' }}/>
              </button>

              {/* Resend OTP & Help Hint */}
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendCooldown > 0 || loading}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: resendCooldown > 0 ? '#64748b' : '#818cf8',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: resendCooldown > 0 ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <RefreshCw size={14} className={loading ? 'spin' : ''}/>
                  {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : 'Resend OTP Code'}
                </button>
              </div>

              <div style={{ background: 'rgba(99, 102, 241, 0.08)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '14px', padding: '12px 14px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                <Info size={18} color="#818cf8" style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                  Didn't receive email? Check your spam/junk folder or click <strong>Resend OTP Code</strong> above.
                </p>
              </div>

              <p 
                style={{ textAlign: 'center', marginTop: '22px', fontSize: '0.82rem', color: '#818cf8', cursor: 'pointer', fontWeight: '600' }}
                onClick={() => setStep(1)}
              >
                ← Back to credentials
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default Auth;
