/**
 * Extracts a readable error message from various error types
 */
export function getReadableErrorMessage(error: unknown): string {
  // Handle Error objects
  if (error instanceof Error) {
    return error.message;
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return error;
  }
  
  // Handle agent/rejection objects with message property
  if (error && typeof error === 'object') {
    // Check for common error shapes from IC agent
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    
    // Check for rejection_message from IC
    if ('rejection_message' in error && typeof error.rejection_message === 'string') {
      return error.rejection_message;
    }
    
    // Check for error_message
    if ('error_message' in error && typeof error.error_message === 'string') {
      return error.error_message;
    }
    
    // Try to stringify if it has useful info
    try {
      const stringified = JSON.stringify(error);
      if (stringified !== '{}') {
        return stringified;
      }
    } catch {
      // Ignore stringify errors
    }
  }
  
  // Safe fallback
  return 'An unexpected error occurred. Please try again.';
}
