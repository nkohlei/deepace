import React from 'react';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import { useNavigate } from 'react-router-dom';

const UserBar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    return (
        <div style={{
            height: '52px',
            backgroundColor: '#0b0f19', // Slightly darker than sidebar
            padding: '0 8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,0.05)'
        }}>
            {/* User Info */}
            <div
                className="user-bar-info"
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    marginRight: 'auto'
                }}
                onClick={() => navigate('/profile')}
            >
                <div style={{ position: 'relative' }}>
                    {user.profile?.avatar ? (
                        <img
                            src={getImageUrl(user.profile.avatar)}
                            alt="User"
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                    ) : (
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            backgroundColor: '#5865F2',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 'bold'
                        }}>
                            {user.username?.[0]?.toUpperCase()}
                        </div>
                    )}
                    <div style={{
                        position: 'absolute',
                        bottom: '-2px',
                        right: '-2px',
                        width: '10px',
                        height: '10px',
                        backgroundColor: '#23a559', // Online green
                        borderRadius: '50%',
                        border: '2px solid #0b0f19'
                    }} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'white' }}>
                        {user.username}
                    </span>
                    <span style={{ fontSize: '11px', color: '#b9bbbe' }}>
                        #{user._id.substring(0, 4)}
                    </span>
                </div>
            </div>

            {/* Controls */}
            <div style={{ display: 'flex' }}>
                <button
                    className="user-control-btn"
                    title="Mikrofon (Temsili)"
                    style={{ background: 'transparent', border: 'none', color: '#b9bbbe', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" />
                        <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>
                <button
                    className="user-control-btn"
                    title="Kulaklık (Temsili)"
                    style={{ background: 'transparent', border: 'none', color: '#b9bbbe', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M3 18v-6a9 9 0 0 1 18 0v6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="currentColor" />
                    </svg>
                </button>
                <button
                    className="user-control-btn"
                    title="Ayarlar"
                    onClick={() => navigate('/settings')}
                    style={{ background: 'transparent', border: 'none', color: '#b9bbbe', padding: '6px', cursor: 'pointer', borderRadius: '4px' }}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3"></circle>
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                    </svg>
                </button>
            </div>
            <style>
                {`
                .user-bar-info:hover, .user-control-btn:hover {
                    background-color: rgba(255,255,255,0.06) !important;
                }
                `}
            </style>
        </div>
    );
};

export default UserBar;
