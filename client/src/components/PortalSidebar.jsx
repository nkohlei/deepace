import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUI } from '../context/UIContext';
import CreatePortalModal from './CreatePortalModal';
import { getImageUrl } from '../utils/imageUtils';
import './PortalSidebar.css';

const PortalSidebar = () => {
    const { user, isAuthenticated } = useAuth();
    const { closeSidebar } = useUI();
    const navigate = useNavigate();
    const location = useLocation();
    const [showCreateModal, setShowCreateModal] = useState(false);

    // If not authenticated, don't show sidebar (or show limited version)
    if (!isAuthenticated) return null;

    const isActive = (path) => {
        return location.pathname === path;
    };

    const isPortalActive = (portalId) => {
        return location.pathname === `/portal/${portalId}`;
    };

    const handleNavigation = (path) => {
        navigate(path);
        closeSidebar();
    };

    return (
        <>
            <div className="portal-sidebar">
                {/* Close/Back Button at top */}
                {/* Close/Back Button Removed - Integrated into Toggle Arrow */}

                {/* Global Home / Dashboard */}
                <div
                    className={`sidebar-item ${isActive('/') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/')}
                    data-tooltip="Ana Sayfa"
                >
                    <div className="portal-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                            <polyline points="9 22 9 12 15 12 15 22"></polyline>
                        </svg>
                    </div>
                </div>

                <div className="sidebar-separator"></div>

                {/* User's Portals */}
                {/* User's Portals */}
                {user?.joinedPortals && user.joinedPortals.map((portal) => (
                    <div
                        key={portal._id}
                        className={`sidebar-item ${isPortalActive(portal._id) ? 'active' : ''}`}
                        onClick={() => handleNavigation(`/portal/${portal._id}`)}
                    // Removed data-tooltip to use custom hover card
                    >
                        <div className="portal-icon">
                            {portal.avatar ? (
                                <img src={getImageUrl(portal.avatar)} alt={portal.name} />
                            ) : (
                                <span>{portal.name.substring(0, 2).toUpperCase()}</span>
                            )}
                        </div>

                        {/* Hover Tooltip (Portal Profile) */}
                        <div className="portal-hover-card">
                            <div className="hover-card-header">
                                {portal.avatar ? (
                                    <img src={getImageUrl(portal.avatar)} alt={portal.name} className="hover-avatar" />
                                ) : (
                                    <div className="hover-avatar-placeholder">{portal.name.substring(0, 2).toUpperCase()}</div>
                                )}
                                <h4 className="hover-portal-name">{portal.name}</h4>
                            </div>
                            <div className="hover-portal-meta">
                                <span>{portal.memberCount || 1} Üye</span>
                            </div>
                        </div>
                    </div>
                ))}

                <style>{`
                .portal-hover-card {
                    position: absolute;
                    left: 72px; /* Right of sidebar */
                    top: 0;
                    background-color: #111214;
                    border: 1px solid #1e1f22;
                    border-radius: 8px;
                    padding: 12px;
                    min-width: 180px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.5);
                    opacity: 0;
                    visibility: hidden;
                    transition: all 0.2s ease;
                    z-index: 1000;
                    pointer-events: none;
                    text-align: left;
                }

                .sidebar-item:hover .portal-hover-card {
                    opacity: 1;
                    visibility: visible;
                    top: -10px; /* Slight alignment adjustment */
                }

                .hover-card-header {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    margin-bottom: 8px;
                }

                .hover-avatar, .hover-avatar-placeholder {
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    object-fit: cover;
                }

                .hover-avatar-placeholder {
                    background: #5865F2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 12px;
                    color: white;
                    font-weight: bold;
                }

                .hover-portal-name {
                    font-size: 14px;
                    font-weight: 700;
                    color: white;
                    margin: 0;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .hover-portal-meta {
                    font-size: 12px;
                    color: #b9bbbe;
                }
            `}</style>

                <div className="sidebar-separator"></div>

                {/* Search / Discover */}
                <div
                    className={`sidebar-item ${isActive('/search') ? 'active' : ''}`}
                    onClick={() => handleNavigation('/search')}
                    data-tooltip="Keşfet"
                >
                    <div className="portal-icon">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                </div>

                {/* Create Portal Button */}
                <div
                    className="sidebar-item"
                    onClick={() => {
                        setShowCreateModal(true);
                        // Do not close sidebar as per request
                    }}
                    data-tooltip="Portal Oluştur"
                >
                    <div className="portal-icon create-portal-btn">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </div>
                </div>
            </div>

            {/* Create Portal Modal */}
            {showCreateModal && (
                <CreatePortalModal onClose={() => setShowCreateModal(false)} />
            )}
        </>
    );
};

export default PortalSidebar;
