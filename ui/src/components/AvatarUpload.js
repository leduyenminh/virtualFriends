import React, { useState, useRef } from 'react';
import { ErrorHandler, errorNotificationManager } from '../services/ErrorHandling';
import './AvatarUpload.css';

const AvatarUpload = ({ onUploadSuccess, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: 'character',
    tags: '',
    modelFile: null,
    thumbnail: null
  });
  const [uploading, setUploading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const categories = [
    { value: 'character', label: 'Character' },
    { value: 'animal', label: 'Animal' },
    { value: 'fantasy', label: 'Fantasy' },
    { value: 'robot', label: 'Robot' },
    { value: 'other', label: 'Other' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fileType) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e, fileType) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      setFormData(prev => ({
        ...prev,
        [fileType]: file
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous field errors
    setFieldErrors({});

    // Validate inputs
    const inputErrors = ErrorHandler.validateInput(
      formData.name,
      formData.description,
      formData.category
    );

    if (inputErrors.length > 0) {
      const errorMap = {};
      inputErrors.forEach(err => {
        errorMap[err.field] = err.message;
        errorNotificationManager.addNotification(err);
      });
      setFieldErrors(errorMap);
      return;
    }

    // Validate model file
    const fileErrors = ErrorHandler.validateFile(formData.modelFile);
    if (fileErrors.length > 0) {
      fileErrors.forEach(err => {
        errorNotificationManager.addNotification(err, 'error');
      });
      return;
    }

    // Validate thumbnail if provided
    const thumbnailErrors = ErrorHandler.validateImage(formData.thumbnail);
    if (thumbnailErrors.length > 0) {
      thumbnailErrors.forEach(err => {
        errorNotificationManager.addNotification(err, 'error');
      });
      return;
    }

    setUploading(true);

    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('category', formData.category);
      submitData.append('modelFile', formData.modelFile);
      
      if (formData.thumbnail) {
        submitData.append('thumbnail', formData.thumbnail);
      }

      if (formData.tags.trim()) {
        submitData.append('tags', formData.tags);
      }

      // Get user token from localStorage or context
      const token = localStorage.getItem('authToken') || 'guest-user';

      const response = await fetch('/api/avatar/models', {
        method: 'POST',
        headers: {
          'X-User': token
        },
        body: submitData
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = ErrorHandler.handleApiError(
          { response: { status: response.status, data: errorData } }
        );
        throw error;
      }

      const newAvatar = await response.json();

      errorNotificationManager.addNotification(
        {
          title: 'Upload Successful',
          message: `Avatar "${formData.name}" has been created successfully!`,
          suggestion: 'Your avatar is now available in the gallery',
          retryable: false
        },
        'success'
      );

      if (onUploadSuccess) {
        onUploadSuccess(newAvatar);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'character',
        tags: '',
        modelFile: null,
        thumbnail: null
      });

      // Close modal after short delay
      setTimeout(() => onClose && onClose(), 1500);

    } catch (err) {
      const error = err.title ? err : ErrorHandler.handleApiError(err);
      errorNotificationManager.addNotification(error, 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="avatar-upload-modal">
      <div className="avatar-upload-overlay" onClick={onClose}></div>
      <div className="avatar-upload-content">
        <div className="avatar-upload-header">
          <h2>Upload Live2D Avatar</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="avatar-upload-form">
          <div className="form-group">
            <label htmlFor="name">Avatar Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Enter avatar name"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe your avatar"
              rows="3"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tags">Tags (comma-separated)</label>
            <input
              type="text"
              id="tags"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              placeholder="cute, anime, character"
            />
          </div>

          <div className="form-group">
            <label>Live2D Model File (ZIP) *</label>
            <div
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'modelFile')}
            >
              <input
                type="file"
                id="modelFile"
                accept=".zip"
                onChange={(e) => handleFileChange(e, 'modelFile')}
                style={{ display: 'none' }}
              />
              <label htmlFor="modelFile" className="file-input-label">
                {formData.modelFile ? (
                  <div className="file-info">
                    <span className="file-icon">📦</span>
                    <span className="file-name">{formData.modelFile.name}</span>
                    <span className="file-size">({(formData.modelFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="file-icon">📁</span>
                    <span>Drop ZIP file here or click to browse</span>
                    <small>Contains Live2D model files (.moc3, textures, etc.)</small>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Thumbnail Image *</label>
            <div
              className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, 'thumbnail')}
            >
              <input
                type="file"
                id="thumbnail"
                accept="image/*"
                onChange={(e) => handleFileChange(e, 'thumbnail')}
                style={{ display: 'none' }}
              />
              <label htmlFor="thumbnail" className="file-input-label">
                {formData.thumbnail ? (
                  <div className="file-info">
                    <span className="file-icon">🖼️</span>
                    <span className="file-name">{formData.thumbnail.name}</span>
                    <img
                      src={URL.createObjectURL(formData.thumbnail)}
                      alt="Thumbnail preview"
                      className="thumbnail-preview"
                    />
                  </div>
                ) : (
                  <div className="file-placeholder">
                    <span className="file-icon">📷</span>
                    <span>Drop image here or click to browse</span>
                    <small>JPG, PNG, or GIF (recommended: 256x256)</small>
                  </div>
                )}
              </label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="cancel-button">
              Cancel
            </button>
            <button type="submit" disabled={uploading} className="upload-button">
              {uploading ? 'Uploading...' : 'Upload Avatar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AvatarUpload;