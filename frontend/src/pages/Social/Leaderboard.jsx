import React, { useState, useEffect } from 'react';
import { Trophy, Award, TrendingUp, Search } from 'lucide-react';
import { authApi } from '../../api';

const Leaderboard = () => {
  const [topUsers, setTopUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('All Time');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leaderboardRes, meRes] = await Promise.all([
          authApi.getLeaderboard(),
          authApi.getMe()
        ]);
        setTopUsers(leaderboardRes.data);
        setCurrentUser(meRes.data);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading rankings...</div>;

  return (
    <div style={{ padding: '2rem 0' }}>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem' }}>Global Leaderboard 🏆</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem' }}>Top performers this month across the HabitChain community</p>
      </header>

      <div style={{ maxWidth: '800px', margin: '0 auto 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', background: 'var(--bg-elevated)', padding: '0.25rem', borderRadius: '99px', border: '1px solid var(--border-default)' }}>
          {['All Time', 'This Month', 'This Week'].map(filter => (
            <button 
              key={filter}
              onClick={() => setTimeFilter(filter)}
              style={{
                padding: '0.5rem 1.25rem', borderRadius: '99px', border: 'none', cursor: 'pointer', fontWeight: '600', fontSize: '0.85rem',
                background: timeFilter === filter ? 'var(--primary)' : 'transparent',
                color: timeFilter === filter ? '#fff' : 'var(--text-muted)',
                transition: 'all 0.2s'
              }}
            >
              {filter}
            </button>
          ))}
        </div>
        
        <div style={{ position: 'relative', width: '260px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: '2.5rem', borderRadius: '99px', background: 'var(--bg-elevated)' }}
          />
        </div>
      </div>

      <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid var(--glass-border)', display: 'grid', gridTemplateColumns: '80px 1fr 150px 150px', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          <span>RANK</span>
          <span>USER</span>
          <span style={{ textAlign: 'center' }}>LEVEL</span>
          <span style={{ textAlign: 'right' }}>POINTS</span>
        </div>

        {(() => {
          const filteredUsers = topUsers
            .filter(u => u.username.toLowerCase().includes(searchQuery.toLowerCase()))
            .map(u => {
              // Mock time-scoped points for visual reactivity
              let mockPoints = u.points;
              if (timeFilter === 'This Month') mockPoints = Math.max(0, Math.floor(u.points * 0.45));
              if (timeFilter === 'This Week') mockPoints = Math.max(0, Math.floor(u.points * 0.12));
              return { ...u, displayPoints: mockPoints };
            })
            .sort((a, b) => b.displayPoints - a.displayPoints);

          return filteredUsers.length > 0 ? filteredUsers.map((user, index) => {
          const isCurrentUser = user.id === currentUser?.id;
          let rankDisplay = `#${index + 1}`;
          if (index === 0) rankDisplay = '🥇';
          else if (index === 1) rankDisplay = '🥈';
          else if (index === 2) rankDisplay = '🥉';

          return (
            <div key={user.id} style={{ 
              padding: '1.25rem 2rem', 
              display: 'grid', 
              gridTemplateColumns: '80px 1fr 150px 150px', 
              alignItems: 'center',
              borderBottom: index < topUsers.length - 1 ? '1px solid var(--border-subtle)' : 'none',
              background: isCurrentUser ? 'var(--primary-glow)' : 'transparent',
              transition: 'background 0.2s'
            }}
            onMouseEnter={e => { if(!isCurrentUser) e.currentTarget.style.background = 'rgba(0,0,0,0.02)' }}
            onMouseLeave={e => { if(!isCurrentUser) e.currentTarget.style.background = 'transparent' }}
            >
              <span style={{ 
                fontSize: index < 3 ? '1.75rem' : '1.1rem', 
                fontWeight: '800', 
                color: index < 3 ? 'inherit' : 'var(--text-muted)' 
              }}>
                {rankDisplay}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div className={index === 0 ? "rank-1-glow" : ""} style={{ 
                  width: '44px', height: '44px', 
                  background: isCurrentUser ? 'linear-gradient(135deg, var(--primary) 0%, #1d4ed8 100%)' : 'linear-gradient(135deg, var(--text-muted) 0%, var(--text-sub) 100%)', 
                  color: '#fff',
                  borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontWeight: '800', fontSize: '1.1rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontWeight: isCurrentUser ? '800' : '600', color: 'var(--text-main)', fontSize: '1.05rem' }}>
                    {user.username}
                  </span>
                  {isCurrentUser && (
                    <span className="chip chip-primary" style={{ fontSize: '0.65rem', padding: '0.1rem 0.5rem' }}>You</span>
                  )}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <span className="streak-badge" style={{ background: 'var(--bg-base)', color: 'var(--text-sub)', border: '1px solid var(--border-default)' }}>
                  Lv. {user.level}
                </span>
              </div>
              <span style={{ textAlign: 'right', fontWeight: '800', color: isCurrentUser ? 'var(--primary)' : 'var(--text-sub)' }}>
                {user.displayPoints.toLocaleString()} XP
              </span>
            </div>
          );
        }) : (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Search size={36} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No legends found matching "{searchQuery}".</p>
          </div>
        );
        })()}

        {topUsers.length === 0 && (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No legends yet. Start your journey to appear here! 🚀
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
