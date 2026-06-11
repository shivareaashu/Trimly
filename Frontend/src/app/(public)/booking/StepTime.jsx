'use client';

import { useMemo } from 'react';
import { Clock, Check } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

function formatTimeSlot(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  const hours = date.getUTCHours();
  const mins = date.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${String(mins).padStart(2, '0')} ${ampm}`;
}

function getPeriod(isoString) {
  const hours = new Date(isoString).getUTCHours();
  if (hours < 12) return 'morning';
  if (hours < 17) return 'afternoon';
  return 'evening';
}

export default function StepTime() {
  const { availableSlots, selectedSlot, selectSlot, nextStep, prevStep, holdSelectedSlot, isLoading } = useBookingStore();

  // Group slots by period
  const grouped = useMemo(() => {
    const groups = { morning: [], afternoon: [], evening: [] };
    for (const slot of availableSlots) {
      const period = getPeriod(slot.startTime);
      groups[period].push(slot);
    }
    return groups;
  }, [availableSlots]);

  const handleSelect = (slot) => {
    selectSlot(slot);
  };

  const handleContinue = () => {
    if (selectedSlot) {
      holdSelectedSlot(); // fire-and-forget hold
      nextStep();
    }
  };

  const periodLabels = {
    morning: { label: 'Morning', icon: '🌅' },
    afternoon: { label: 'Afternoon', icon: '☀️' },
    evening: { label: 'Evening', icon: '🌙' },
  };

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <Clock size={12} />
        Pick a Time
      </div>
      <h2 className="bk-title">What time works best?</h2>
      <p className="bk-subtitle">Available time slots for your date</p>

      {isLoading ? (
        <div className="bk-loading"><div className="bk-spinner" /></div>
      ) : availableSlots.length === 0 ? (
        <div className="bk-empty">
          <div className="bk-empty-icon">📅</div>
          <p>No available slots on this date.<br />Try another day.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {Object.entries(grouped).map(([period, slots]) => {
            if (slots.length === 0) return null;
            const { label, icon } = periodLabels[period];
            return (
              <div key={period}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--bk-muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>{icon}</span> {label}
                </div>
                <div className="bk-time-grid">
                  {slots.map((slot, i) => {
                    const isSelected = selectedSlot?.startTime === slot.startTime && selectedSlot?.staffId === slot.staffId;
                    return (
                      <button
                        key={`${slot.staffId}-${slot.startTime}-${i}`}
                        className={`bk-time-slot${isSelected ? ' selected' : ''}`}
                        onClick={() => handleSelect(slot)}
                      >
                        {formatTimeSlot(slot.startTime)}
                        {slot.staffName && (
                          <span className="bk-slot-staff">{slot.staffName}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bk-actions">
        <button className="bk-btn-primary" disabled={!selectedSlot} onClick={handleContinue}>
          Continue
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
