import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { SKILLS_DATA } from '../utils/skillsList';
import { API_BASE_URL } from '../apiConfig';

const API_BASE = API_BASE_URL;

const ProviderJobForm = ({ user, onJobPosted }) => {
  const [jobForm, setJobForm] = useState({
    title: '',
    category: '',
    city: '',
    workersNeeded: 1,
    salary: 15000,
    bondDurationMonths: 6
  });
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillSearch, setSkillSearch] = useState('');
  const [showSkillDropdown, setShowSkillDropdown] = useState(false);

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

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/jobs`, {
        ...jobForm,
        salary: Number(jobForm.salary),
        workersNeeded: Number(jobForm.workersNeeded),
        bondDurationMonths: Number(jobForm.bondDurationMonths),
        requiredSkills: selectedSkills,
        providerId: user._id,
        // city is used for matching — location object is optional legacy field
        location: { lat: 0, lng: 0 }
      });
      toast.success('✅ Job Posted Successfully!');
      setJobForm({ title: '', category: '', city: '', workersNeeded: 1, salary: 15000, bondDurationMonths: 6 });
      setSelectedSkills([]);
      if (onJobPosted) onJobPosted();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post job');
    }
  };

  return (
    <div className="card form-card">
      <h3>Post a New Job</h3>
      <form onSubmit={handleCreateJob} className="post-job-form">
        <div className="form-group" style={{ marginTop: '20px' }}>
          <label>Job Title</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., Plastic Molding Operator"
            value={jobForm.title}
            onChange={e => setJobForm({ ...jobForm, title: e.target.value })}
            required
          />
        </div>

        {/* Skills Multi-Select */}
        <div className="form-group">
          <label>Required Skills</label>
          {/* Selected skills tags */}
          {selectedSkills.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '8px' }}>
              {selectedSkills.map(s => (
                <span key={s} style={{
                  background: 'var(--accent-blue)', color: '#fff',
                  padding: '4px 10px', borderRadius: '20px', fontSize: '0.82rem',
                  display: 'flex', alignItems: 'center', gap: '6px'
                }}>
                  {s}
                  <button
                    type="button"
                    onClick={() => removeSkill(s)}
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: 0, fontSize: '1rem', lineHeight: 1 }}
                  >×</button>
                </span>
              ))}
            </div>
          )}
          {/* Search input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search and add skills..."
              value={skillSearch}
              onChange={e => { setSkillSearch(e.target.value); setShowSkillDropdown(true); }}
              onFocus={() => setShowSkillDropdown(true)}
              onBlur={() => setTimeout(() => setShowSkillDropdown(false), 200)}
            />
            {showSkillDropdown && skillSearch && filteredSkills.length > 0 && (
              <div style={{
                position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100,
                background: 'var(--card-bg)', border: '1px solid var(--border-color)',
                borderRadius: '8px', maxHeight: '200px', overflowY: 'auto',
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)'
              }}>
                {filteredSkills.slice(0, 20).map(s => (
                  <div
                    key={s}
                    onMouseDown={() => addSkill(s)}
                    style={{
                      padding: '10px 14px', cursor: 'pointer', fontSize: '0.9rem',
                      borderBottom: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={e => e.target.style.background = 'var(--border-color)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                  >
                    {s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., General Labor"
              value={jobForm.category}
              onChange={e => setJobForm({ ...jobForm, category: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>City</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g., Delhi"
              value={jobForm.city}
              onChange={e => setJobForm({ ...jobForm, city: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Workers Needed</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={jobForm.workersNeeded}
              onChange={e => setJobForm({ ...jobForm, workersNeeded: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Monthly Salary (₹)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={jobForm.salary}
              onChange={e => setJobForm({ ...jobForm, salary: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Bond Duration (Months)</label>
            <input
              type="number"
              className="form-input"
              min="1"
              value={jobForm.bondDurationMonths}
              onChange={e => setJobForm({ ...jobForm, bondDurationMonths: e.target.value })}
              required
            />
          </div>
        </div>
        <button type="submit" className="action-btn gravity-btn post-btn">Post Job</button>
      </form>
    </div>
  );
};

export default ProviderJobForm;
