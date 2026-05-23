import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CalendarView = ({ history = [], title = "Monthly History" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const now = new Date();
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay(); // 0 (Sun) to 6 (Sat)
  
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: startDay }, (_, i) => i);
  
  const completionDays = history
    .map(dateStr => new Date(dateStr))
    .filter(d => d.getMonth() === month && d.getFullYear() === year)
    .map(d => d.getDate());

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  return (
    <div className="glass-card" style={{ padding: '2rem', borderRadius: '1.5rem', background: '#fff', boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <h3 style={{ fontWeight: '700', fontSize: '1.125rem', margin: 0 }}>{title}</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: '1rem' }}>
          <button onClick={prevMonth} style={{ background: 'white', border: '1px solid var(--border-default)', color: 'var(--text-main)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '0.75rem', boxShadow: 'var(--shadow-sm)', transition: 'all 0.2s' }} className="btn">
            <ChevronLeft size={18} />
          </button>
          <span style={{ color: 'var(--text-main)', fontSize: '0.95rem', fontWeight: 700, minWidth: '120px', textAlign: 'center' }}>
            {monthNames[month]} {year}
          </span>
          <button onClick={nextMonth} disabled={month === now.getMonth() && year === now.getFullYear()} style={{ background: month === now.getMonth() && year === now.getFullYear() ? 'transparent' : 'white', border: month === now.getMonth() && year === now.getFullYear() ? 'none' : '1px solid var(--border-default)', color: month === now.getMonth() && year === now.getFullYear() ? 'var(--text-muted)' : 'var(--text-main)', cursor: month === now.getMonth() && year === now.getFullYear() ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', padding: '0.4rem', borderRadius: '0.75rem', boxShadow: month === now.getMonth() && year === now.getFullYear() ? 'none' : 'var(--shadow-sm)', transition: 'all 0.2s' }} className="btn">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => (
          <div key={`${day}-${index}`} style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-sub)', paddingBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {day}
          </div>
        ))}
        {blanks.map(blank => (
          <div key={`blank-${blank}`} style={{ aspectRatio: '1' }}></div>
        ))}
        {days.map(day => {
          const isCompleted = completionDays.includes(day);
          const isToday = day === now.getDate() && month === now.getMonth() && year === now.getFullYear();
          return (
            <div key={day} style={{
              aspectRatio: '1',
              borderRadius: '12px',
              background: isCompleted ? 'linear-gradient(135deg, var(--success) 0%, #059669 100%)' : (isToday ? 'linear-gradient(135deg, var(--primary) 0%, #4338ca 100%)' : 'var(--bg-elevated)'),
              border: isCompleted || isToday ? 'none' : '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              color: isCompleted || isToday ? 'white' : 'var(--text-main)',
              cursor: 'pointer',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              fontWeight: isCompleted || isToday ? '700' : '500',
              boxShadow: isCompleted ? '0 4px 12px rgba(16, 185, 129, 0.3)' : (isToday ? '0 4px 12px rgba(99, 102, 241, 0.3)' : 'none')
            }}
            onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
            onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
            title={isCompleted ? 'Completed' : (isToday ? 'Today' : '')}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
