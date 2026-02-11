/**
 * Formatting Utilities
 * Functions for formatting data for display
 */

/**
 * Format effort value for display
 * Shows up to 2 decimal places, removes trailing zeros for whole numbers
 */
export function formatEffort(effort: number): string {
  // Round to 2 decimal places
  const rounded = Math.round(effort * 100) / 100;
  return rounded.toFixed(2);
}

/**
 * Format date for display
 */
export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format datetime for display
 */
export function formatDateTime(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Escape HTML to prevent XSS attacks
 * React handles this automatically for JSX, but useful for edge cases
 */
export function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Generate filename for export
 */
export function generateExportFilename(projectName: string): string {
  const safeName = projectName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_-]/g, '');
  return `${safeName}_requirements.json`;
}

/**
 * Normalize effort input to 2 decimal places
 */
export function normalizeEffort(effort: number): number {
  return Math.round(effort * 100) / 100;
}

