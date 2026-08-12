import React from 'react';
import { X, ShieldCheck, Printer, FileText, CheckCircle2, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const ContractModal = ({ isOpen, onClose, app, bond }) => {
  if (!isOpen || !app) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(2, 6, 23, 0.88)',
      backdropFilter: 'blur(16px)',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        style={{
          width: '100%',
          maxWidth: '650px',
          maxHeight: '85vh',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          borderRadius: '24px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)'
        }}
      >
        {/* Modal Header */}
        <div style={{
          padding: '22px 28px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FileText size={24} color="#818cf8" />
            <div>
              <h3 style={{ margin: 0, color: '#fff', fontFamily: 'Outfit', fontSize: '1.2rem' }}>Smart Escrow Protocol Agreement</h3>
              <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Contract ID: {app._id}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handlePrint} className="action-btn secondary-btn" style={{ padding: '8px 14px', fontSize: '0.82rem', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Printer size={15} /> Print PDF
            </button>
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Printable Contract Document Body */}
        <div id="printable-contract" style={{ flex: 1, padding: '30px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ textAlign: 'center', borderBottom: '1px border-dashed rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
            <div style={{ display: 'inline-flex', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid #10b981', padding: '8px 18px', borderRadius: '20px', color: '#10b981', fontSize: '0.85rem', fontWeight: '800', marginBottom: '10px', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} /> VERIFIED SMART BOND CONTRACT
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', margin: '0 0 6px', color: '#fff' }}>
              {app.jobId?.title || 'Labor Agreement'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: 0 }}>
              Location: <strong>{app.jobId?.city || 'India'}</strong> • Monthly Salary: <strong>₹{app.jobId?.salary}</strong>
            </p>
          </div>

          {/* Parties Breakdown */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
              <h5 style={{ margin: '0 0 8px', color: '#818cf8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Provider (Employer)</h5>
              <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{app.providerId?.profile?.companyName || app.providerId?.email}</p>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '16px', padding: '16px' }}>
              <h5 style={{ margin: '0 0 8px', color: '#38bdf8', fontSize: '0.85rem', textTransform: 'uppercase' }}>Seeker (Worker)</h5>
              <p style={{ margin: 0, fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{app.seekerId?.profile?.fullName || app.seekerId?.email}</p>
            </div>
          </div>

          {/* Escrow Pool Deposit Breakdown */}
          <div style={{ background: 'rgba(99, 102, 241, 0.06)', border: '1px solid rgba(99, 102, 241, 0.2)', borderRadius: '18px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 14px', fontFamily: 'Outfit', color: '#fff', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Lock size={16} color="#818cf8" /> Escrow Financial Commitment
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '0.88rem', color: '#cbd5e1' }}>
              <div>Employer Escrow Pool: <strong style={{ color: '#fff' }}>₹{Math.round((app.jobId?.salary || 0) * 0.5)}</strong></div>
              <div>Worker Security Token: <strong style={{ color: '#fff' }}>₹{bond ? bond.seekerInitialToken : Math.round((app.jobId?.salary || 0) * 0.25)}</strong></div>
            </div>
          </div>

          {/* Terms & Conditions */}
          <div>
            <h5 style={{ color: '#fff', margin: '0 0 8px', fontSize: '0.95rem' }}>Protocol Terms:</h5>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#94a3b8', fontSize: '0.82rem', lineHeight: '1.6' }}>
              <li>Funds are held securely in TrustLink's automated smart escrow vault during contract tenure.</li>
              <li>Upon successful completion, worker receives 100% deposit + 1.8x protocol reward payout.</li>
              <li>Unilateral breach results in automatic forfeiture to counterparty.</li>
            </ul>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default ContractModal;
