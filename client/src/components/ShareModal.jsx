import { useState, useEffect } from 'react';
import axios from 'axios';
import { getImageUrl } from '../utils/imageUtils';
import Badge from './Badge';
import './ShareModal.css';

const ShareModal = ({ postId, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);

    useEffect(() => {
        // Initial load of potential contacts (e.g., following or recent conversations)
        // For now, let's just search immediately if query is empty?? 
        // Or wait for input. Let's wait for input like search, or fetch recent conversations.
    }, []);

    const handleSearch = async (searchQuery) => {
        if (!searchQuery.trim()) {
            setResults([]);
            return;
        }

        setLoading(true);
        try {
            const response = await axios.get(`/api/users/search?q=${searchQuery}`);
            setResults(response.data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        setQuery(value);
        const timeoutId = setTimeout(() => handleSearch(value), 300);
        return () => clearTimeout(timeoutId);
    };

    const handleSend = async (userId) => {
        setSending(true);
        try {
            await axios.post('/api/messages', {
                recipientId: userId,
                postId: postId
            });
            alert('Gönderildi!');
            onClose();
        } catch (error) {
            console.error('Share failed:', error);
            alert('Gönderilemedi.');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="share-modal-overlay" onClick={onClose}>
            <div className="share-modal" onClick={(e) => e.stopPropagation()}>
                <div className="share-header">
                    <h3>Paylaş</h3>
                    <button onClick={onClose} className="close-btn">×</button>
                </div>

                <div className="share-search">
                    <input
                        type="text"
                        placeholder="Kime..."
                        value={query}
                        onChange={handleInputChange}
                        autoFocus
                    />
                </div>

                <div className="share-results">
                    {loading ? (
                        <div className="spinner-small"></div>
                    ) : results.length === 0 && query ? (
                        <p className="no-results">Kullanıcı bulunamadı</p>
                    ) : (
                        results.map(user => (
                            <div key={user._id} className="share-user-item">
                                <div className="user-info">
                                    <img
                                        src={getImageUrl(user.profile?.avatar)}
                                        alt={user.username}
                                        className="user-avatar"
                                    />
                                    <div className="user-text">
                                        <span className="user-name">
                                            {user.profile?.displayName || user.username}
                                            <Badge type={user.verificationBadge} />
                                        </span>
                                        <span className="user-username">@{user.username}</span>
                                    </div>
                                </div>
                                <button
                                    className="send-share-btn"
                                    onClick={() => handleSend(user._id)}
                                    disabled={sending}
                                >
                                    {sending ? '...' : 'Gönder'}
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;
