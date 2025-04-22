import '@testing-library/jest-dom';

// Make the expect global available in TypeScript
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
    }
    interface Expect {
      toBeInTheDocument(): void;
    }
    interface InverseAsymmetricMatchers {
      toBeInTheDocument(): void;
    }
  }
} 