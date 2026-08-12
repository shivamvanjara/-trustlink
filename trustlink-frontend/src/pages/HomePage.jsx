import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Zap, Lock, Users, Sparkles, Building2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import '../MainDashboard.css';

const HomePage = ({ user }) => {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#030712', color: '#f8fafc' }}>
      
      {/* Navigation Header */}
      <nav style={{
        padding: '20px 5%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #1e293b',
        background: '#070d19',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ background: '#4f46e5', padding: '8px', borderRadius: '10px', color: '#fff', display: 'flex' }}>
            <ShieldCheck size={24} />
          </div>
          <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            TrustLink
          </span>
        </div>

        <div style={{ display: 'flex', gap: '28px', fontSize: '0.9rem', fontWeight: '600', color: '#94a3b8' }}>
          <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Protocol Features</a>
          <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>How It Works</a>
          <a href="#escrow" style={{ color: '#94a3b8', textDecoration: 'none' }}>Escrow Guarantee</a>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          {user ? (
            <button className="btn-premium-primary" onClick={() => navigate('/dashboard')} style={{ gap: '8px' }}>
              Go to Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <button className="action-btn secondary-btn" onClick={() => navigate('/login')}>
                Sign In
              </button>
              <button className="btn-premium-primary" onClick={() => navigate('/login')}>
                Get Started
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{ padding: '80px 5% 60px', textAlign: 'center', maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(79, 70, 229, 0.12)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '6px 16px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '600', color: '#818cf8', marginBottom: '24px' }}>
            <Sparkles size={15} /> Next-Gen Labor Protocol & Smart Escrow Architecture
          </div>

          <h1 style={{ fontSize: '3.4rem', fontWeight: '800', lineHeight: '1.15', margin: '0 0 20px', letterSpacing: '-0.03em', color: '#ffffff' }}>
            Decentralized Security for On-Demand Workforce Operations
          </h1>

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWdith: '720px', margin: '0 auto 36px', lineHeight: '1.6' }}>
            TrustLink replaces traditional friction with automated smart escrow deposits, verified AI matchmaking, and instant financial settlement for candidates and enterprises.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn-premium-primary" style={{ padding: '16px 32px', fontSize: '1.05rem', gap: '10px' }} onClick={() => navigate('/login')}>
              Launch Seeker Protocol <ArrowRight size={18} />
            </button>
            <button className="action-btn secondary-btn" style={{ padding: '16px 32px', fontSize: '1.05rem', gap: '10px' }} onClick={() => navigate('/login')}>
              <Building2 size={18} /> Enterprise Employer Sign In
            </button>
          </div>

        </motion.div>
      </section>

      {/* Corporate Info & Media Placeholder Container */}
      <section id="features" style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: '700', margin: '0 0 10px', color: '#fff' }}>Protocol Architecture</h2>
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>Engineered for transparency, speed, and escrow compliance.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          
          {/* Card 1 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(79, 70, 229, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Zap size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>AI Matchmaking Engine</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Calculates real-time skill compatibility, geographic proximity, and historical performance metrics to deliver high-precision candidate fits.
            </p>
            
            {/* Image Dropzone Placeholder */}
            <div style={{ background: '#070d19', border: '1px dashed #334155', borderRadius: '12px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px', marginTop: '10px' }}>
              <ImageIcon size={28} />
              <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>[ Custom Image / Graphic Container ]</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10b981' }}>
              <Lock size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>Automated Escrow Vault</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Funds are secured in escrow prior to job commencement. Automated Razorpay webhooks settle payments directly upon mutual contract completion.
            </p>
            
            {/* Image Dropzone Placeholder */}
            <div style={{ background: '#070d19', border: '1px dashed #334155', borderRadius: '12px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px', marginTop: '10px' }}>
              <ImageIcon size={28} />
              <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>[ Custom Image / Graphic Container ]</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="card" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ background: 'rgba(245, 158, 11, 0.12)', width: '48px', height: '48px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
              <CheckCircle2 size={24} />
            </div>
            <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#fff' }}>Dynamic Trust Meter</h3>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>
              Dynamic trust scoring (0–100) rewards reliable participants with enhanced protocol visibility and lower escrow margin requirements.
            </p>
            
            {/* Image Dropzone Placeholder */}
            <div style={{ background: '#070d19', border: '1px dashed #334155', borderRadius: '12px', height: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', gap: '8px', marginTop: '10px' }}>
              <ImageIcon size={28} />
              <span style={{ fontSize: '0.78rem', fontWeight: '600' }}>[ Custom Image / Graphic Container ]</span>
            </div>
          </div>

        </div>
      </section>

      {/* Metric Counters Banner */}
      <section style={{ borderTop: '1px solid #1e293b', borderBottom: '1px solid #1e293b', background: '#070d19', padding: '50px 5%' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '30px', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>₹2.5M+</div>
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>Escrow Liquidity Vault</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>99.8%</div>
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>Contract Settlement Rate</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>&lt; 100ms</div>
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>Authentication Speed</div>
          </div>
          <div>
            <div style={{ fontSize: '2.5rem', fontWeight: '800', color: '#fff' }}>100%</div>
            <div style={{ color: '#94a3b8', fontSize: '0.88rem', marginTop: '4px' }}>Verified Labor Contracts</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 5%', textAlign: 'center', color: '#64748b', fontSize: '0.88rem', borderTop: '1px solid #1e293b' }}>
        <p style={{ margin: 0 }}>© 2026 TrustLink Protocol Inc. All rights reserved. Enterprise Security Guarantee Active.</p>
      </footer>

    </div>
  );
};

export default HomePage;
