import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Zap, Lock, Award, Info, Scale, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import '../MainDashboard.css';

const HowItWorks = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{minHeight: '100vh'}}>
       <header className="dashboard-header">
        <button onClick={() => navigate(-1)} className="action-btn secondary-btn">
           <ArrowLeft size={16}/> Back
        </button>
        <h2>The Trust Protocol</h2>
      </header>

      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} 
        className="dashboard-content"
      >
        <div className="card" style={{padding: '50px', marginBottom: '40px'}}>
          <h2 style={{fontSize: '2.2rem', marginBottom: '40px'}}>Secure. Gamified. Guaranteed.</h2>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
            <div className="card" style={{padding: '30px', background: 'rgba(99, 102, 241, 0.05)', borderLeft: '5px solid var(--accent-blue)'}}>
              <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                <div style={{background: 'var(--accent-blue)', padding: '12px', borderRadius: '12px'}}><Lock color="#fff" size={24}/></div>
                <div>
                  <h3 style={{margin: '0 0 10px'}}>1. The Escrow Handshake</h3>
                  <p style={{margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6'}}>When a Provider hires a Worker, both parties deposit a "Trust Token" into a secure escrow. This ensures a symmetrical commitment from day one.</p>
                </div>
              </div>
            </div>
            
            <div className="card" style={{padding: '30px', background: 'rgba(16, 185, 129, 0.05)', borderLeft: '5px solid #10b981'}}>
              <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                <div style={{background: '#10b981', padding: '12px', borderRadius: '12px'}}><Zap color="#fff" size={24}/></div>
                <div>
                  <h3 style={{margin: '0 0 10px'}}>2. Active Bond Lifecycle</h3>
                  <p style={{margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6'}}>Monitoring real-time engagement ensures that neither party can unilaterally breach the trust without a protocol-defined settlement.</p>
                </div>
              </div>
            </div>

            <div className="card" style={{padding: '30px', background: 'rgba(139, 92, 246, 0.05)', borderLeft: '5px solid #8b5cf6'}}>
              <div style={{display: 'flex', gap: '20px', alignItems: 'flex-start'}}>
                <div style={{background: '#8b5cf6', padding: '12px', borderRadius: '12px'}}><Award color="#fff" size={24}/></div>
                <div>
                  <h3 style={{margin: '0 0 10px'}}>3. Gamified Payouts</h3>
                  <p style={{margin: 0, color: 'var(--text-secondary)', lineHeight: '1.6'}}>Upon successful completion, the Worker receives a 1.8x ROI on their deposit as a reward for professional reliability.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* POLICIES SECTION */}
        <div className="card" style={{padding: '50px'}}>
          <h2 style={{fontSize: '2rem', marginBottom: '30px', display: 'flex', alignItems: 'center', gap: '15px'}}>
            <Scale color="var(--accent-blue)" size={32}/> Platform Policies
          </h2>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px'}}>
            <div style={{padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              <h4 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}><ShieldCheck size={18} color="#10b981"/> Completion Policy</h4>
              <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                <strong>1.8x Payout:</strong> If a bond matures successfully, the worker receives their original deposit + a bonus equal to 80% of the deposit amount. This is funded by the provider's escrow and system-wide trust pool.
              </p>
            </div>

            <div style={{padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              <h4 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}><Info size={18} color="var(--warning)"/> Mutual Settlement</h4>
              <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                <strong>0.8x Refund:</strong> If both parties agree to part ways before bond maturity, the system initiates a "Mutual Settlement." Both parties receive an 80% refund of their deposits, with 20% retained as a system liquidity fee.
              </p>
            </div>

            <div style={{padding: '25px', background: 'rgba(255,255,255,0.02)', borderRadius: '20px', border: '1px solid var(--border-color)'}}>
              <h4 style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px'}}><Zap size={18} color="#ef4444"/> Breach Policy</h4>
              <p style={{fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>
                <strong>Zero Refund:</strong> In the event of a verified breach or unprofessional termination, the breaching party forfeits their entire deposit. The funds are used to compensate the wronged party.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default HowItWorks;
