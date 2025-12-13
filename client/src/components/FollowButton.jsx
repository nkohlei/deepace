import { useState, useEffect } from 'react';
import axios from 'axios';
import './FollowButton.css';

const FollowButton = ({ userId, initialIsFollowing, initialHasRequested, onFollowChange }) => {
    const [following, setFollowing] = useState(initialIsFollowing);
    const [requested, setRequested] = useState(initialHasRequested);
    const [loading, setLoading] = useState(false);

    const [hover, setHover] = useState(false);

    useEffect(() => {
        setFollowing(initialIsFollowing);
        setRequested(initialHasRequested);
    }, [initialIsFollowing, initialHasRequested]);

    const handleFollow = async () => {
        if (loading) return;

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(`/api/users/follow/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFollowing(response.data.isFollowing);
            setRequested(response.data.hasRequested);

            if (onFollowChange) {
                onFollowChange(response.data.isFollowing);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getButtonText = () => {
        if (following) return hover ? 'Takibi Bırak' : 'Takip Ediliyor';
        if (requested) return hover ? 'İsteği İptal Et' : 'İstek Gönderildi';
        return 'Takip Et';
    };

    return (
        <button
            className={`follow-button ${following ? 'following' : ''} ${requested ? 'requested' : ''}`}
            onClick={handleFollow}
            disabled={loading}
            onMouseEnter={() => setHover(true)}
            onMouseLeave={() => setHover(false)}
        >
            {getButtonText()}
        </button>
    );
};

export default FollowButton;
