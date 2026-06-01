import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import HabitCard from '../components/HabitCard';
import CalendarView from '../components/CalendarView';
import MonthlySummary from '../components/MonthlySummary';
import AddHabitModal from '../components/AddHabitModal';
import { Plus, TrendingUp, Award, Zap, Flame, Target, CheckCircle2 } from 'lucide-react';
import { habitApi, authApi } from '../api';

/* ─── helpers ─── */
const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
};

// SVG ring component — shows today's completion progress
const ProgressRing = ({ pct = 0, size = 80, stroke = 7, color = 'var(--primary)' }) => {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.7s ease' }}
      />
    </svg>
  );
};

const StatPill = ({ icon, label, value, color }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '0.75rem',
    padding: '1rem 1.25rem',
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 'var(--radius-md)'
  }}>
    <div style={{
      width: 36, height: 36, borderRadius: '8px',
      background: 'rgba(255,255,255,0.04)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color
    }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.1rem' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{value}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [habits, setHabits] = useState([]);
  const [user, setUser]   = useState(null);
  const [stats, setStats] = useState({ points: 0, level: 'Level 1', successRate: 0, streak: 0, totalHabits: 0, missedDays: 0, completedToday: 0 });
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedHabitHistory, setSelectedHabitHistory] = useState(null);
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortOption, setSortOption] = useState('Default');

  const fetchDashboardData = useCallback(async () => {
    try {
      const [habitsRes, userRes] = await Promise.all([
        habitApi.getHabits(),
        authApi.getMe()
      ]);

      setUser(userRes.data);

      const rawHabits = habitsRes.data;
      const today = new Date().toLocaleDateString('en-CA');
      
      const processedHabits = rawHabits.map(habit => {
        const completionDates = new Set(habit.completions.map(c => c.date));
        
        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0,0,0,0);
        
        // Use local date string for streak calculation
        if (!completionDates.has(checkDate.toLocaleDateString('en-CA'))) {
          checkDate.setDate(checkDate.getDate() - 1);
        }
        
        while (completionDates.has(checkDate.toLocaleDateString('en-CA'))) {
          streak++;
          checkDate.setDate(checkDate.getDate() - 1);
        }

        const todayCompletion = habit.completions.find(c => c.date === today);
        const progress = todayCompletion ? (todayCompletion.progress_value / habit.goal_value) * 100 : 0;
        return { ...habit, streak, progress: Math.min(progress, 100) };
      });

      setHabits(processedHabits);

      const allCompletions = processedHabits.flatMap(h => h.completions);
      const todayDate = new Date();
      const currentMonth = todayDate.getMonth();
      const currentYear = todayDate.getFullYear();
      const daysPassed = todayDate.getDate();
      
      // Filter completions for this month
      const monthCompletionsCount = allCompletions.filter(c => {
        const d = new Date(c.date);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      }).length;
      
      // Consistency = (Actual Completions) / (Expected Completions)
      // Expected = number of habits * days passed so far this month
      // (If a completion can be done multiple times per day, this still works as a productivity score)
      const expectedCompletions = processedHabits.length * daysPassed;
      const successRate = expectedCompletions > 0 
        ? Math.round((monthCompletionsCount / expectedCompletions) * 100) 
        : 0;

      const completedToday = processedHabits.filter(h => h.progress >= 100).length;

      setStats({
        points: userRes.data.points,
        level: `Level ${userRes.data.level}`,
        successRate: Math.min(100, successRate),
        streak: Math.max(...processedHabits.map(h => h.streak), 0),
        totalHabits: processedHabits.length,
        missedDays: Math.max(0, daysPassed - Array.from(new Set(allCompletions.filter(c => {
          const d = new Date(c.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        }).map(c => c.date))).length),
        completedToday
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      if (error.response && error.response.status === 401) navigate('/login');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const handleComplete = async (habitId) => {
    // Optimistic Update
    const today = new Date().toLocaleDateString('en-CA');
    
    // Find the habit to update
    const habitIndex = habits.findIndex(h => h.id === habitId);
    if (habitIndex !== -1) {
      const updatedHabits = [...habits];
      const targetHabit = { ...updatedHabits[habitIndex] };
      
      // Calculate new progress (increment by 1 as now handled by backend)
      const currentProgressValue = targetHabit.completions.find(c => c.date === today)?.progress_value || 0;
      const newProgressValue = currentProgressValue + 1;
      
      // Update completion in local list
      const completionIndex = targetHabit.completions.findIndex(c => c.date === today);
      if (completionIndex !== -1) {
        targetHabit.completions[completionIndex] = { ...targetHabit.completions[completionIndex], progress_value: newProgressValue };
      } else {
        targetHabit.completions.push({ date: today, progress_value: newProgressValue, habit_id: habitId });
      }
      
      // Re-calculate progress percentage
      targetHabit.progress = Math.min((newProgressValue / targetHabit.goal_value) * 100, 100);
      updatedHabits[habitIndex] = targetHabit;
      
      // Update local state immediately
      setHabits(updatedHabits);
      
      // Also update points/level optimistically (+10 XP)
      setStats(prev => ({ 
        ...prev, 
        points: prev.points + 10,
        completedToday: updatedHabits.filter(h => h.progress >= 100).length 
      }));
    }

    try {
      await habitApi.completeHabit(habitId, today);
      // Fetch fresh data to ensure we are in sync with server (badges, levels etc)
      fetchDashboardData();
    } catch (error) {
      console.error("Error completing habit:", error);
      fetchDashboardData(); // Rollback/Sync on error
    }
  };

  const handleDelete = async (habitId) => {
    try {
      await habitApi.deleteHabit(habitId);
      if (selectedHabitHistory?.id === habitId) setSelectedHabitHistory(null);
      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
      <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚡</div>
      Loading your dashboard...
    </div>
  );

  // XP level math
  const currentLevel = parseInt(stats.level.replace('Level ', '')) || 1;
  const xpForLevel   = (lvl) => Math.pow(lvl - 1, 2) * 100;
  const xpCurrentLvl = xpForLevel(currentLevel);
  const xpNextLvl    = xpForLevel(currentLevel + 1);
  const xpInto       = stats.points - xpCurrentLvl;
  const xpNeeded     = xpNextLvl - xpCurrentLvl;
  const xpPct        = Math.min(100, Math.round((xpInto / xpNeeded) * 100));
  const xpRemaining  = xpNextLvl - stats.points;

  // Today's completion ring
  const todayPct = stats.totalHabits > 0 ? Math.round((stats.completedToday / stats.totalHabits) * 100) : 0;

  // Date display
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div style={{ padding: '1.5rem 0' }}>

      {/* ── Header ── */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>{dateStr}</p>
          <h1 style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
            fontWeight: 800,
            letterSpacing: '-0.02em',
            marginBottom: '0.15rem'
          }}>
            {getGreeting()}{user ? <span className="text-gradient">, {user.username}</span> : ''} 👋
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {stats.totalHabits === 0
              ? 'Add your first habit to get started.'
              : stats.completedToday === stats.totalHabits && stats.totalHabits > 0
                ? '🎉 All habits done for today — incredible!'
                : `${stats.completedToday} of ${stats.totalHabits} habits done today`}
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)} style={{ borderRadius: '99px', gap: '0.4rem' }}>
          <Plus size={16} /> Add Habit
        </button>
      </header>

      <AddHabitModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onHabitAdded={fetchDashboardData} />

      {/* ── Top stats row: Today ring + Level XP + mini pills ── */}
      <section style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.25rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>

        {/* Today's completion ring */}
        <div className="glass-card" style={{ padding: '1.5rem 2rem', display: 'flex', alignItems: 'center', gap: '1.5rem', minWidth: 220 }}>
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <ProgressRing pct={todayPct} size={84} stroke={8} color={todayPct === 100 ? 'var(--success)' : 'var(--primary)'} />
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1rem', fontWeight: 700, transform: 'rotate(90deg)'
            }}>
              {todayPct}%
            </div>
          </div>
          <div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.2rem' }}>Today</p>
            <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.1rem' }}>{stats.completedToday}/{stats.totalHabits}</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>habits done</p>
          </div>
        </div>

        {/* XP progress + mini stat pills */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
          {/* Level + XP bar */}
          <div className="glass-card" style={{ padding: '1.1rem 1.4rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <Award size={16} color="var(--primary)" />
                <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>Level {currentLevel}</span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>→ Level {currentLevel + 1}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--primary)', fontWeight: 600 }}>{stats.points} XP</span>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: '99px', height: '6px', overflow: 'hidden' }}>
              <div style={{
                width: `${xpPct}%`, height: '100%', borderRadius: '99px',
                background: 'linear-gradient(90deg, var(--primary), #b8aff8)',
                transition: 'width 0.7s ease'
              }} />
            </div>
            <p style={{ marginTop: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <Zap size={11} style={{ verticalAlign: 'middle', marginRight: 2 }} />
              {xpRemaining > 0 ? <><strong style={{ color: 'var(--text-sub)' }}>{xpRemaining} XP</strong> to next level · complete {Math.ceil(xpRemaining / 10)} habit{Math.ceil(xpRemaining / 10) !== 1 ? 's' : ''}</> : '🎉 Level up achieved!'}
            </p>
          </div>

          {/* Mini stat pills */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.8rem' }}>
            <StatPill icon={<Flame size={17} />} label="Best Streak" value={`${stats.streak}d`} color="var(--secondary)" />
            <StatPill icon={<TrendingUp size={17} />} label="Consistency" value={`${stats.successRate}%`} color="var(--warning)" />
            <StatPill icon={<Target size={17} />} label="Habits" value={stats.totalHabits} color="var(--success)" />
          </div>
        </div>
      </section>

      {/* ── Today's missed / done banner (only if habits exist) ── */}
      {stats.totalHabits > 0 && stats.missedDays > 0 && (
        <div style={{
          padding: '0.75rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          background: 'rgba(251,191,36,0.08)',
          border: '1px solid rgba(251,191,36,0.18)',
          color: 'var(--warning)',
          fontSize: '0.85rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          ⚠️ <strong>{stats.missedDays}</strong> day{stats.missedDays !== 1 ? 's' : ''} missed this month — keep pushing!
        </div>
      )}

      {/* ── Habits + Sidebar ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Left: habits list */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={17} color="var(--success)" /> Active Habits
            </h2>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
              <select 
                value={categoryFilter} 
                onChange={e => setCategoryFilter(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="All">All Categories</option>
                <option value="Health">Health</option>
                <option value="Work">Work</option>
                <option value="Personal">Personal</option>
                <option value="Learning">Learning</option>
              </select>
              
              <select 
                value={sortOption} 
                onChange={e => setSortOption(e.target.value)}
                style={{ padding: '0.4rem 0.8rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-default)', background: 'var(--bg-surface)', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <option value="Default">Sort: Default</option>
                <option value="Streak">Sort: Highest Streak</option>
                <option value="Progress">Sort: Highest Progress</option>
                <option value="Name">Sort: Alphabetical</option>
              </select>

              <div style={{ width: '1px', height: '24px', background: 'var(--border-default)', margin: '0 0.25rem' }} />

              <button
                onClick={() => setSelectedHabitHistory(null)}
                style={{
                  padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                  background: !selectedHabitHistory ? 'var(--primary)' : 'rgba(0,0,0,0.05)',
                  color: !selectedHabitHistory ? 'white' : 'var(--text-muted)'
                }}
              >All History</button>
              {selectedHabitHistory && (
                <button style={{
                  padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: '99px', border: 'none', cursor: 'pointer',
                  background: 'rgba(0,0,0,0.05)', color: 'var(--text-sub)'
                }}>
                  {selectedHabitHistory.name}
                </button>
              )}
            </div>
          </div>

          <div className="habit-grid">
            {(() => {
              const filteredHabits = habits
                .filter(h => categoryFilter === 'All' || h.category === categoryFilter)
                .sort((a, b) => {
                  if (sortOption === 'Streak') return (b.streak || 0) - (a.streak || 0);
                  if (sortOption === 'Progress') return (b.progress || 0) - (a.progress || 0);
                  if (sortOption === 'Name') return a.name.localeCompare(b.name);
                  return 0;
                });

              return filteredHabits.length > 0 ? (
                filteredHabits.map(habit => (
                  <HabitCard
                    key={habit.id}
                    habit={habit}
                    onComplete={handleComplete}
                    onDelete={handleDelete}
                    onShowHistory={(h) => setSelectedHabitHistory(h)}
                  />
                ))
              ) : (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1' }}>
                  <Target size={36} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                  <p>No habits match your filters.</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <CalendarView
            title={selectedHabitHistory ? `${selectedHabitHistory.name} History` : 'Monthly History'}
            history={selectedHabitHistory
              ? selectedHabitHistory.completions.map(c => c.date)
              : habits.flatMap(h => h.completions.map(c => c.date))}
          />
          <MonthlySummary stats={[
            { label: 'Consistency',   value: `${stats.successRate}%`,               color: 'var(--primary)' },
            { label: 'Total Habits',  value: stats.totalHabits.toString(),           color: 'var(--success)' },
            { label: 'Missed Days',   value: stats.missedDays.toString(),            color: 'var(--danger)' },
            { label: 'Points Earned', value: stats.points.toLocaleString(),          color: 'var(--warning)' },
          ]} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
