import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { getImageUrl } from '../utils/imageUtils';
import Badge from '../components/Badge';
import './Search.css';

const Search = () => {
    const [query, setQuery] = useState('');
    const [userResults, setUserResults] = useState([]);
    const [portalResults, setPortalResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [activeTab, setActiveTab] = useState('portals'); // 'portals' or 'users'
    const navigate = useNavigate();

    // Initial load: fetch popular portals
    useEffect(() => {
        if (!query) {
            fetchPortals();
        }
    }, [query]);

    const fetchPortals = async (keyword = '') => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/portals?keyword=${keyword}`);
            setPortalResults(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setSearched(false);
            setUserResults([]);
            fetchPortals(); // reset to popular
            return;
        }

        setLoading(true);
        setSearched(true);

        try {
            // Parallel search
            const [usersRes, portalsRes] = await Promise.all([
                axios.get(`/api/users/search?q=${searchQuery}`),
                axios.get(`/api/portals?keyword=${searchQuery}`)
            ]);

            setUserResults(usersRes.data);
            setPortalResults(portalsRes.data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        // Debounced search
        const timeoutId = setTimeout(() => handleSearch(value), 300);
        return () => clearTimeout(timeoutId);
    };

    return (
        <div className="app-wrapper">
            <Navbar />
            <main className="app-content">
                <div className="search-container">
                    {/* Search Header */}
                    <div className="search-header">
                        <div className="search-input-wrapper">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8" />
                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Portal veya kişi ara..."
                                value={query}
                                onChange={handleInputChange}
                            />
                            {query && (
                                <button
                                    className="clear-btn"
                                    onClick={() => {
                                        setQuery('');
                                        setSearched(false);
                                        fetchPortals();
                                    }}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18" />
                                        <line x1="6" y1="6" x2="18" y2="18" />
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="search-tabs">
                        <button
                            className={`tab-btn ${activeTab === 'portals' ? 'active' : ''}`}
                            onClick={() => setActiveTab('portals')}
                        >
                            Portallar
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
                            onClick={() => setActiveTab('users')}
                        >
                            Kişiler
                        </button>
                    </div>

                    {/* Loading */}
                    {loading && (
                        <div className="spinner-container">
                            <div className="spinner"></div>
                        </div>
                    )}

                    {/* Content */}
                    {!loading && (
                        <div className="search-content">
                            {/* PORTALS TAB */}
                            {activeTab === 'portals' && (
                                <div className="portals-grid">
                                    {portalResults.length === 0 ? (
                                        <div className="empty-search"><p>Portal bulunamadı.</p></div>
                                    ) : (
                                        portalResults.map(portal => (
                                            <div
                                                key={portal._id}
                                                className="portal-card-grid"
                                                onClick={() => navigate(`/portal/${portal._id}`)}
                                            >
                                                <div className="portal-grid-header">
                                                    {portal.avatar ? (
                                                        <img src={getImageUrl(portal.avatar)} alt={portal.name} />
                                                    ) : (
                                                        <div className="portal-grid-placeholder">
                                                            {portal.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="portal-grid-body">
                                                    <h3>{portal.name}</h3>
                                                    <p>{portal.description && portal.description.substring(0, 60)}...</p>
                                                    <span className="portal-members-count">
                                                        {portal.members?.length || 0} Üye
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* USERS TAB */}
                            {activeTab === 'users' && (
                                <div className="users-list">
                                    {userResults.length === 0 ? (
                                        <div className="empty-search"><p>Kullanıcı bulunamadı.</p></div>
                                    ) : (
                                        userResults.map((user) => (
                                            <Link
                                                key={user._id}
                                                to={`/profile/${user.username}`}
                                                className="user-result"
                                            >
                                                {user.profile?.avatar ? (
                                                    <img
                                                        src={getImageUrl(user.profile.avatar)}
                                                        alt={user.username}
                                                        className="result-avatar"
                                                    />
                                                ) : (
                                                    <div className="result-avatar-placeholder">
                                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                                            <circle cx="12" cy="7" r="4" />
                                                        </svg>
                                                    </div>
                                                )}
                                                <div className="result-info">
                                                    <span className="result-name">
                                                        {user.profile?.displayName || user.username}
                                                        <Badge type={user.verificationBadge} />
                                                    </span>
                                                    <span className="result-username">@{user.username}</span>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Search;
