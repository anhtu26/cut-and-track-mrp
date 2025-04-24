import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Extend matchers
expect.extend({
  // Add any custom matchers here if needed
});

// Global cleanup after each test
afterEach(() => {
  cleanup();
});
