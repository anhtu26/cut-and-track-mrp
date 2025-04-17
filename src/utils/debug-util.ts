// Debug utility functions for logging and error handling

// Environment flag to toggle verbose logging (can be set by user)
let DEBUG_MODE = process.env.NODE_ENV === 'development';

/**
 * Set debug mode status
 * @param enabled - Whether to enable debug mode
 */
export function setDebugMode(enabled: boolean): void {
  DEBUG_MODE = enabled;
  if (enabled) {
    console.log('[DEBUG] Debug mode enabled');
  } else {
    console.log('[DEBUG] Debug mode disabled');
  }
  
  // Store preference in localStorage for persistence
  try {
    localStorage.setItem('mrp_debug_mode', enabled ? 'true' : 'false');
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Initialize debug mode from localStorage if available
 */
export function initDebugMode(): void {
  try {
    const storedPref = localStorage.getItem('mrp_debug_mode');
    if (storedPref) {
      DEBUG_MODE = storedPref === 'true';
      if (DEBUG_MODE) {
        console.log('[DEBUG] Debug mode restored from preferences');
      }
    }
  } catch (e) {
    // Ignore storage errors
  }
}

/**
 * Log message if in debug mode
 * @param area - System area/component generating the log
 * @param message - Log message
 * @param data - Optional data to log
 */
export function debugLog(area: string, message: string, data?: any): void {
  if (DEBUG_MODE) {
    if (data) {
      console.log(`[${area}] ${message}`, data);
    } else {
      console.log(`[${area}] ${message}`);
    }
  }
}

/**
 * Log error message (always logged, regardless of debug mode)
 * @param area - System area/component generating the error
 * @param message - Error message
 * @param error - Error object or details
 */
export function errorLog(area: string, message: string, error?: any): void {
  if (error) {
    console.error(`[${area} ERROR] ${message}`, error);
  } else {
    console.error(`[${area} ERROR] ${message}`);
  }
}

/**
 * Track document access attempts
 * @param documentId - ID of the document being accessed
 * @param userId - ID of the user accessing the document
 * @param success - Whether access was successful
 * @param errorDetails - Details of error if access failed
 */
export function logDocumentAccess(
  documentId: string, 
  userId: string | null | undefined, 
  success: boolean, 
  errorDetails?: string
): void {
  // Always log document access attempts, even in non-debug mode
  const message = success 
    ? `Document ${documentId} accessed successfully by user ${userId || 'unknown'}`
    : `Document ${documentId} access failed for user ${userId || 'unknown'}: ${errorDetails || 'Unknown error'}`;
  
  if (success) {
    console.log(`[DOCUMENT ACCESS] ${message}`);
  } else {
    console.warn(`[DOCUMENT ACCESS] ${message}`);
  }
  
  // In a real application, you might want to send this to a server endpoint
  // for persistent logging or analytics
  if (typeof window !== 'undefined') {
    try {
      // Store recent document access attempts in localStorage
      const recentLogs = JSON.parse(localStorage.getItem('mrp_document_access_logs') || '[]');
      recentLogs.unshift({
        timestamp: new Date().toISOString(),
        documentId,
        userId,
        success,
        errorDetails,
      });
      
      // Keep only the last 50 logs
      while (recentLogs.length > 50) {
        recentLogs.pop();
      }
      
      localStorage.setItem('mrp_document_access_logs', JSON.stringify(recentLogs));
    } catch (e) {
      // Ignore storage errors
    }
  }
}

/**
 * Track user management actions
 * @param actionType - Type of action (create, update, delete)
 * @param resource - Resource being affected (user, role, permission)
 * @param adminId - ID of admin performing the action
 * @param targetId - ID of the target resource
 * @param success - Whether action was successful
 * @param details - Additional details about the action
 */
export function logUserManagementAction(
  actionType: 'create' | 'update' | 'delete',
  resource: 'user' | 'role' | 'permission' | 'group',
  adminId: string | null | undefined,
  targetId: string,
  success: boolean,
  details?: any
): void {
  const message = success
    ? `${actionType} ${resource} ${targetId} by ${adminId || 'unknown'} succeeded`
    : `${actionType} ${resource} ${targetId} by ${adminId || 'unknown'} failed`;
    
  if (success) {
    console.log(`[USER MANAGEMENT] ${message}`, details || '');
  } else {
    console.warn(`[USER MANAGEMENT] ${message}`, details || '');
  }
  
  // In a real application, log this to the server for audit trail
}
