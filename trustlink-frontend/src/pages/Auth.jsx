import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Sparkles, Building, User } from 'lucide-react';
import { motion } from 'framer-motion';
import '../MainDashboard.css';
import { API_BASE_URL } from '../apiConfig';

const Auth = ({ user, setUser, role, setRole }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        role: role
      });
      setUser(res.data.user);
      toast.success("Welcome back to TrustLink!");
      navigate('/dashboard');
    } catch (err) {
      console.error("Login Error:", err);
      toast.error(err.response?.data?.message || "Invalid Email or Password");
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

        <form onSubmit={isSignup ? handleSignup : handleLogin}>
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
            {loading ? 'Authenticating...' : (isSignup ? 'Create Secure Account' : 'Sign In')} 
            <ArrowRight size={18} style={{ marginLeft: '8px' }}/>
          </button>

          <p 
            style={{ textAlign: 'center', marginTop: '25px', fontSize: '0.88rem', color: '#94a3b8', cursor: 'pointer', transition: '0.2s' }}
            onClick={() => setIsSignup(!isSignup)}
          >
            {isSignup ? "Already registered? Sign In" : "New to TrustLink? Create an Account"}
          </p>
        </form>
      </motion.div>
    </div>
  );
};

export default Auth;

