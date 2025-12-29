import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import PostCard from '../components/PostCard';
import ChannelSidebar from '../components/ChannelSidebar';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Portal.css';

const Portal = () => {
    const { id } = useParams();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [portal, setPortal] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMember, setIsMember] = useState(false);

    // Channel State
    const [currentChannel, setCurrentChannel] = useState('general');

    // Edit State
    const [editing, setEditing] = useState(false);
    const [editLoading, setEditLoading] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        description: '',
        privacy: 'public'
    });
    const avatarInputRef = useRef(null);
    const bannerInputRef = useRef(null);

    useEffect(() => {
        fetchPortalData();
    }, [id]);

    useEffect(() => {
        if (portal && user) {
            const memberCheck = portal.members?.includes(user._id) ||
                user.joinedPortals?.some(p => p._id === portal._id || p === portal._id);
            setIsMember(!!memberCheck);
        }
    }, [portal, user]);

    const fetchPortalData = async () => {
        setLoading(true);
        try {
            const [portalRes, postsRes] = await Promise.all([
                axios.get(`/api/portals/${id}`),
                axios.get(`/api/portals/${id}/posts`)
            ]);

            setPortal(portalRes.data);
            setPosts(postsRes.data);
            setEditFormData({
                name: portalRes.data.name,
                description: portalRes.data.description || '',
                privacy: portalRes.data.privacy || 'public'
            });
        } catch (err) {
            setError('Portal yüklenemedi');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            await axios.post(`/api/portals/${id}/join`);
            setIsMember(true);
            const updatedUser = {
                ...user,
                joinedPortals: [...(user.joinedPortals || []), portal]
            };
            updateUser(updatedUser);
            // Refresh portal members count
            setPortal(prev => ({ ...prev, members: [...(prev.members || []), user._id] }));
        } catch (err) {
            console.error('Join failed', err);
        }
    };

    const handleLeave = async () => {
        if (!window.confirm('Bu portaldan ayrılmak istediğine emin misin?')) return;
        try {
            await axios.post(`/api/portals/${id}/leave`);
            setIsMember(false);
            const updatedUser = {
                ...user,
                joinedPortals: user.joinedPortals.filter(p => p._id !== id && p !== id)
            };
            updateUser(updatedUser);
            navigate('/');
        } catch (err) {
            console.error('Leave failed', err);
            alert(err.response?.data?.message || 'Ayrılma başarısız');
        }
    };

    const isOwner = user && portal && portal.owner && (
        portal.owner._id === user._id || portal.owner === user._id
    );

    // Edit Handlers
    const handleEditChange = (e) => {
        setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setEditLoading(true);
            const res = await axios.post(`/api/portals/${id}/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPortal(res.data);
        } catch (err) {
            console.error('Avatar upload failed', err);
            alert('Avatar yüklenemedi');
        } finally {
            setEditLoading(false);
        }
    };

    const handleBannerUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('banner', file);

        try {
            setEditLoading(true);
            const res = await axios.post(`/api/portals/${id}/banner`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setPortal(res.data);
        } catch (err) {
            console.error('Banner upload failed', err);
            alert('Banner yüklenemedi');
        } finally {
            setEditLoading(false);
        }
    };

    const handleEditSubmit = async () => {
        try {
            setEditLoading(true);
            const res = await axios.put(`/api/portals/${id}`, editFormData);
            setPortal(res.data);
            setEditing(false);
        } catch (err) {
            console.error('Update failed', err);
            alert(err.response?.data?.message || 'Güncelleme başarısız');
        } finally {
            setEditLoading(false);
        }
    };

    if (loading) return (
        <div className="app-wrapper full-height">
            <div className="spinner-container"><div className="spinner"></div></div>
        </div>
    );

    if (error || !portal) return (
        <div className="app-wrapper full-height">
            <div className="error-message">{error || 'Portal bulunamadı'}</div>
        </div>
    );

    return (
        <div className="app-wrapper full-height discord-layout">
            {/* Channel Sidebar */}
            <ChannelSidebar
                portal={portal}
                isMember={isMember}
                onEdit={() => isOwner && setEditing(true)}
                currentChannel={currentChannel}
                onChangeChannel={setCurrentChannel}
            />

            {/* Main Content Area */}
            <main className="discord-main-content">

                {/* Channel Header */}
                <header className="channel-top-bar">
                    <div className="channel-title-wrapper">
                        <span className="hashtag">#</span>
                        <h3 className="channel-name">{currentChannel === 'general' ? 'genel' : currentChannel}</h3>
                    </div>

                    {currentChannel === 'general' && (
                        <span className="channel-topic">
                            {portal.description ? `- ${portal.description}` : ''}
                        </span>
                    )}

                    <div className="channel-header-actions">
                        {/* Example Actions */}
                        <div className="icon-btn" title="Bildirimler">🔔</div>
                        <div className="icon-btn" title="Sabitlenmiş Mesajlar">📌</div>
                        <div className="icon-btn" title="Üye Listesi">👥</div>

                        <div className="search-bar-mini">
                            <input type="text" placeholder="Ara" />
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        </div>
                    </div>
                </header>

                {/* Channel Content (Feed) */}
                <div className="channel-messages-area">
                    {currentChannel === 'general' && (
                        <>
                            <div className="portal-feed-container discord-feed">
                                {/* Only show create post if member */}
                                {isMember && (
                                    <div className="create-post-trigger" onClick={() => navigate('/create', { state: { portalId: id } })}>
                                        {/* Create Post trigger (could be styled better, standardizing for now) */}
                                    </div>
                                )}

                                {posts.length === 0 ? (
                                    <div className="empty-portal">
                                        <div className="empty-portal-icon">👋</div>
                                        <h3>#genel kanalına hoş geldin!</h3>
                                        <p>Burası {portal.name} sunucusunun başlangıcı.</p>
                                    </div>
                                ) : (
                                    posts.map((post) => (
                                        <PostCard key={post._id} post={post} />
                                    ))
                                )}
                            </div>
                        </>
                    )}

                    {currentChannel === 'members' && (
                        <div style={{ padding: '20px', color: '#dcddde' }}>
                            <h3>Üyeler ({portal.members?.length || 0})</h3>
                            <div style={{ marginTop: '20px' }}>
                                {/* Placeholder for member list */}
                                {portal.members?.map((memberId, idx) => (
                                    <div key={idx} style={{ padding: '10px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                        Üye ID: {memberId}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {currentChannel !== 'general' && currentChannel !== 'members' && (
                        <div style={{ padding: '40px', textAlign: 'center', color: '#72767d' }}>
                            <h3>#{currentChannel}</h3>
                            <p>Bu kanalda henüz mesaj yok.</p>
                        </div>
                    )}
                </div>

                {/* Edit Modal (Preserved) */}
                {editing && (
                    <div className="edit-modal-overlay" onClick={() => setEditing(false)}>
                        <div className="edit-modal-modern" onClick={e => e.stopPropagation()}>
                            <div className="edit-modal-header-modern">
                                <div className="header-left">
                                    <button className="close-btn-modern" onClick={() => setEditing(false)}>✕</button>
                                    <h2 className="header-title-modern">Portalı Düzenle</h2>
                                </div>
                                <button className="save-btn-modern" onClick={handleEditSubmit} disabled={editLoading}>
                                    {editLoading ? '...' : 'Kaydet'}
                                </button>
                            </div>

                            <div className="edit-modal-content-modern">
                                {/* Banner Edit */}
                                <div className="edit-cover-container">
                                    {portal.banner ? (
                                        <img src={getImageUrl(portal.banner)} alt="Banner" className="edit-cover-image" />
                                    ) : (
                                        <div className="edit-cover-placeholder"></div>
                                    )}
                                    <div className="image-overlay-actions">
                                        <button className="image-overlay-btn" onClick={() => bannerInputRef.current.click()} title="Banner Ekle">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                        </button>
                                        <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} style={{ display: 'none' }} accept="image/*" />
                                    </div>
                                </div>

                                {/* Avatar Edit */}
                                <div className="edit-avatar-container">
                                    <div className="edit-avatar-wrapper">
                                        {portal.avatar ? (
                                            <img src={getImageUrl(portal.avatar)} alt="Avatar" className="edit-avatar-image" />
                                        ) : (
                                            <div className="edit-avatar-placeholder">
                                                {portal.name.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className="avatar-overlay-actions">
                                            <button className="image-overlay-btn" onClick={() => avatarInputRef.current.click()} title="Logo Ekle">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                    <circle cx="12" cy="13" r="4"></circle>
                                                </svg>
                                            </button>
                                            <input type="file" ref={avatarInputRef} onChange={handleAvatarUpload} style={{ display: 'none' }} accept="image/*" />
                                        </div>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="edit-form-fields">
                                    <div className="floating-label-group">
                                        <label htmlFor="portal-name" className="floating-label">Portal Adı</label>
                                        <input
                                            type="text"
                                            id="portal-name"
                                            name="name"
                                            value={editFormData.name}
                                            onChange={handleEditChange}
                                            className="floating-input"
                                        />
                                    </div>

                                    <div className="floating-label-group">
                                        <label htmlFor="portal-desc" className="floating-label">Açıklama</label>
                                        <textarea
                                            id="portal-desc"
                                            name="description"
                                            value={editFormData.description}
                                            onChange={handleEditChange}
                                            className="floating-input floating-textarea"
                                        />
                                    </div>

                                    <div className="floating-label-group">
                                        <label className="floating-label">Gizlilik</label>
                                        <select
                                            name="privacy"
                                            value={editFormData.privacy}
                                            onChange={handleEditChange}
                                            className="floating-input"
                                        >
                                            <option value="public">Herkese Açık</option>
                                            <option value="private">Gizli</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Portal;
