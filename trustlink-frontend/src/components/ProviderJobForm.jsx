import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Briefcase, MapPin, Users, DollarSign, Calendar, ShieldCheck, Plus, X, Search, CheckCircle2, Sparkles, Building2 } from 'lucide-react';
import { SKILLS_DATA } from '../utils/skillsList';
import { API_BASE_URL } from '../apiConfig';
import '../MainDashboard.css';

const API_BASE = API_BASE_URL;

const CATEGORIES = [
  'General Operations',
  'Manufacturing & Assembly',
  'Electrical & Engineering',
  'Logistics & Warehouse',
  'Plumbing & Maintenance',
  'Construction & Masonry',
  'Quality Control'
];

const ProviderJobForm = ({ user, onJobPosted }) => {
  const [jobForm, setJobForm] = useState({
    title: '',
    category: 'Manufacturing & Assembly',
    city: '',
    workersNeeded: 1,
    salary: 20000,
    bondDurationMonths: 6
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filteredSkills = SKILLS_DATA.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !selectedSkills.includes(s)
  );

  const addSkill = (skill) => {
    setSelectedSkills(prev => [...prev, skill]);
    setSkillSearch('');
    setShowSkillDropdown(false);
  };

  const removeSkill = (skill) => {
    setSelectedSkills(prev => prev.filter(s => s !== skill));
  };

  // Financial Escrow Calculations
  const salaryNum = Number(jobForm.salary) || 0;
  const employerDeposit = Math.round(salaryNum * 0.5);
  const workerDeposit = Math.round(salaryNum * 0.25);

  const handleCreateJob = async (e) => {
    e.preventDefault();
    if (!jobForm.title.trim()) return toast.error("Please enter a Job Title");
    if (!jobForm.city.trim()) return toast.error("Please enter a City");

    setSubmitting(true);
    const tId = toast.loading("Publishing Verified Job Opening...");

    try {
      await axios.post(`${API_BASE}/jobs`, {
        ...jobForm,
        salary: Number(jobForm.salary),
        workersNeeded: Number(jobForm.workersNeeded),
        bondDurationMonths: Number(jobForm.bondDurationMonths),
        requiredSkills: selectedSkills,
        providerId: user._id,
        location: { lat: 0, lng: 0 }
      });

      toast.success('✅ Job Posted Successfully to Protocol Network!', { id: tId });
      setJobForm({ title: '', category: 'Manufacturing & Assembly', city: '', workersNeeded: 1, salary: 20000, bondDurationMonths: 6 });
      setSelectedSkills([]);
      if (onJobPosted) onJobPosted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job', { id: tId });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '850px', margin: '0 auto' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '28px', borderBottom: '1px solid #1e293b', paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <div style={{ background: 'rgba(79, 70, 229, 0.15)', border: '1px solid rgba(79, 70, 229, 0.3)', padding: '10px', borderRadius: '12px', color: '#818cf8' }}>
            <Briefcase size={22} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#fff' }}>Post New Job Opening</h3>
            <p style={{ margin: 0, fontSize: '0.88rem', color: '#94a3b8' }}>Define role specifications, required skills, and automated escrow deposit parameters.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCreateJob} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        
        {/* Row 1: Title & Category */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Job Position Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              className="form-input-premium"
              placeholder="e.g., Plastic Molding Machine Operator"
              value={jobForm.title}
              onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Category
            </label>
            <select
              className="form-input-premium"
              value={jobForm.category}
              onChange={e => setJobForm({ ...jobForm, category: e.target.value })}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat} style={{ background: '#0f172a', color: '#fff' }}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 2: Location & Workers Needed */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              City / Location <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <MapPin size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="form-input-premium"
                placeholder="e.g., Mumbai, Maharashtra"
                value={jobForm.city}
                onChange={e => setJobForm({ ...jobForm, city: e.target.value })}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Workers Needed
            </label>
            <div style={{ position: 'relative' }}>
              <Users size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="number"
                className="form-input-premium"
                min="1"
                max="500"
                value={jobForm.workersNeeded}
                onChange={e => setJobForm({ ...jobForm, workersNeeded: e.target.value })}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>
        </div>

        {/* Row 3: Salary & Bond Duration */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Monthly Base Salary (₹)
            </label>
            <div style={{ position: 'relative' }}>
              <DollarSign size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="number"
                className="form-input-premium"
                min="5000"
                step="500"
                value={jobForm.salary}
                onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
                style={{ paddingLeft: '44px' }}
                required
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
              Contract Duration
            </label>
            <div style={{ position: 'relative' }}>
              <Calendar size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <select
                className="form-input-premium"
                value={jobForm.bondDurationMonths}
                onChange={e => setJobForm({ ...jobForm, bondDurationMonths: e.target.value })}
                style={{ paddingLeft: '44px' }}
              >
                <option value={3} style={{ background: '#0f172a' }}>3 Months Protocol Tenure</option>
                <option value={6} style={{ background: '#0f172a' }}>6 Months Protocol Tenure</option>
                <option value={12} style={{ background: '#0f172a' }}>12 Months Protocol Tenure</option>
              </select>
            </div>
          </div>
        </div>

        {/* Skills Selector */}
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#cbd5e1', marginBottom: '8px' }}>
            Required Skill Tags
          </label>
          
          {selectedSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {selectedSkills.map(s => (
                <span key={s} style={{
                  background: 'rgba(79, 70, 229, 0.15)',
                  border: '1px solid rgba(79, 70, 229, 0.3)',
                  color: '#818cf8',
                  padding: '6px 14px',
                  borderRadius: '16px',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {s}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(s)} />
                </span>
              ))}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="form-input-premium"
              placeholder="Type to search and add skills (e.g. Electrician, Plumbing)..."
              value={skillSearch}
              onChange={e => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
              onFocus={() => setShowSkillDropdown(true)}
              onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
              style={{ paddingLeft: '44px' }}
            />
            {showSkillDropdown && skillSearch && filteredSkills.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: '#0f172a', border: '1px solid #334155',
                borderRadius: '12px', maxHeight: '200px', overflowY: 'auto',
                boxShadow: '0 12px 30px rgba(0,0,0,0.5)', marginTop: '4px'
              }}>
                {filteredSkills.slice(0, 15).map(s => (
                  <div
                    key={s}
                    onMouseDown={() => addSkill(s)}
                    style={{
                      padding: '12px 16px', cursor: 'pointer', fontSize: '0.88rem',
                      borderBottom: '1px solid rgba(255,255,255,0.05)', color: '#fff'
                    }}
                  >
                    + {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Escrow Commitment Live Financial Breakdown Preview Card */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid #1e293b',
          borderRadius: '16px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#818cf8', fontWeight: '700', fontSize: '0.9rem' }}>
            <ShieldCheck size={18} /> Escrow Protocol Deposit Breakdown
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', fontSize: '0.88rem' }}>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Employer Vault Escrow:</span>
              <strong style={{ color: '#fff', fontSize: '1.05rem' }}>₹{employerDeposit}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Worker Token Commitment:</span>
              <strong style={{ color: '#fff', fontSize: '1.05rem' }}>₹{workerDeposit}</strong>
            </div>
            <div>
              <span style={{ color: '#94a3b8', display: 'block', fontSize: '0.78rem' }}>Protocol Settlement Speed:</span>
              <strong style={{ color: '#10b981', fontSize: '1.05rem' }}>Instant / Direct</strong>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-premium-primary"
          style={{ width: '100%', padding: '16px', borderRadius: '14px', fontSize: '1rem', marginTop: '10px' }}
          disabled={submitting}
        >
          {submitting ? 'Publishing Position...' : 'Publish Verified Job Opening'}
        </button>

      </form>

    </div>
  );
};

export default ProviderJobForm;
