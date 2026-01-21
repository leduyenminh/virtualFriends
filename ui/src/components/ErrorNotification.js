import React, { useState, useEffect } from 'react';
import { errorNotificationManager } from '../services/ErrorHandling';
import './ErrorNotification.css';

/**
 * Error Notification Component
 * Displays error messages with retry and dismiss options
 */
const ErrorNotification = ({ onRetry }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    // Subscribe to notification updates
    const unsubscribe = errorNotificationManager.subscribe((newNotifications) => {
      setNotifications(newNotifications);
    });

    return unsubscribe;
  }, []);

  if (notifications.length === 0) {
    return null;
  }

  const handleDismiss = (id) => {
    errorNotificationManager.removeNotification(id);
  };

  const handleRetry = (notification) => {
    handleDismiss(notification.id);
    if (onRetry) {
      onRetry();
    }
  };

  return (
    <div className="error-notification-container">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`error-notification error-${notification.type}`}
          role="alert"
        >
          <div className="notification-header">
            <span className="notification-icon">
              {notification.type === 'error' && '❌'}
              {notification.type === 'warning' && '⚠️'}
              {notification.type === 'success' && '✅'}
              {notification.type === 'info' && 'ℹ️'}
            </span>
            <span className="notification-title">{notification.title}</span>
            <button
              className="notification-close"
              onClick={() => handleDismiss(notification.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>

          <div className="notification-message">
            {notification.message}
          </div>

          {notification.details && (
            <div className="notification-details">
              {notification.details}
            </div>
          )}

          {notification.suggestion && (
            <div className="notification-suggestion">
              💡 {notification.suggestion}
            </div>
          )}

          <div className="notification-actions">
            {notification.retryable && (
              <button
                className="action-button retry-button"
                onClick={() => handleRetry(notification)}
              >
                🔄 Retry
              </button>
            )}
            <button
              className="action-button dismiss-button"
              onClick={() => handleDismiss(notification.id)}
            >
              Dismiss
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ErrorNotification;
