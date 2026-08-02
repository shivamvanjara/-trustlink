import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, Users, Globe, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import '../MainDashboard.css';

const AboutUs = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container" style={{minHeight: '100vh'}}>
      <header className="dashboard-header">
        <button onClick={() => navigate(-1)} className="action-btn secondary-btn">
           <ArrowLeft size={16}/> Back
        </button>
        <h2>The TrustLink Mission</h2>
      </header>

      <motion.div 
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} 
        className="dashboard-content"
      >
        <div className="card" style={{padding: '50px'}}>
          <h2 style={{fontSize: '2.5rem', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '15px'}}>
            <ShieldCheck size={40} color="var(--accent-blue)"/> 
            Empowering the Unorganized
          </h2>
          
          <p style={{fontSize: '1.2rem', lineHeight: '1.8', color: 'var(--text-secondary)', marginBottom: '30px'}}>
            TrustLink was founded to solve a fundamental paradox in the global labor market: the "Distrust Gap." In unorganized sectors, workers fear wage theft, and employers fear unreliable commitments. We bridge this gap using high-gravity financial math and native escrow protocols.
          </p>

          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '40px'}}>
            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <Landmark size={32} color="var(--accent-blue)" style={{marginBottom: '15px'}}/>
              <h4>Financial Inclusion</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Bringing formal escrow security to daily-wage earners through simplified mobile gateways.</p>
            </div>
            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <Globe size={32} color="#10b981" style={{marginBottom: '15px'}}/>
              <h4>Market Mobility</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Verified trust scores allow high-performing workers to move across cities with guaranteed credibility.</p>
            </div>
            <div className="card" style={{padding: '30px', background: 'rgba(255,255,255,0.02)'}}>
              <Users size={32} color="#8b5cf6" style={{marginBottom: '15px'}}/>
              <h4>The Human Factor</h4>
              <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Beyond code, we focus on the dignity of labor, ensuring every hour worked is an hour paid.</p>
            </div>
          </div>

          <div style={{marginTop: '60px', padding: '40px', background: 'rgba(255,255,255,0.01)', borderRadius: '24px', border: '1px solid var(--border-color)', textAlign: 'center'}}>
            <h4 style={{marginBottom: '20px', color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem'}}>Engineering & Design</h4>
            <div style={{display: 'flex', justifyContent: 'center', gap: '40px', flexWrap: 'wrap'}}>
              <div>
                <div style={{fontSize: '1.2rem', fontWeight: '800'}}>DHAVAL SOLANKI</div>
                <div style={{fontSize: '0.8rem', opacity: 0.6}}>25CP 605</div>
              </div>
              <div>
                <div style={{fontSize: '1.2rem', fontWeight: '800'}}>SHIVAM VANJARA</div>
                <div style={{fontSize: '0.8rem', opacity: 0.6}}>25CP 608</div>
              </div>
            </div>
            
            <div style={{marginTop: '40px'}}>
              <h4 style={{marginBottom: '10px', color: 'var(--accent-blue)', letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem'}}>Guided By</h4>
              <div style={{fontSize: '1.3rem', fontWeight: '800'}}>MR. PARIMAL SOLANKI</div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutUs;
