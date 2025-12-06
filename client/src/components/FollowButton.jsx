import { useState } from 'react';
import axios from 'axios';
import './FollowButton.css';

const FollowButton = ({ userId, initialFollowing, onFollowChange }) => {
    const [following, setFollowing] = useState(initialFollowing);
    const [loading, setLoading] = useState(false);

    const handleFollow = async () => {
        if (loading) return;

        setLoading(true);
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post(`/api/follow/${userId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setFollowing(response.data.following);

            if (onFollowChange) {
                onFollowChange(response.data.followerCount);
            }
        } catch (error) {
            console.error('Follow error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            className={`follow-button ${following ? 'following' : ''}`}
            onClick={handleFollow}
            disabled={loading}
        >
            {following ? 'Takip Ediliyor' : 'Takip Et'}
        </button>
    );
};

export default FollowButton;
