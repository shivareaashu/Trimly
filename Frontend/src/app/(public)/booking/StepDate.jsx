'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react';
import { useBookingStore } from './useBookingStore';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function isSameDay(a, b) {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export default function StepDate() {
  const { selectedDate, selectDate, nextStep, prevStep, fetchSlots } = useBookingStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDayOfMonth(viewYear, viewMonth);

  // Previous month trailing days
  const prevMonthDays = getDaysInMonth(viewYear, viewMonth - 1);
  const trailingDays = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    trailingDays.push({ day: prevMonthDays - i, type: 'other-month' });
  }

  // Current month days
  const currentDays = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(viewYear, viewMonth, d);
    date.setHours(0, 0, 0, 0);
    const isPast = date < today;
    const isToday = isSameDay(date, today);
    const isSelected = isSameDay(date, selectedDate);
    currentDays.push({ day: d, date, isPast, isToday, isSelected });
  }

  // Next month leading days
  const totalCells = trailingDays.length + currentDays.length;
  const remainingCells = totalCells % 7 === 0 ? 0 : 7 - (totalCells % 7);
  const leadingDays = [];
  for (let i = 1; i <= remainingCells; i++) {
    leadingDays.push({ day: i, type: 'other-month' });
  }

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear(viewYear - 1);
      setViewMonth(11);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear(viewYear + 1);
      setViewMonth(0);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (dayObj) => {
    if (dayObj.isPast) return;
    selectDate(dayObj.date);
  };

  const handleContinue = () => {
    if (selectedDate) {
      fetchSlots();
      nextStep();
    }
  };

  // Disable prev if viewing current month
  const canGoPrev = viewYear > today.getFullYear() || (viewYear === today.getFullYear() && viewMonth > today.getMonth());

  return (
    <div className="bk-step-enter">
      <div className="bk-label">
        <CalendarDays size={12} />
        Pick a Date
      </div>
      <h2 className="bk-title">When would you like to visit?</h2>
      <p className="bk-subtitle">Choose a date for your appointment</p>

      <div className="bk-calendar">
        <div className="bk-calendar-header">
          <span className="bk-calendar-title">{MONTHS[viewMonth]} {viewYear}</span>
          <div className="bk-calendar-nav">
            <button onClick={handlePrevMonth} disabled={!canGoPrev} style={!canGoPrev ? { opacity: 0.3 } : {}}>
              <ChevronLeft size={16} />
            </button>
            <button onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="bk-calendar-weekdays">
          {WEEKDAYS.map((d) => <span key={d}>{d}</span>)}
        </div>

        <div className="bk-calendar-days">
          {trailingDays.map((d, i) => (
            <button key={`t-${i}`} className="bk-day other-month" disabled>{d.day}</button>
          ))}
          {currentDays.map((d) => (
            <button
              key={d.day}
              className={`bk-day${d.isPast ? ' disabled' : ''}${d.isToday ? ' today' : ''}${d.isSelected ? ' selected' : ''}`}
              onClick={() => handleSelectDay(d)}
              disabled={d.isPast}
            >
              {d.day}
            </button>
          ))}
          {leadingDays.map((d, i) => (
            <button key={`l-${i}`} className="bk-day other-month" disabled>{d.day}</button>
          ))}
        </div>
      </div>

      <div className="bk-actions">
        <button className="bk-btn-primary" disabled={!selectedDate} onClick={handleContinue}>
          Continue
        </button>
        <button className="bk-btn-secondary" onClick={prevStep}>
          Back
        </button>
      </div>
    </div>
  );
}
