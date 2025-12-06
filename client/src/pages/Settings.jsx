import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import './Settings.css';

const Settings = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        mentions: true,
        likes: false
    });

    const handleToggle = (setting) => {
        setNotifications(prev => ({
            ...prev,
            [setting]: !prev[setting]
        }));
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

                        <div className="setting-item">
                            <div className="setting-info">
                                <h3>Bahsetmeler</h3>
                                <p>Biri senden bahsettiğinde bildir</p>
                            </div>
                            <label className="switch">
                                <input
                                    type="checkbox"
                                    checked={notifications.mentions}
                                    onChange={() => handleToggle('mentions')}
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

                        <div className="setting-item clickable">
                            <div className="setting-info">
                                <h3>Şifre Değiştir</h3>
                                <p>Hesabını güvende tutmak için şifreni güncelle</p>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="chevron-icon">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </div>

                        <div className="setting-item clickable">
                            <div className="setting-info">
                                <h3>Gizlilik</h3>
                                <p>Hesap gizlilik ayarlarını yönet</p>
                            </div>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="chevron-icon">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
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

                        <button className="delete-btn">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Hesabı Sil
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
