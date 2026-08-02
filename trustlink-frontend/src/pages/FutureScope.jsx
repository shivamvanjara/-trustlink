import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Cpu, ShieldCheck, TrendingUp, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import '../MainDashboard.css';

const FutureScope = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{minHeight: '100vh'}}>
      <header className="dashboard-header">
        <button onClick={() => navigate(-1)} className="action-btn secondary-btn">
           <ArrowLeft size={16}/> Back
        </button>
        <h2>The Roadmap</h2>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} 
        className="dashboard-content"
      >
        <div className="card" style={{padding: '50px'}}>
          <h2 style={{fontSize: '2.5rem', marginBottom: '20px', letterSpacing: '-0.05em'}}>Vision 2030: TrustID</h2>
          <p style={{color: 'var(--text-secondary)', fontSize: '1.1rem', marginBottom: '50px'}}>We are building a world where professional integrity is the only currency that matters.</p>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '30px'}}>
            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <Cpu size={32} color="var(--accent-blue)" style={{marginBottom: '15px'}}/>
              <h4>Smart Labor Matching</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>Using intelligent algorithms to match workers with the right employers instantly based on skills and location.</p>
            </div>
            
            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <Zap size={32} color="#10b981" style={{marginBottom: '15px'}}/>
              <h4>Instant Payments</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>Enabling direct, zero-delay bank transfers the moment a bond is completed, ensuring workers get paid without waiting.</p>
            </div>

            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <ShieldCheck size={32} color="#8b5cf6" style={{marginBottom: '15px'}}/>
              <h4>Verified Work IDs</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>A digital identity that proves a worker's professional history and trust score anywhere in the world.</p>
            </div>

            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <TrendingUp size={32} color="#f59e0b" style={{marginBottom: '15px'}}/>
              <h4>Skill Certifications</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6'}}>Helping workers earn officially recognized badges and certificates as they complete more jobs successfully.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default FutureScope;
