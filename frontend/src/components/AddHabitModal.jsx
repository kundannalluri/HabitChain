import React, { useState } from 'react';
import { X, Plus, Target, Info, Tag, Layers, RefreshCw, Palette, Type } from 'lucide-react';
import { habitApi } from '../api';

const AddHabitModal = ({ isOpen, onClose, onHabitAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'Healthy',
    priority: 'Medium',
    frequency: 'Daily',
    goal_value: 1,
    unit: 'times',
    color: '99, 102, 241', // Indigo
    icon: 'Activity'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await habitApi.createHabit(formData);
      onHabitAdded();
      onClose();
      setFormData({
        name: '',
        description: '',
        category: 'Healthy',
        priority: 'Medium',
        frequency: 'Daily',
        goal_value: 1,
        unit: 'times',
        color: '99, 102, 241',
        icon: 'Activity'
      });
    } catch (error) {
      console.error("Error creating habit:", error);
    } finally {
      setLoading(false);
    }
  };

  const colors = [
    { name: 'Indigo', value: '99, 102, 241' },
    { name: 'Emerald', value: '16, 185, 129' },
    { name: 'Amber', value: '245, 158, 11' },
    { name: 'Rose', value: '244, 63, 94' },
    { name: 'Sky', value: '14, 165, 233' },
    { name: 'Violet', value: '139, 92, 246' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(7, 6, 6, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '1rem'
    }}>
      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        padding: '2.5rem',
        borderRadius: '2rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.5rem',
            right: '1.5rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer'
          }}
        >
          <X size={24} />
        </button>

        <h2 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '2rem', textAlign: 'center' }}>
          Create New Habit ✨
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Type size={16} /> Habit Name
            </label>
            <input
              type="text"
              required
              className="glass-card"
              style={{ padding: '1rem', width: '100%', border: '1px solid rgba(0,0,0,0.1)', color: 'black', backgroundColor: 'rgba(0,0,0,0.05)' }}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Morning Meditation"
            />
          </div>

          <div style={{ display: 'grid', gap: '0.5rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={16} /> Description
            </label>
            <textarea
              className="glass-card"
              style={{ padding: '1rem', width: '100%', border: '1px solid rgba(0,0,0,0.1)', color: 'black', backgroundColor: 'rgba(0,0,0,0.05)', minHeight: '80px', resize: 'vertical' }}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What's this habit about?"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Tag size={16} /> Category
              </label>
              <select
                className="input-field"
                style={{ padding: '0.875rem 1rem', width: '100%', background: 'var(--bg-elevated)', color: 'black', cursor: 'pointer' }}
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="Healthy" style={{ background: 'var(--bg-surface)' }}>Healthy</option>
                <option value="Productivity" style={{ background: 'var(--bg-surface)' }}>Productivity</option>
                <option value="Wellness" style={{ background: 'var(--bg-surface)' }}>Wellness</option>
                <option value="Growth" style={{ background: 'var(--bg-surface)' }}>Growth</option>
              </select>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Layers size={16} /> Priority
              </label>
              <select
                className="input-field"
                style={{ padding: '0.875rem 1rem', width: '100%', background: 'var(--bg-elevated)', color: 'black', cursor: 'pointer' }}
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="Low" style={{ background: 'var(--bg-surface)' }}>Low</option>
                <option value="Medium" style={{ background: 'var(--bg-surface)' }}>Medium</option>
                <option value="High" style={{ background: 'var(--bg-surface)' }}>High</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <RefreshCw size={16} /> Frequency
              </label>
              <select
                className="input-field"
                style={{ padding: '0.875rem 1rem', width: '100%', background: 'var(--bg-elevated)', color: 'black', cursor: 'pointer' }}
                value={formData.frequency}
                onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
              >
                <option value="Daily" style={{ background: 'var(--bg-surface)' }}>Daily</option>
                <option value="Weekly" style={{ background: 'var(--bg-surface)' }}>Weekly</option>
                <option value="Monthly" style={{ background: 'var(--bg-surface)' }}>Monthly</option>
              </select>
            </div>
            <div style={{ display: 'grid', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Target size={16} /> Daily Goal
              </label>
              {/* Combined input group */}
              <div style={{
                display: 'flex',
                borderRadius: 'var(--radius-md)',
                border: '1px solid rgba(255,255,255,0.12)',
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.04)'
              }}>
                {/* Number stepper */}
                <div style={{ display: 'flex', alignItems: 'center', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
                  <button type="button"
                    onClick={() => setFormData({ ...formData, goal_value: Math.max(1, formData.goal_value - 1) })}
                    style={{ padding: '0 0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                  >−</button>
                  <input
                    type="number" required min="1"
                    value={formData.goal_value}
                    onChange={(e) => setFormData({ ...formData, goal_value: Math.max(1, parseInt(e.target.value) || 1) })}
                    style={{
                      width: '48px', padding: '0.875rem 0', textAlign: 'center',
                      background: 'none', border: 'none', color: 'black',
                      fontSize: '1rem', fontWeight: 600,
                      outline: 'none', appearance: 'textfield', MozAppearance: 'textfield'
                    }}
                  />
                  <button type="button"
                    onClick={() => setFormData({ ...formData, goal_value: formData.goal_value + 1 })}
                    style={{ padding: '0 0.75rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', lineHeight: 1 }}
                  >+</button>
                </div>
                {/* Unit selector */}
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  style={{
                    flex: 1, padding: '0.875rem 1rem',
                    background: 'var(--bg-elevated)', border: 'none', color: 'var(--text-sub)',
                    fontSize: '0.9rem', outline: 'none', cursor: 'pointer'
                  }}
                >
                  <option value="times" style={{ background: 'var(--bg-surface)' }}>times</option>
                  <option value="minutes" style={{ background: 'var(--bg-surface)' }}>minutes</option>
                  <option value="hours" style={{ background: 'var(--bg-surface)' }}>hours</option>
                  <option value="cups" style={{ background: 'var(--bg-surface)' }}>cups</option>
                  <option value="pages" style={{ background: 'var(--bg-surface)' }}>pages</option>
                  <option value="km" style={{ background: 'var(--bg-surface)' }}>km</option>
                  <option value="steps" style={{ background: 'var(--bg-surface)' }}>steps</option>
                  <option value="reps" style={{ background: 'var(--bg-surface)' }}>reps</option>
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gap: '1rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Palette size={16} /> Theme Color
            </label>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {colors.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c.value })}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: `rgb(${c.value})`,
                    border: formData.color === c.value ? '3px solid white' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    transform: formData.color === c.value ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{
              marginTop: '1rem',
              padding: '1.25rem',
              fontSize: '1.125rem',
              justifyContent: 'center',
              borderRadius: '1.25rem',
              boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? 'Adding...' : <><Plus size={20} /> Add Habit</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddHabitModal;
