'use client';

import { useEffect } from 'react';
import { MapPin, Check } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

export default function StepBranch() {
  const {
    branches,
    selectedBranchId,
    fetchBranches,
    selectBranch,
    nextStep,
    prevStep,
    isLoading,
    trackEvent,
  } = useBookingStore();

  useEffect(() => {
    if (branches.length === 0) fetchBranches();
  }, []);

  // Auto-skip if only 1 branch
  useEffect(() => {
    if (branches.length === 1 && !selectedBranchId) {
      selectBranch(branches[0].id);
      nextStep();
    }
  }, [branches]);

  const handleSelect = (branchId) => {
    selectBranch(branchId);
    trackEvent('branch_selected', { branchId });
  };

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <MapPin size={12} />
        Choose Location
      </div>
      <h2 className="bk-title">Which branch?</h2>
      <p className="bk-subtitle">Select the location nearest to you</p>

      {isLoading ? (
        <div className="bk-loading"><div className="bk-spinner" /></div>
      ) : branches.length === 0 ? (
        <div className="bk-empty">
          <div className="bk-empty-icon">📍</div>
          <p>No branches available</p>
        </div>
      ) : (
        <div className="bk-card-grid">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className={`bk-card bk-staff-card${selectedBranchId === branch.id ? ' selected' : ''}`}
              onClick={() => handleSelect(branch.id)}
            >
              <div className="bk-card-check"><Check size={12} /></div>
              <div className="bk-staff-avatar" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))' }}>
                <MapPin size={18} />
              </div>
              <div className="bk-staff-info">
                <div className="bk-staff-name">{branch.name}</div>
                {branch.address && <div className="bk-staff-bio">{branch.address}</div>}
                {branch.phone && (
                  <div className="bk-staff-bio" style={{ marginTop: 2 }}>📞 {branch.phone}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bk-actions">
        <button className="bk-btn-primary" disabled={!selectedBranchId} onClick={nextStep}>
          Continue
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
