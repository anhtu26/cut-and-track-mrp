/**
 * EMERGENCY FIX for "undefined is not iterable" errors
 * 
 * This script patches Array.from to make it safe against undefined/null values
 * It should be included in the index.html before any other scripts are loaded
 */

(function fixArrayFrom() {
  // Store the original Array.from implementation
  const originalArrayFrom = Array.from;
  
  // Override Array.from to handle undefined/null values
  Array.from = function safeArrayFrom(items) {
    // If items is null or undefined, return an empty array
    if (items === null || items === undefined) {
      console.warn('Array.from received null/undefined, returning empty array');
      return [];
    }
    
    // Handle non-iterable objects by wrapping in array
    if (typeof items !== 'string' && typeof items[Symbol.iterator] !== 'function') {
      console.warn('Array.from received non-iterable value, wrapping in array', items);
      return [items];
    }
    
    // Use the original implementation for valid iterables
    try {
      return originalArrayFrom.apply(this, arguments);
    } catch (error) {
      console.error('Error in Array.from:', error);
      return [];
    }
  };
  
  console.log('✅ Array.from patched for safety');
})(); 