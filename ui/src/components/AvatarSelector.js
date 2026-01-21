import React, { useState, useEffect } from 'react';
import Live2DAvatar from './Live2DAvatar';
import AvatarUpload from './AvatarUpload';
import './AvatarSelector.css';

const AvatarSelector = ({ selectedAvatar, onAvatarSelect }) => {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [showUploadModal, setShowUploadModal] = useState(false);

  useEffect(() => {
    fetchAvatars();
  }, []);

  const fetchAvatars = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/avatar/models');
      if (!response.ok) {
        throw new Error('Failed to fetch avatars');
      }
      const avatarList = await response.json();
      setAvatars(avatarList);
      setError(null);

      // Auto-select first avatar if none selected
      if (!selectedAvatar && avatarList.length > 0) {
        onAvatarSelect(avatarList[0]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarClick = (avatarId) => {
    onAvatarSelect(avatarId);
  };

  const handleEmotionChange = (emotion) => {
    setCurrentEmotion(emotion);
  };

  const handleUploadSuccess = (newAvatar) => {
    setAvatars(prev => [...prev, newAvatar]);
    setShowUploadModal(false);
    // Auto-select the newly uploaded avatar
    onAvatarSelect(newAvatar.id);
  };

  if (loading) {
    return <div className="avatar-selector-loading">Loading avatars...</div>;
  }

  if (error) {
    return (
      <div className="avatar-selector-error">
        <p>Error loading avatars: {error}</p>
        <button onClick={fetchAvatars}>Retry</button>
      </div>
    );
  }

  return (
    <div className="avatar-selector">
      <div className="avatar-gallery">
        <div className="gallery-header">
          <h3>Choose Your Avatar</h3>
          <button
            className="upload-avatar-button"
            onClick={() => setShowUploadModal(true)}
          >
            + Upload New Avatar
          </button>
        </div>
        <div className="avatar-grid">
          {avatars.map((avatar) => (
            <div
              key={avatar.id}
              className={`avatar-card ${selectedAvatar && selectedAvatar.id === avatar.id ? 'selected' : ''}`}
              onClick={() => handleAvatarClick(avatar.id)}
            >
              <img
                src={avatar.thumbnailPath}
                alt={avatar.name}
                onError={(e) => {
                  e.target.src = '/default-avatar.png'; // Fallback image
                }}
              />
              <div className="avatar-info">
                <h4>{avatar.name}</h4>
                <p>{avatar.description}</p>
                <span className="avatar-category">{avatar.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="avatar-preview">
        <h3>Preview</h3>
        {selectedAvatar ? (
          <div>
            <Live2DAvatar
              avatar={selectedAvatar}
              emotion={currentEmotion}
              onAvatarLoad={(model) => {
                console.log('Avatar loaded:', model);
              }}
            />
            <div className="emotion-controls">
              <h4>Emotions</h4>
              <div className="emotion-buttons">
                <button onClick={() => handleEmotionChange('neutral')}>😐 Neutral</button>
                <button onClick={() => handleEmotionChange('happy')}>😊 Happy</button>
                <button onClick={() => handleEmotionChange('sad')}>😢 Sad</button>
                <button onClick={() => handleEmotionChange('angry')}>😠 Angry</button>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-avatar-selected">
            <p>Select an avatar to preview</p>
          </div>
        )}
      </div>

      {showUploadModal && (
        <AvatarUpload
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowUploadModal(false)}
        />
      )}
    </div>
  );
};

export default AvatarSelector;