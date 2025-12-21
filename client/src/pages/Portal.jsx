import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import PostCard from '../components/PostCard'; // Reuse existing
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { getImageUrl } from '../utils/imageUtils';
import './Portal.css'; // Make sure styling matches PostCard expectation

const Portal = () => {
    const { id } = useParams();
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();

    const [portal, setPortal] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchPortalData();
    }, [id]);

    // Check membership whenever portal or user changes
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
            // Parallel fetch
            const [portalRes, postsRes] = await Promise.all([
                axios.get(`/api/portals/${id}`),
                axios.get(`/api/portals/${id}/posts`)
            ]);

            setPortal(portalRes.data);
            setPosts(postsRes.data);
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
            // Optimization: Update user context joinedPortals locally
            // But we might need the full portal object. 
            // For now, let's just trigger a re-fetch or assume sidebar updates on next navigation/refresh 
            // OR simpler:
            const updatedUser = {
                ...user,
                joinedPortals: [...(user.joinedPortals || []), portal]
            };
            updateUser(updatedUser);
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
            navigate('/'); // Redirect home after leave
        } catch (err) {
            console.error('Leave failed', err);
            alert(err.response?.data?.message || 'Ayrılma başarısız');
        }
    };

    if (loading) return (
        <div className="app-wrapper">
            <Navbar />
            <div className="spinner-container"><div className="spinner"></div></div>
        </div>
    );

    if (error || !portal) return (
        <div className="app-wrapper">
            <Navbar />
            <div className="error-message">{error || 'Portal bulunamadı'}</div>
        </div>
    );

    return (
        <div className="app-wrapper">
            <Navbar />
            <main className="app-content">

                {/* Portal Header */}
                <div className="portal-header">
                    <div className="portal-avatar-large">
                        {portal.avatar ? (
                            <img src={getImageUrl(portal.avatar)} alt={portal.name} />
                        ) : (
                            <span>{portal.name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div className="portal-info">
                        <h1>{portal.name}</h1>
                        <p className="portal-description">{portal.description}</p>
                        <div className="portal-meta">
                            <span>{portal.members?.length || 0} Üye</span>
                            <span>•</span>
                            <span>{portal.privacy === 'public' ? 'Herkese Açık' : 'Gizli'}</span>
                        </div>
                    </div>
                    <div className="portal-actions">
                        {isMember ? (
                            <button className="join-btn outline" onClick={handleLeave}>Ayrıl</button>
                        ) : (
                            <button className="join-btn primary" onClick={handleJoin}>Katıl</button>
                        )}
                    </div>
                </div>

                {/* Feed */}
                <div className="portal-feed-container">
                    {/* Only show create post if member */}
                    {isMember && (
                        <div className="create-post-trigger" onClick={() => navigate('/create', { state: { portalId: id } })}>
                            {/* Create Post shortcut - reusing existing UI pattern or just navigating */}
                            {/* Since user wants Discord-like, usually we have an input area here.
                                 For now, I'll let standard "Create Post" page handle it, 
                                 but I should pass the portal ID so it posts to THIS portal.
                             */}
                        </div>
                    )}

                    {posts.length === 0 ? (
                        <div className="empty-portal">
                            <div className="empty-portal-icon">📝</div>
                            <h3>Henüz gönderi yok</h3>
                            <p>Bu portalda ilk paylaşımı sen yap!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <PostCard key={post._id} post={post} />
                        ))
                    )}
                </div>

                <Footer />
            </main>
        </div>
    );
};

export default Portal;
