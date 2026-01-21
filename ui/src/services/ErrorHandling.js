/**
 * Advanced Error Handling Service
 * Provides user-friendly error messages with recovery suggestions
 */

export class ErrorHandler {
  static ERROR_MESSAGES = {
    // Network errors
    NETWORK_ERROR: {
      title: 'Connection Error',
      message: 'Unable to connect to the server. Please check your internet connection.',
      suggestion: 'Retry the operation or refresh the page',
      retryable: true
    },
    TIMEOUT: {
      title: 'Request Timeout',
      message: 'The server took too long to respond.',
      suggestion: 'Try again with a smaller file or better connection',
      retryable: true
    },
    
    // File upload errors
    FILE_TOO_LARGE: {
      title: 'File Too Large',
      message: 'The file exceeds the maximum size limit of 50MB.',
      suggestion: 'Compress or reduce the file size and try again',
      retryable: true
    },
    INVALID_FILE_TYPE: {
      title: 'Invalid File Type',
      message: 'Only ZIP files are supported for avatar models.',
      suggestion: 'Convert your file to ZIP format and retry',
      retryable: true
    },
    INVALID_ZIP_CONTENT: {
      title: 'Invalid Avatar Package',
      message: 'The ZIP file does not contain required Live2D model files.',
      suggestion: 'Ensure your ZIP contains .moc3 or model.json files',
      retryable: true
    },
    CORRUPTED_FILE: {
      title: 'Corrupted File',
      message: 'The file appears to be corrupted or incomplete.',
      suggestion: 'Re-download or recreate the file and try again',
      retryable: true
    },
    
    // Thumbnail errors
    INVALID_IMAGE: {
      title: 'Invalid Image',
      message: 'Thumbnail must be JPEG, PNG, or GIF format.',
      suggestion: 'Use an image in supported format (JPEG, PNG, GIF)',
      retryable: true
    },
    IMAGE_TOO_LARGE: {
      title: 'Image Too Large',
      message: 'Thumbnail image must be under 5MB.',
      suggestion: 'Compress the image and try again',
      retryable: true
    },
    
    // Validation errors
    VALIDATION_ERROR: {
      title: 'Validation Error',
      message: 'One or more fields have invalid values.',
      suggestion: 'Check all fields and ensure they meet requirements',
      retryable: true
    },
    MISSING_FIELD: {
      title: 'Missing Information',
      message: 'Please fill in all required fields.',
      suggestion: 'Complete all marked fields before submitting',
      retryable: false
    },
    NAME_TOO_SHORT: {
      title: 'Name Too Short',
      message: 'Avatar name must be at least 1 character.',
      suggestion: 'Provide a more descriptive name',
      retryable: false
    },
    NAME_TOO_LONG: {
      title: 'Name Too Long',
      message: 'Avatar name must not exceed 255 characters.',
      suggestion: 'Use a shorter name',
      retryable: false
    },
    DESCRIPTION_TOO_LONG: {
      title: 'Description Too Long',
      message: 'Description must not exceed 1000 characters.',
      suggestion: 'Shorten your description',
      retryable: false
    },
    
    // Server errors
    SERVER_ERROR: {
      title: 'Server Error',
      message: 'An unexpected error occurred on the server.',
      suggestion: 'Try again later or contact support',
      retryable: true
    },
    UNAUTHORIZED: {
      title: 'Authentication Required',
      message: 'You must be logged in to perform this action.',
      suggestion: 'Log in with your credentials',
      retryable: false
    },
    FORBIDDEN: {
      title: 'Access Denied',
      message: 'You do not have permission to perform this action.',
      suggestion: 'Contact an administrator if you believe this is a mistake',
      retryable: false
    },
    NOT_FOUND: {
      title: 'Not Found',
      message: 'The requested resource does not exist.',
      suggestion: 'Check the URL or return to the home page',
      retryable: false
    },
    
    // Default error
    UNKNOWN_ERROR: {
      title: 'Unknown Error',
      message: 'An unexpected error occurred. Please try again.',
      suggestion: 'Refresh the page or contact support if the problem persists',
      retryable: true
    }
  };

  /**
   * Parse HTTP error response and return user-friendly error object
   */
  static handleApiError(error, defaultCode = 'UNKNOWN_ERROR') {
    let errorCode = defaultCode;
    let details = '';

    // Handle different error types
    if (error.response) {
      // HTTP error from server
      const status = error.response.status;
      const data = error.response.data;

      if (status === 400) {
        // Determine specific 400 error
        if (data?.errorCode) {
          errorCode = data.errorCode;
        } else if (data?.message?.includes('too large')) {
          errorCode = 'FILE_TOO_LARGE';
        } else if (data?.message?.includes('ZIP')) {
          errorCode = 'INVALID_ZIP_CONTENT';
        } else {
          errorCode = 'VALIDATION_ERROR';
        }
        details = data?.message || '';
      } else if (status === 401) {
        errorCode = 'UNAUTHORIZED';
      } else if (status === 403) {
        errorCode = 'FORBIDDEN';
      } else if (status === 404) {
        errorCode = 'NOT_FOUND';
      } else if (status >= 500) {
        errorCode = 'SERVER_ERROR';
        details = data?.message || '';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorCode = 'TIMEOUT';
    } else if (!error.response) {
      errorCode = 'NETWORK_ERROR';
    }

    const baseError = this.ERROR_MESSAGES[errorCode] || this.ERROR_MESSAGES.UNKNOWN_ERROR;
    
    return {
      code: errorCode,
      ...baseError,
      details,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validate file before upload
   */
  static validateFile(file, maxSize = 50 * 1024 * 1024, allowedTypes = ['application/zip']) {
    const errors = [];

    if (!file) {
      errors.push(this.ERROR_MESSAGES.MISSING_FIELD);
      return errors;
    }

    if (file.size > maxSize) {
      errors.push(this.ERROR_MESSAGES.FILE_TOO_LARGE);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(this.ERROR_MESSAGES.INVALID_FILE_TYPE);
    }

    return errors;
  }

  /**
   * Validate image file
   */
  static validateImage(file, maxSize = 5 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif']) {
    const errors = [];

    if (!file) {
      return errors; // Images are optional
    }

    if (file.size > maxSize) {
      errors.push(this.ERROR_MESSAGES.IMAGE_TOO_LARGE);
    }

    if (!allowedTypes.includes(file.type)) {
      errors.push(this.ERROR_MESSAGES.INVALID_IMAGE);
    }

    return errors;
  }

  /**
   * Validate form input
   */
  static validateInput(name, description, category) {
    const errors = [];

    if (!name || name.trim().length === 0) {
      errors.push({
        field: 'name',
        ...this.ERROR_MESSAGES.MISSING_FIELD
      });
    } else if (name.length > 255) {
      errors.push({
        field: 'name',
        ...this.ERROR_MESSAGES.NAME_TOO_LONG
      });
    }

    if (description && description.length > 1000) {
      errors.push({
        field: 'description',
        ...this.ERROR_MESSAGES.DESCRIPTION_TOO_LONG
      });
    }

    if (!category || category.trim().length === 0) {
      errors.push({
        field: 'category',
        ...this.ERROR_MESSAGES.MISSING_FIELD
      });
    }

    return errors;
  }
}

/**
 * Error display component state management
 */
export class ErrorNotificationManager {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  /**
   * Add notification
   */
  addNotification(error, type = 'error', duration = 5000) {
    const notification = {
      id: Math.random().toString(36).substr(2, 9),
      type, // 'error', 'warning', 'success', 'info'
      title: error.title,
      message: error.message,
      suggestion: error.suggestion,
      details: error.details,
      timestamp: new Date(),
      retryable: error.retryable
    };

    this.notifications.push(notification);
    this.notifyListeners();

    if (duration > 0) {
      setTimeout(() => this.removeNotification(notification.id), duration);
    }

    return notification.id;
  }

  /**
   * Remove notification
   */
  removeNotification(id) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifyListeners();
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.notifyListeners();
  }

  /**
   * Subscribe to changes
   */
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  /**
   * Notify all listeners
   */
  notifyListeners() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  /**
   * Get all notifications
   */
  getNotifications() {
    return [...this.notifications];
  }
}

export const errorNotificationManager = new ErrorNotificationManager();
