'use client';

import { useEffect } from 'react';
import { User, Star, Check } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

function getInitials(name) {
  if (!name) return '?';
  return name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
}

export default function StepStylist() {
  const { staffList, selectedStaff, fetchStaff, selectStaff, nextStep, prevStep, isLoading } = useBookingStore();

  useEffect(() => {
    if (staffList.length === 0) fetchStaff();
  }, []);

  const handleSelect = (staff) => {
    selectStaff(staff);
  };

  const handleAny = () => {
    selectStaff(null);
  };

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <User size={12} />
        Choose Stylist
      </div>
      <h2 className="bk-title">Who do you prefer?</h2>
      <p className="bk-subtitle">Choose your preferred stylist or let us match you</p>

      {isLoading ? (
        <div className="bk-loading"><div className="bk-spinner" /></div>
      ) : (
        <div className="bk-card-grid">
          {/* "Any Available" option */}
          <div
            className={`bk-card bk-staff-card${selectedStaff === null ? ' selected' : ''}`}
            onClick={handleAny}
          >
            <div className="bk-card-check"><Check size={12} /></div>
            <div className="bk-staff-avatar" style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(212,175,55,0.05))' }}>
              <Star size={18} />
            </div>
            <div className="bk-staff-info">
              <div className="bk-staff-name">Any Available</div>
              <div className="bk-staff-bio">We'll assign the best available stylist</div>
            </div>
          </div>

          {staffList.map((staff) => (
            <div
              key={staff.id}
              className={`bk-card bk-staff-card${selectedStaff?.id === staff.id ? ' selected' : ''}`}
              onClick={() => handleSelect(staff)}
            >
              <div className="bk-card-check"><Check size={12} /></div>
              <div className="bk-staff-avatar">
                {getInitials(staff.name)}
              </div>
              <div className="bk-staff-info">
                <div className="bk-staff-name">{staff.name}</div>
                {staff.bio && <div className="bk-staff-bio">{staff.bio}</div>}
              </div>
            </div>
          ))}

          {staffList.length === 0 && !isLoading && (
            <div className="bk-empty">
              <div className="bk-empty-icon">👤</div>
              <p>No stylists available for this service</p>
            </div>
          )}
        </div>
      )}

      <div className="bk-actions">
        <button className="bk-btn-primary" onClick={nextStep}>
          Continue
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
