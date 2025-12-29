import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Badge from '../components/Badge';
import './Profile.css';

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, updateUser } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        displayName: '',
        bio: '',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const isOwnProfile = !username || (currentUser && currentUser.username === username);

    useEffect(() => {
        if (isOwnProfile) {
            fetchMyProfile();
        } else {
            fetchUserProfile(username);
        }
    }, [username, isOwnProfile]);

    const fetchMyProfile = async () => {
        try {
            const response = await axios.get('/api/users/me');
            setProfileUser(response.data);
            setFormData({
                displayName: response.data.profile?.displayName || '',
                bio: response.data.profile?.bio || '',
            });
        } catch (err) {
            console.error('Failed to fetch my profile:', err);
        }
    };

    const fetchUserProfile = async (username) => {
        try {
            const response = await axios.get(`/api/users/${username}`);
            setProfileUser(response.data);
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            setError('Kullanıcı bulunamadı');
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            setLoading(true);
            const response = await axios.post('/api/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = { ...currentUser };
            updatedUser.profile.avatar = response.data.avatar;
            updateUser(updatedUser);
            setProfileUser(prev => ({ ...prev, profile: { ...prev.profile, avatar: response.data.avatar } }));
            setSuccess('Profil fotoğrafı güncellendi!');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Resim yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleCoverChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('cover', file);
        try {
            setLoading(true);
            const response = await axios.post('/api/users/me/cover', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const updatedUser = { ...currentUser };
            updatedUser.profile.coverImage = response.data.coverImage;
            updateUser(updatedUser);
            setProfileUser(prev => ({ ...prev, profile: { ...prev.profile, coverImage: response.data.coverImage } }));
            setSuccess('Kapak fotoğrafı güncellendi!');
        } catch (err) {
            console.error('Upload cover error:', err);
            setError('Kapak resmi yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);
        try {
            const response = await axios.put('/api/users/me', formData);
            updateUser(response.data.user);
            setProfileUser(prev => ({ ...prev, profile: { ...prev.profile, ...formData } }));
            setSuccess('Profil güncellendi!');
            setEditing(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Profil güncellenemedi');
        } finally {
            setLoading(false);
        }
    };

    if (!profileUser) {
        return (
            <div className="app-wrapper">
                <Navbar />
                <main className="app-content">
                    <div className="spinner-container" style={{ display: 'flex', justifyContent: 'center', paddingTop: '50px' }}>
                        <div className="spinner"></div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="app-wrapper full-height" style={{ backgroundColor: '#111214', color: '#dbdee1' }}>
            <main className="app-content profile-page-content" style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>

                {/* Wide Profile Card */}
                <div style={{
                    width: '100%',
                    maxWidth: '680px',
                    backgroundColor: '#111214', /* Main dark bg */
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: '0 0 0 1px #1e1f22, 0 8px 32px rgba(0,0,0,0.45)'
                }}>

                    {/* Banner */}
                    <div style={{ height: '210px', backgroundColor: profileUser?.profile?.bannerColor || '#1e1f22', position: 'relative' }}>
                        {profileUser?.profile?.coverImage && (
                            <img
                                src={getImageUrl(profileUser.profile.coverImage)}
                                alt="Banner"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                        {/* Status Bubble (Top Right) */}
                        {profileUser?.profile?.bio && (
                            <div style={{
                                position: 'absolute',
                                right: '20px',
                                bottom: '-40px', /* Hang below banner slightly */
                                top: 'auto',
                                maxWidth: '300px',
                                backgroundColor: '#111214',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #1e1f22',
                                color: '#dbdee1',
                                fontSize: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                zIndex: 10
                            }}>
                                <span role="img" aria-label="thought">💭</span>
                                {profileUser.profile.bio}
                            </div>
                        )}
                    </div>

                    {/* Profile Header (Avatar & Actions) */}
                    <div style={{ padding: '0 24px', position: 'relative', top: '-60px', marginBottom: '-50px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                        {/* Avatar */}
                        <div style={{
                            width: '136px',
                            height: '136px',
                            borderRadius: '50%',
                            backgroundColor: '#111214',
                            border: '8px solid #111214',
                            position: 'relative',
                            zIndex: 5
                        }}>
                            {profileUser?.profile?.avatar ? (
                                <img
                                    src={getImageUrl(profileUser.profile.avatar)}
                                    alt={profileUser.username}
                                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '50px', color: 'white' }}>
                                    {profileUser.username?.[0]?.toUpperCase()}
                                </div>
                            )}
                            <div style={{
                                position: 'absolute',
                                bottom: '6px',
                                right: '6px',
                                width: '28px',
                                height: '28px',
                                backgroundColor: '#23a559',
                                borderRadius: '50%',
                                border: '4px solid #111214'
                            }} />
                        </div>

                        {/* Actions */}
                        <div style={{ paddingBottom: '16px', display: 'flex', gap: '8px' }}>
                            {isOwnProfile ? (
                                <>
                                    <button className="btn" style={{
                                        backgroundColor: '#4e5058',
                                        color: 'white',
                                        padding: '8px 16px',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        fontSize: '14px',
                                        cursor: 'pointer'
                                    }} onClick={() => setEditing(true)}>
                                        Profili Düzenle
                                    </button>
                                    <button className="btn" style={{
                                        backgroundColor: '#4e5058',
                                        color: 'white',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button className="btn"
                                        onClick={() => {
                                            // TODO: Real message logic
                                            alert('Mesajlaşma özelliği yakında!');
                                        }}
                                        style={{
                                            backgroundColor: '#5865F2',
                                            color: 'white',
                                            padding: '8px 16px',
                                            borderRadius: '4px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            border: 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '6px'
                                        }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                                        Mesaj
                                    </button>
                                    <button className="btn" style={{
                                        backgroundColor: '#4e5058',
                                        color: 'white',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                                    </button>
                                    <button className="btn" style={{
                                        backgroundColor: '#4e5058',
                                        color: 'white',
                                        padding: '8px',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        border: 'none',
                                        display: 'flex',
                                        alignItems: 'center'
                                    }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Main Content Area */}
                    <div style={{ padding: '70px 24px 24px 24px', backgroundColor: '#111214', flex: 1, display: 'flex', flexDirection: 'column' }}>

                        {/* User Info */}
                        <div style={{ marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'white', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                                {profileUser?.profile?.displayName || profileUser?.username}
                                <Badge type={profileUser?.verificationBadge} />
                            </h1>
                            <span style={{ fontSize: '16px', color: '#dbdee1' }}>{profileUser?.username}</span>
                        </div>

                        {/* Divider */}
                        <div style={{ height: '1px', backgroundColor: '#3f4147', margin: '16px 0' }}></div>

                        {/* Info Tabs */}
                        {isOwnProfile ? (
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', borderBottom: '1px solid #3f4147' }}>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid #dbdee1', color: '#dbdee1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>Pano</div>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid transparent', color: '#b5bac1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>Etkinlik</div>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid transparent', color: '#b5bac1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>İstek Listesi</div>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', gap: '24px', marginBottom: '20px', borderBottom: '1px solid #3f4147' }}>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid #dbdee1', color: '#dbdee1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>Etkinlik</div>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid transparent', color: '#b5bac1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>1 Ortak Arkadaş</div>
                                <div style={{ padding: '8px 0', borderBottom: '2px solid transparent', color: '#b5bac1', fontWeight: '500', cursor: 'pointer', fontSize: '15px' }}>1 Ortak Sunucu</div>
                            </div>
                        )}

                        {/* Profile Body Content */}
                        <div style={{ flex: 1 }}>
                            {/* Bio / About */}
                            {profileUser?.profile?.bio && (
                                <div style={{ marginBottom: '24px' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase', marginBottom: '8px' }}>HAKKIMDA</h4>
                                    <div style={{ fontSize: '14px', color: '#dbdee1', whiteSpace: 'pre-wrap' }}>
                                        {profileUser.profile.bio}
                                    </div>
                                </div>
                            )}

                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase', marginBottom: '8px' }}>ÜYELİK TARİHİ</h4>
                                <div style={{ fontSize: '14px', color: '#dbdee1', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                                        <span>24 Mar 2023</span>
                                    </div>
                                </div>
                            </div>

                            {/* Not (Only visible to you) */}
                            <div style={{ marginBottom: '24px' }}>
                                <h4 style={{ fontSize: '12px', fontWeight: '700', color: '#949ba4', textTransform: 'uppercase', marginBottom: '8px' }}>Not (sadece sana görünür)</h4>
                                <div style={{ fontSize: '13px', color: '#dbdee1', cursor: 'pointer' }}>
                                    Not eklemek için tıkla
                                </div>
                            </div>

                            {/* My Profile Widgets */}
                            {isOwnProfile && (
                                <div style={{ marginTop: 'auto', paddingTop: '20px' }}>
                                    <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                                        <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f2f3f5', margin: '0 0 4px 0' }}>Profilini Widget'larla özelleştir</h3>
                                        <p style={{ fontSize: '13px', color: '#b5bac1', margin: 0 }}>Kendin ve ilgi alanların hakkında daha fazla paylaşım yapmak için Widget kitaplığımızdan seçim yap</p>
                                    </div>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                                        {/* Widget 1: Marvel Rivals */}
                                        <div className="profile-widget-card" style={{ background: 'linear-gradient(135deg, #2b2d31 0%, #1e1f22 100%)' }}>
                                            <div className="widget-add-btn">+</div>
                                            <span className="widget-text">Marvel Rivals <span style={{ fontSize: '10px', verticalAlign: 'top' }}>Beta</span></span>
                                        </div>
                                        {/* Widget 2: Favori Oyun */}
                                        <div className="profile-widget-card">
                                            <div className="widget-add-btn">+</div>
                                            <span className="widget-text">Favori oyun</span>
                                        </div>
                                        {/* Widget 3: Sevdiğim oyunlar */}
                                        <div className="profile-widget-card">
                                            <div className="widget-add-btn">+</div>
                                            <span className="widget-text">Sevdiğim oyunlar</span>
                                        </div>
                                        {/* Widget 4: Dönüşümlü oyunlar */}
                                        <div className="profile-widget-card">
                                            <div className="widget-add-btn">+</div>
                                            <span className="widget-text">Dönüşümlü oyunlar</span>
                                        </div>
                                        {/* Widget 5 (Span 2 col?) - Oynamak istiyorum */}
                                        <div className="profile-widget-card" style={{ gridColumn: 'span 2', justifyContent: 'center' }}>
                                            <div className="widget-add-btn">+</div>
                                            <span className="widget-text">Oynamak istiyorum</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Other Profile Empty State */}
                            {!isOwnProfile && (
                                <div style={{
                                    marginTop: '40px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    padding: '20px'
                                }}>
                                    <h3 style={{ color: '#dbdee1', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                                        {profileUser?.username} adlı kişinin burada paylaşılacak bir etkinliği yok
                                    </h3>
                                    <p style={{ color: '#b5bac1', fontSize: '14px', maxWidth: '300px', margin: '0 0 24px 0' }}>
                                        Bu profil hâlâ geliştirme aşamasında. Selam vermek için bir mesaj gönder!
                                    </p>
                                    <button style={{
                                        backgroundColor: '#3f4147',
                                        color: '#dbdee1',
                                        border: 'none',
                                        padding: '10px 24px',
                                        borderRadius: '4px',
                                        fontWeight: '600',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px'
                                    }}>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="currentColor" strokeWidth="0"><path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z" /></svg>
                                        Mesaj Gönder
                                    </button>
                                </div>
                            )}

                        </div>

                        <style>{`
                            .profile-widget-card {
                                background-color: #1e1f22;
                                border-radius: 8px;
                                padding: 20px;
                                display: flex;
                                flex-direction: column;
                                alignItems: center;
                                justify-content: center;
                                gap: 12px;
                                cursor: pointer;
                                border: 1px dashed #4e5058;
                                transition: all 0.2s;
                                min-height: 100px;
                            }
                            .profile-widget-card:hover {
                                background-color: #2b2d31;
                                border-color: #dbdee1;
                            }
                            .widget-add-btn {
                                width: 32px;
                                height: 32px;
                                background-color: #4e5058;
                                border-radius: 50%;
                                display: flex;
                                alignItems: center;
                                justify-content: center;
                                color: white;
                                font-size: 20px;
                                font-weight: bold;
                            }
                            .widget-text {
                                font-size: 14px;
                                fontWeight: 700;
                                color: '#dbdee1';
                            }
                        `}</style>
                    </div>
                </div>

                {/* Edit Profile Modal (Existing Logic) */}
                {editing && (
                    <div className="edit-modal-overlay" onClick={() => setEditing(false)}>
                        <div className="edit-modal-modern" onClick={e => e.stopPropagation()}>
                            <div className="edit-modal-header-modern">
                                <div className="header-left">
                                    <button className="close-btn-modern" onClick={() => setEditing(false)}>✕</button>
                                    <h2 className="header-title-modern">Profili düzenle</h2>
                                </div>
                                <button className="save-btn-modern" onClick={handleSubmit} disabled={loading}>
                                    {loading ? '...' : 'Kaydet'}
                                </button>
                            </div>

                            <div className="edit-modal-content-modern" style={{ backgroundColor: '#313338' }}>
                                {/* ... Reusing existing edit modal content structure ... */}
                                <div className="edit-cover-container">
                                    {profileUser?.profile?.coverImage ? (
                                        <img src={getImageUrl(profileUser.profile.coverImage)} alt="Cover" className="edit-cover-image" />
                                    ) : (
                                        <div className="edit-cover-placeholder"></div>
                                    )}
                                    <div className="image-overlay-actions">
                                        <button className="image-overlay-btn" onClick={() => coverInputRef.current.click()} title="Fotoğraf ekle">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                <circle cx="12" cy="13" r="4"></circle>
                                            </svg>
                                        </button>
                                        <input type="file" ref={coverInputRef} onChange={handleCoverChange} style={{ display: 'none' }} accept="image/*" />
                                    </div>
                                </div>

                                <div className="edit-avatar-container">
                                    <div className="edit-avatar-wrapper">
                                        {profileUser?.profile?.avatar ? (
                                            <img src={getImageUrl(profileUser.profile.avatar)} alt="Avatar" className="edit-avatar-image" />
                                        ) : (
                                            <div className="edit-avatar-placeholder">
                                                {profileUser.username[0].toUpperCase()}
                                            </div>
                                        )}
                                        <div className="avatar-overlay-actions">
                                            <button className="image-overlay-btn" onClick={() => avatarInputRef.current.click()} title="Fotoğraf ekle">
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                                    <circle cx="12" cy="13" r="4"></circle>
                                                </svg>
                                            </button>
                                            <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} style={{ display: 'none' }} accept="image/*" />
                                        </div>
                                    </div>
                                </div>

                                <div className="edit-form-fields">
                                    <div className="floating-label-group">
                                        <input
                                            type="text"
                                            name="displayName"
                                            value={formData.displayName}
                                            onChange={handleChange}
                                            className="floating-input"
                                            placeholder=" "
                                            id="input-name"
                                            style={{ backgroundColor: '#1e1f22', borderColor: '#1e1f22', color: 'white' }}
                                        />
                                        <label htmlFor="input-name" className="floating-label">İsim</label>
                                    </div>

                                    <div className="floating-label-group">
                                        <textarea
                                            name="bio"
                                            value={formData.bio}
                                            onChange={handleChange}
                                            className="floating-input floating-textarea"
                                            placeholder=" "
                                            id="input-bio"
                                            style={{ backgroundColor: '#1e1f22', borderColor: '#1e1f22', color: 'white' }}
                                        />
                                        <label htmlFor="input-bio" className="floating-label">Bio (Kendinden bahset)</label>
                                    </div>

                                    {error && <div className="error-message">{error}</div>}
                                    {success && <div className="success-message">{success}</div>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Profile;
