import { useState, useEffect, useRef } from 'react';
import { getImageUrl } from '../utils/imageUtils';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import FollowButton from '../components/FollowButton';
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

    // Follow Modal State
    const [showFollowModal, setShowFollowModal] = useState(null); // 'followers' or 'following'
    const [followList, setFollowList] = useState([]);
    const [loadingFollow, setLoadingFollow] = useState(false);
    // Follow Search
    const [searchFollowTerm, setSearchFollowTerm] = useState('');

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const avatarInputRef = useRef(null);
    const coverInputRef = useRef(null);

    const isOwnProfile = !username || (currentUser && currentUser.username === username);
    const isLocked = !isOwnProfile && profileUser?.settings?.privacy?.isPrivate && !profileUser.isFollowing;

    useEffect(() => {
        if (isOwnProfile) {
            fetchMyProfile();
        } else {
            fetchUserProfile(username);
        }
    }, [username, isOwnProfile]);

    const handleMessageClick = () => {
        if (!currentUser) {
            navigate('/login');
            return;
        }
        navigate(`/inbox?user=${profileUser.username}`);
    };

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

    const fetchFollowList = async (type) => {
        if (!profileUser?._id) return;
        setLoadingFollow(true);
        try {
            const response = await axios.get(`/api/users/${profileUser._id}/${type}`);
            setFollowList(response.data);
        } catch (err) {
            console.error(`Failed to fetch ${type}:`, err);
        } finally {
            setLoadingFollow(false);
        }
    };

    const openFollowModal = (type) => {
        setShowFollowModal(type);
        setFollowList([]);
        setSearchFollowTerm('');
        fetchFollowList(type);
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

    const formatCount = (count) => {
        if (!count) return '0';
        if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
        if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
        return count.toString();
    };

    const filteredFollowList = followList.filter(user =>
        user && (
            user.username?.toLowerCase().includes(searchFollowTerm.toLowerCase()) ||
            (user.profile?.displayName && user.profile.displayName.toLowerCase().includes(searchFollowTerm.toLowerCase()))
        )
    );

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
        <div className="app-wrapper">
            <Navbar />
            <main className="app-content profile-page-content">
                <div className="profile-card-container">

                    {/* The PROFILE CARD */}
                    <div className="profile-card">

                        {/* Cover */}
                        <div className="card-cover-section">
                            {profileUser?.profile?.coverImage ? (
                                <img
                                    src={getImageUrl(profileUser.profile.coverImage)}
                                    alt="Cover"
                                    className="card-cover-image"
                                />
                            ) : (
                                <div className="card-cover-placeholder"></div>
                            )}
                        </div>

                        {/* Avatar & Actions */}
                        <div className="card-header-row">
                            <div className="card-avatar-wrapper">
                                {profileUser?.profile?.avatar ? (
                                    <img
                                        src={getImageUrl(profileUser.profile.avatar)}
                                        alt={profileUser.username}
                                        className="card-avatar"
                                    />
                                ) : (
                                    <div className="card-avatar-placeholder">
                                        {profileUser.username[0].toUpperCase()}
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                {isOwnProfile ? (
                                    <button className="card-edit-btn" onClick={() => setEditing(true)}>
                                        Düzenle
                                    </button>
                                ) : (
                                    <div className="card-interact-btns">
                                        <button className="card-icon-btn" onClick={handleMessageClick} title="Mesaj Gönder">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                                <polyline points="22,6 12,13 2,6"></polyline>
                                            </svg>
                                        </button>
                                        <FollowButton
                                            userId={profileUser._id}
                                            initialIsFollowing={profileUser.isFollowing}
                                            initialHasRequested={profileUser.hasRequested}
                                            onFollowChange={(isFollowing) => {
                                                setProfileUser(prev => {
                                                    const countDiff = isFollowing === prev.isFollowing ? 0 : (isFollowing ? 1 : -1);
                                                    return { ...prev, isFollowing, followerCount: prev.followerCount + countDiff };
                                                });
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Section */}
                        <div className="card-info-section">
                            <div className="card-names">
                                <h1 className="card-display-name">
                                    {profileUser?.profile?.displayName || profileUser?.username}
                                    <Badge type={profileUser?.verificationBadge} />
                                </h1>
                                <span className="card-username">@{profileUser?.username}</span>
                            </div>

                            {profileUser?.profile?.bio && (
                                <div className="card-bio">
                                    {profileUser.profile.bio}
                                </div>
                            )}

                            <div className="card-meta">
                                <span className="card-joined">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    {profileUser?.createdAt ? new Date(profileUser.createdAt).toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }) : 'Ocak 2021'} tarihinde katıldı
                                </span>
                            </div>

                            <div className="card-stats">
                                <button
                                    className="card-stat-item"
                                    onClick={() => !isLocked && openFollowModal('following')}
                                    style={{ cursor: isLocked ? 'default' : 'pointer' }}
                                    disabled={isLocked}
                                >
                                    <span className="stat-val">{isLocked ? '🔒' : formatCount(profileUser?.followingCount || 0)}</span>
                                    <span className="stat-label">Takip Edilen</span>
                                </button>
                                <div className="stat-divider"></div>
                                <button
                                    className="card-stat-item"
                                    onClick={() => !isLocked && openFollowModal('followers')}
                                    style={{ cursor: isLocked ? 'default' : 'pointer' }}
                                    disabled={isLocked}
                                >
                                    <span className="stat-val">{isLocked ? '🔒' : formatCount(profileUser?.followerCount)}</span>
                                    <span className="stat-label">Takipçi</span>
                                </button>
                                <div className="stat-divider"></div>
                                <div className="card-stat-item">
                                    <span className="stat-val">{formatCount(profileUser?.postCount)}</span>
                                    <span className="stat-label">Gönderi</span>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                {/* MODALS */}
                {/* Follow Modal */}
                {showFollowModal && (
                    <div className="edit-modal-overlay" onClick={() => setShowFollowModal(null)}>
                        <div className="edit-modal follow-modal-modern" onClick={e => e.stopPropagation()}>
                            <div className="follow-modal-header">
                                <h3 className="follow-modal-title">{showFollowModal === 'followers' ? 'Takipçiler' : 'Takip Edilenler'}</h3>
                                <button className="close-modal-btn" onClick={() => setShowFollowModal(null)}>✕</button>
                            </div>

                            <div className="follow-search-container">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                </svg>
                                <input
                                    type="text"
                                    placeholder="Kullanıcı ara..."
                                    value={searchFollowTerm}
                                    onChange={(e) => setSearchFollowTerm(e.target.value)}
                                    className="follow-search-input"
                                />
                            </div>

                            <div className="follow-list-content">
                                {loadingFollow ? (
                                    <div className="spinner-container text-center">
                                        <div className="spinner"></div>
                                    </div>
                                ) : filteredFollowList.length > 0 ? (
                                    <div className="follow-list-modern">
                                        {filteredFollowList.map(user => (
                                            <Link
                                                to={`/profile/${user.username}`}
                                                key={user._id}
                                                className="follow-item-modern"
                                                onClick={() => setShowFollowModal(null)}
                                            >
                                                <div className="follow-avatar-modern">
                                                    {user.profile?.avatar ? (
                                                        <img src={getImageUrl(user.profile.avatar)} alt={user.username} />
                                                    ) : (
                                                        <div className="follow-avatar-placeholder-modern">
                                                            {user.username[0].toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="follow-info-modern">
                                                    <div className="follow-names">
                                                        <span className="follow-display-name">
                                                            {user.profile?.displayName || user.username}
                                                            <Badge type={user.verificationBadge} size={16} />
                                                        </span>
                                                        <span className="follow-username-handle">@{user.username}</span>
                                                    </div>
                                                    {user.profile?.bio && (
                                                        <p className="follow-bio-snippet">{user.profile.bio.substring(0, 50)}{user.profile.bio.length > 50 && '...'}</p>
                                                    )}
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="empty-search-state">
                                        <p>Kullanıcı bulunamadı.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Profile Modal */}
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

                            <div className="edit-modal-content-modern">
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
