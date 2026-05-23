import React from 'react';
import { CheckCircle, Flame, Calendar, Trash2, Activity } from 'lucide-react';

const HabitCard = ({ habit, onComplete, onDelete, onShowHistory }) => {
  const { name, category, streak, priority, color, icon: IconName } = habit;
  
  return (
    <div className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      <button 
        onClick={() => {
          if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            onDelete(habit.id);
          }
        }}
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          background: 'none',
          border: 'none',
          color: 'rgba(0, 0, 0, 1)',
          cursor: 'pointer',
          transition: 'color 0.2s',
          zIndex: 10
        }}
        onMouseEnter={(e) => e.target.style.color = 'rgba(0, 0, 0, 1)'}
        onMouseLeave={(e) => e.target.style.color = 'rgba(0, 0, 0, 1)'}
      >
        <Trash2 size={18} />
      </button>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            borderRadius: '12px', 
            background: `rgba(${color}, 0.2)`, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: `rgb(${color})`
          }}>
            <Activity size={24} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{name}</h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{category}</span>
          </div>
        </div>
        <div className="streak-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Flame size={16} fill="currentColor" />
          <span>{streak || 0}</span>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.4rem', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>
            Daily Goal · {habit.goal_value} {habit.unit || 'times'}
          </span>
          {habit.progress >= 100 ? (
            <span style={{ color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={13} /> Done
            </span>
          ) : (
            <span style={{ color: `rgb(${color})`, fontWeight: 600 }}>{Math.round(habit.progress || 0)}%</span>
          )}
        </div>
        <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.07)', borderRadius: '99px', overflow: 'hidden' }}>
          <div style={{
            width: `${habit.progress || 0}%`,
            height: '100%',
            background: habit.progress >= 100 ? 'var(--success)' : `linear-gradient(90deg, rgb(${color}), rgba(${color},0.7))`,
            borderRadius: '99px',
            transition: 'width 0.5s ease-out'
          }} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem' }}>
        <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => onComplete(habit.id)}>
          <CheckCircle size={18} /> Complete
        </button>
        <button 
          className="btn" 
          style={{ width: '42px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}
          onClick={() => onShowHistory(habit)}
        >
          <Calendar size={18} />
        </button>
      </div>
    </div>
  );
};

export default HabitCard;
