
/**
 * Formats a date string to be used in a datetime-local input.
 * @param dateString The string representation of the date to format or undefined
 * @returns A string in the format YYYY-MM-DDThh:mm (for datetime-local inputs) or empty string if input is undefined
 */
export function formatDateForInput(dateString?: string | null): string {
  if (!dateString) return "";
  
  try {
    const date = new Date(dateString);
    // Check if the date is valid
    if (isNaN(date.getTime())) return "";
    
    return date.toISOString().slice(0, 16);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "";
  }
}
