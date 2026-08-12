import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowRight, CheckCircle2, Zap, Lock, Users, Sparkles, Building2, ChevronRight, Briefcase, MessageSquare, DollarSign, Award, Layers } from 'lucide-react';
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
          <a href="#how-it-works" style={{ color: '#94a3b8', textDecoration: 'none' }}>How It Works</a>
          <a href="#features" style={{ color: '#94a3b8', textDecoration: 'none' }}>Protocol Features</a>
          <a href="#provider-demo" style={{ color: '#94a3b8', textDecoration: 'none' }}>Provider Job Manager</a>
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

          <p style={{ fontSize: '1.15rem', color: '#94a3b8', maxWidth: '750px', margin: '0 auto 36px', lineHeight: '1.6' }}>
            TrustLink replaces traditional labor friction with automated smart escrow deposits, verified AI matchmaking, direct candidate messaging, and instant financial settlement.
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

      {/* STEP-BY-STEP WORKFLOW EXPLANATION */}
      <section id="how-it-works" style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1e293b' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '800', margin: '0 0 12px', color: '#fff' }}>How TrustLink Protocol Works</h2>
          <p style={{ color: '#94a3b8', margin: '0 auto', fontSize: '1rem', maxWidth: '600px' }}>
            A transparent 4-step workflow connecting verified employers with skilled candidates.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
          
          {/* Step 1 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ background: '#4f46e5', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>1</div>
            <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>Provider Posts Job Opening</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Employer sets title, city, monthly salary, and required skills. Escrow margin requirements are auto-calculated.
            </p>
          </div>

          {/* Step 2 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ background: '#06b6d4', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>2</div>
            <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>AI Skill Matchmaking</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Candidates browse positions sorted by AI Match Score %. Employers invite top matches for interviews & 3-day trials.
            </p>
          </div>

          {/* Step 3 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ background: '#10b981', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>3</div>
            <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>Escrow Security Handshake</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Both employer and candidate deposit initial token commitments held in TrustLink's automated escrow vault.
            </p>
          </div>

          {/* Step 4 */}
          <div className="card" style={{ padding: '28px' }}>
            <div style={{ background: '#f59e0b', color: '#fff', width: '36px', height: '36px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', marginBottom: '16px' }}>4</div>
            <h4 style={{ margin: '0 0 8px', color: '#fff', fontSize: '1.15rem' }}>Live Operations & Payout</h4>
            <p style={{ margin: 0, color: '#94a3b8', fontSize: '0.88rem', lineHeight: '1.6' }}>
              Parties communicate via live socket chat. Upon contract completion, payouts transfer automatically via Razorpay.
            </p>
          </div>

        </div>
      </section>

      {/* PROVIDER JOB MANAGEMENT DEMO SHOWCASE */}
      <section id="provider-demo" style={{ padding: '60px 5%', maxWidth: '1200px', margin: '0 auto', borderTop: '1px solid #1e293b' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: '40px', alignItems: 'center' }}>
          
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '0.85rem', fontWeight: '700', textTransform: 'uppercase', marginBottom: '12px' }}>
              <Building2 size={16} /> Enterprise Job Management
            </div>
            <h2 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#fff', margin: '0 0 16px', lineHeight: '1.2' }}>
              Effortless Job Posting & Escrow Automation for Employers
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '1rem', lineHeight: '1.6', marginBottom: '24px' }}>
              Employers can post job openings in seconds with multi-select skill tagging, instant location matching, and automated financial escrow deposit previews.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '12px', color: '#cbd5e1', fontSize: '0.92rem' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" /> <strong>Multi-Skill Tagging:</strong> Target precise worker qualifications.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" /> <strong>Escrow Calculator Preview:</strong> Real-time breakdown of deposit split.
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CheckCircle2 size={18} color="#10b981" /> <strong>1-Click Trial Hiring:</strong> Initiate 3-day candidate trials with automated status tracking.
              </li>
            </ul>
          </div>

          {/* Clean Interactive Mock Card */}
          <div className="card" style={{ padding: '30px', background: '#0f172a', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #1e293b', paddingBottom: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Briefcase size={20} color="#818cf8" />
                <span style={{ fontWeight: '700', color: '#fff', fontSize: '1.05rem' }}>Provider Job Post Interface</span>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(16,185,129,0.15)', color: '#10b981', border: '1px solid #10b981', padding: '3px 10px', borderRadius: '12px', fontWeight: '700' }}>
                LIVE PREVIEW
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '0.88rem' }}>
              <div>
                <label style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Position Title</label>
                <div style={{ background: '#030712', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '10px', color: '#fff', fontWeight: '600', marginTop: '4px' }}>
                  Industrial Plastic Molding Operator
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.78rem' }}>City</label>
                  <div style={{ background: '#030712', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '10px', color: '#fff', marginTop: '4px' }}>
                    Mumbai
                  </div>
                </div>
                <div>
                  <label style={{ color: '#94a3b8', fontSize: '0.78rem' }}>Monthly Salary</label>
                  <div style={{ background: '#030712', border: '1px solid #1e293b', padding: '10px 14px', borderRadius: '10px', color: '#fff', fontWeight: '700', marginTop: '4px' }}>
                    ₹24,000 / month
                  </div>
                </div>
              </div>

              {/* Deposit Box */}
              <div style={{ background: 'rgba(79, 70, 229, 0.08)', border: '1px solid rgba(79, 70, 229, 0.3)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ color: '#818cf8', fontWeight: '700', fontSize: '0.82rem', marginBottom: '4px' }}>
                  🔒 Auto Escrow Split: Employer ₹12,000 | Worker ₹6,000
                </div>
                <div style={{ color: '#94a3b8', fontSize: '0.76rem' }}>
                  100% On-Chain Escrow Security • Instant Razorpay Payout
                </div>
              </div>
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
