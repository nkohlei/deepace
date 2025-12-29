import React from 'react';
import UserBar from './UserBar';

const ChannelSidebar = ({ portal, isMember, onEdit, currentChannel, onChangeChannel }) => {
    if (!portal) return null;

    const channels = [
        { id: 'general', name: 'genel', type: 'text' },
        { id: 'announcements', name: 'duyurular', type: 'text' },
        { id: 'members', name: 'üyeler', type: 'text' },
        { id: 'voice-lounge', name: 'Canlı Sohbet', type: 'voice' }
    ];

    return (
        <div className="channel-sidebar" style={{
            width: '320px', /* Upscaled width "thicker" */
            height: '100%',
            backgroundColor: '#111827',
            display: 'flex',
            flexDirection: 'column',
            flexShrink: 0,
            borderRight: '1px solid rgba(255,255,255,0.06)'
        }}>
            {/* Header / Portal Name Dropdown */}
            {/* Split Header: Banner Area + Text Area for "Text down" effect */}
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                cursor: 'pointer',
                transition: 'background 0.2s'
            }}
                className="channel-header-hover"
                onClick={onEdit}
            >
                {/* Visual Header Top Strip (Simulating Banner/Color Block) */}
                <div style={{ height: '12px', width: '100%', background: 'linear-gradient(90deg, #5865F2, #4752C4)' }}></div>

                <div style={{
                    height: '64px',
                    padding: '0 20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}>
                    <h2 style={{
                        marginTop: '4px', /* Shift text down slightly */
                        fontSize: '19px', /* Larger Font */
                        fontWeight: '800',
                        color: 'white',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                    }}>
                        {portal.name}
                    </h2>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" color="#b9bbbe">
                        <path d="M6 9l6 6 6-6" />
                    </svg>
                </div>
            </div>

            {/* Channels List */}
            <div style={{ flex: 1, padding: '24px 10px', overflowY: 'auto' }} className="custom-scrollbar">

                {/* Text Channels Category */}
                <div style={{ marginBottom: '24px' }}>
                    <div style={{
                        padding: '0 8px 6px 8px',
                        fontSize: '13px', /* Larger category text */
                        fontWeight: '800',
                        color: '#949ba4',
                        textTransform: 'uppercase',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        letterSpacing: '0.5px'
                    }}
                        className="category-header"
                    >
                        <span>Metin Kanalları</span>
                        <span style={{ cursor: 'pointer', fontSize: '20px' }}>+</span>
                    </div>

                    {channels.filter(c => c.type === 'text').map(channel => (
                        <div
                            key={channel.id}
                            className={`channel-item ${currentChannel === channel.id ? 'active' : ''}`}
                            onClick={() => onChangeChannel(channel.id)}
                            style={{
                                padding: '8px 12px', /* Larger padding */
                                margin: '2px 0',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                color: currentChannel === channel.id ? 'white' : '#949ba4',
                                backgroundColor: currentChannel === channel.id ? 'rgba(255,255,255,0.06)' : 'transparent',
                                transition: 'all 0.1s'
                            }}
                        >
                            <span style={{ fontSize: '22px', color: '#72767d', fontWeight: 300 }}>#</span>
                            <span style={{ fontWeight: 600, fontSize: '16px' }}>{channel.name}</span>
                        </div>
                    ))}
                </div>

                {/* Voice Channels Category */}
                <div>
                    <div style={{
                        padding: '0 8px 6px 8px',
                        fontSize: '13px',
                        fontWeight: '800',
                        color: '#949ba4',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Ses Kanalları
                    </div>
                    {channels.filter(c => c.type === 'voice').map(channel => (
                        <div
                            key={channel.id}
                            className="channel-item"
                            style={{
                                padding: '8px 12px',
                                margin: '2px 0',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                cursor: 'pointer',
                                color: '#949ba4'
                            }}
                        >
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3 3 3 0 0 1-3-3V5a3 3 0 0 1 3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                            </svg>
                            <span style={{ fontWeight: 600, fontSize: '16px' }}>{channel.name}</span>
                            <div style={{ marginLeft: 'auto', fontSize: '11px', background: '#3ba55d', padding: '2px 6px', borderRadius: '4px', color: 'white', fontWeight: 'bold' }}>
                                LIVE
                            </div>
                        </div>
                    ))}
                    {/* Fake User in Voice */}
                    <div style={{ marginLeft: '34px', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#5865F2', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', border: '2px solid #111827' }}>
                            U
                        </div>
                        <span style={{ fontSize: '14px', color: 'white', fontWeight: 500 }}>ufuk.gls</span>
                    </div>
                </div>

            </div>

            {/* Bottom User Bar */}
            <UserBar />

            <style>{`
                .channel-header-hover:hover {
                    background-color: rgba(255,255,255,0.04);
                }
                .channel-item:hover {
                    background-color: rgba(255,255,255,0.04);
                    color: #dcddde !important;
                }
                .channel-item.active {
                    background-color: rgba(79, 84, 92, 0.48) !important;
                    color: white !important;
                }
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #202225;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default ChannelSidebar;
