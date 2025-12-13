import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Settings.css';

const Settings = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();

    // Settings State
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        mentions: true,
        likes: false
    });
    const [privacy, setPrivacy] = useState({
        isPrivate: false
    });

    // UI State
    const [loading, setLoading] = useState(true);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // Forms State
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
        selectedCategory: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            // Since we don't have a dedicated GET /settings, we might need to rely on what's in 'user'
            // or fetch the user again. Let's fetch the user profile again to get fresh settings.
            const response = await axios.get('/api/users/me');
            if (response.data.settings) {
                setNotifications(prev => ({ ...prev, ...response.data.settings.notifications }));
                setPrivacy(prev => ({ ...prev, ...response.data.settings.privacy }));
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (setting, type = 'notifications') => {
        const newValue = type === 'notifications' ? !notifications[setting] : !privacy[setting];

        // Optimistic update
        if (type === 'notifications') {
            setNotifications(prev => ({ ...prev, [setting]: newValue }));
        } else {
            setPrivacy(prev => ({ ...prev, [setting]: newValue }));
        }

        try {
            const payload = type === 'notifications'
                ? { notifications: { [setting]: newValue } }
                : { privacy: { [setting]: newValue } };

            await axios.put('/api/users/settings', payload);
        } catch (error) {
            console.error('Failed to update settings:', error);
            // Revert on error
            if (type === 'notifications') {
                setNotifications(prev => ({ ...prev, [setting]: !newValue }));
            } else {
                setPrivacy(prev => ({ ...prev, [setting]: !newValue }));
            }
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError('Yeni şifreler eşleşmiyor.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError('Şifre en az 6 karakter olmalıdır.');
            return;
        }

        try {
            await axios.put('/api/users/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });
            setPasswordSuccess('Şifreniz başarıyla güncellendi.');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
            setTimeout(() => setShowPasswordModal(false), 2000);
        } catch (error) {
            setPasswordError(error.response?.data?.message || 'Şifre değiştirilemedi.');
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await axios.delete('/api/users/me');
            logout();
            navigate('/register');
        } catch (error) {
            console.error('Delete account error:', error);
            const msg = error.response?.data?.message || error.message || 'Hesap silinirken bir hata oluştu.';
            alert(`Hata: ${msg} (${error.response?.status})`);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="app-wrapper">
            <Navbar />
            <main className="app-content">
                <div className="settings-container">
                    <h1 className="settings-title">Ayarlar</h1>

                    {/* Notifications Section */}
                    <div className="settings-section">
                        <h2 className="section-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                            </svg>
                            Bildirimler
                        </h2>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>E-posta Bildirimleri</h3>
                                <p>Hesap etkinlikleri hakkında e-posta al</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.email}
                                    onChange={() => handleToggle('email')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Anlık Bildirimler</h3>
                                <p>Cihazına anlık bildirimler al</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.push}
                                    onChange={() => handleToggle('push')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Account Section */}
                    <div className="settings-section">
                        <h2 className="section-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                <circle cx="12" cy="7" r="4" />
                            </svg>
                            Hesap
                        </h2>

                        <div className="setting-item clickable" onClick={() => setShowPasswordModal(true)}>
                            <div className="setting-info">
                                <h3>Şifre Değiştir</h3>
                                <p>Hesabını güvende tutmak için şifreni güncelle</p>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="chevron-icon">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Gizli Hesap</h3>
                                <p>Hesabını sadece takipçilerin görebilsin</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={privacy.isPrivate}
                                    onChange={() => handleToggle('isPrivate', 'privacy')}
                                />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </div>

                    {/* Verification Section */}
                    <div className="settings-section">
                        <h2 className="section-header">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                            Doğrulanmış Hesap
                        </h2>

                        <div className="setting-item verification-container">
                            {user?.verificationRequest?.status === 'pending' ? (
                                <div className="verification-status pending">
                                    <div className="status-icon">⏳</div>
                                    <div className="status-info">
                                        <h4>Başvurunuz İnceleniyor</h4>
                                        <p><strong>{user.verificationRequest.badgeType.toUpperCase()}</strong> rozeti için başvurunuz alındı.</p>
                                    </div>
                                </div>
                            ) : user?.verificationBadge !== 'none' && user?.verificationBadge !== 'staff' ? (
                                <div className="verification-status approved">
                                    <div className="status-icon">✅</div>
                                    <div className="status-info">
                                        <h4>Hesabınız Doğrulandı</h4>
                                        <p>Mavi tik rozetine sahipsiniz.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="verification-apply">
                                    <p className="verification-desc">
                                        Doğrulanmış hesap rozeti, topluluğumuzda güvenilirliği temsil eder.
                                        Hesabınızın türünü en iyi anlatan kategoriyi seçerek başvurun.
                                    </p>

                                    <div className="category-selection-grid">
                                        <div
                                            className={`category-card ${passwordForm.selectedCategory === 'creator' ? 'selected' : ''}`}
                                            onClick={() => setPasswordForm(prev => ({ ...prev, selectedCategory: 'creator' }))}
                                        >
                                            <div className="cat-icon blue-glow">⭐</div>
                                            <div className="cat-info">
                                                <h4>Tanınmış Kişi / Üretici</h4>
                                                <p>Sanatçı, Fenomen, Gazeteci veya İçerik Üreticileri için.</p>
                                                <span className="badge-preview-tag blue">Mavi Tik Alırsınız</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`category-card ${passwordForm.selectedCategory === 'business' ? 'selected' : ''}`}
                                            onClick={() => setPasswordForm(prev => ({ ...prev, selectedCategory: 'business' }))}
                                        >
                                            <div className="cat-icon gold-glow">🏢</div>
                                            <div className="cat-info">
                                                <h4>İşletme / Kurum</h4>
                                                <p>Şirketler, Resmi Kurumlar veya Kar Amacı Gütmeyen Kuruluşlar.</p>
                                                <span className="badge-preview-tag gold">Altın Tik Alırsınız</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`category-card ${passwordForm.selectedCategory === 'government' ? 'selected' : ''}`}
                                            onClick={() => setPasswordForm(prev => ({ ...prev, selectedCategory: 'government' }))}
                                        >
                                            <div className="cat-icon platinum-glow">🏛️</div>
                                            <div className="cat-info">
                                                <h4>Devlet Yetkilisi</h4>
                                                <p>Hükümet Yetkilileri, Büyükelçiler veya Resmi Temsilciler.</p>
                                                <span className="badge-preview-tag platinum">Platin Tik Alırsınız</span>
                                            </div>
                                        </div>

                                        <div
                                            className={`category-card ${passwordForm.selectedCategory === 'partner' ? 'selected' : ''}`}
                                            onClick={() => setPasswordForm(prev => ({ ...prev, selectedCategory: 'partner' }))}
                                        >
                                            <div className="cat-icon special-glow">🤝</div>
                                            <div className="cat-info">
                                                <h4>Platform Ortağı</h4>
                                                <p>Geliştiriciler veya DeepAce ile işbirliği yapan özel partnerler.</p>
                                                <span className="badge-preview-tag special">Özel Tik Alırsınız</span>
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        className="apply-btn"
                                        disabled={!passwordForm.selectedCategory}
                                        onClick={async () => {
                                            if (!passwordForm.selectedCategory) return;
                                            try {
                                                await axios.post('/api/users/request-verification', { category: passwordForm.selectedCategory });
                                                // Refresh page or user to show pending
                                                window.location.reload();
                                            } catch (err) {
                                                alert(err.response?.data?.message || 'Hata oluştu');
                                            }
                                        }}
                                    >
                                        {passwordForm.selectedCategory ? 'Başvuruyu Gönder' : 'Bir Kategori Seçin'}
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="settings-section danger-section">
                        <h2 className="section-header danger">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                                <line x1="12" y1="9" x2="12" y2="13" />
                                <line x1="12" y1="17" x2="12.01" y2="17" />
                            </svg>
                            Tehlikeli Alan
                        </h2>

                        <button className="logout-btn" onClick={handleLogout}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Çıkış Yap
                        </button>

                        <button className="delete-btn" onClick={() => setShowDeleteModal(true)}>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Hesabı Sil
                        </button>
                    </div>

                    {/* Password Modal */}
                    {showPasswordModal && (
                        <div className="modal-overlay" onClick={() => setShowPasswordModal(false)}>
                            <div className="modal-content" onClick={e => e.stopPropagation()}>
                                <h2>Şifre Değiştir</h2>
                                <form onSubmit={handlePasswordChange}>
                                    <input
                                        type="password"
                                        placeholder="Mevcut Şifre"
                                        value={passwordForm.currentPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                        required
                                        className="modal-input"
                                    />
                                    <input
                                        type="password"
                                        placeholder="Yeni Şifre"
                                        value={passwordForm.newPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        required
                                        className="modal-input"
                                        minLength={6}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Yeni Şifre (Tekrar)"
                                        value={passwordForm.confirmPassword}
                                        onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        required
                                        className="modal-input"
                                    />
                                    {passwordError && <p className="error-msg">{passwordError}</p>}
                                    {passwordSuccess && <p className="success-msg">{passwordSuccess}</p>}
                                    <div className="modal-actions">
                                        <button type="button" onClick={() => setShowPasswordModal(false)} className="cancel-btn">İptal</button>
                                        <button type="submit" className="confirm-btn">Güncelle</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}

                    {/* Delete Confirm Modal */}
                    {showDeleteModal && (
                        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                            <div className="modal-content danger" onClick={e => e.stopPropagation()}>
                                <h2>Hesabı Sil?</h2>
                                <p>Bu işlem geri alınamaz. Tüm verileriniz kalıcı olarak silinecektir.</p>
                                <div className="modal-actions">
                                    <button onClick={() => setShowDeleteModal(false)} className="cancel-btn">İptal</button>
                                    <button onClick={handleDeleteAccount} className="delete-confirm-btn">Evet, Sil</button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Settings;
