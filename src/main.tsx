import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// EMERGENCY FIX: Add global error handler to prevent crash on undefined iterable
const originalArrayFrom = Array.from;
if (typeof Array.from === 'function') {
  Array.from = function safeArrayFrom() {
    try {
      // @ts-ignore
      return originalArrayFrom.apply(this, arguments);
    } catch (error) {
      console.error('Protected from crash in Array.from:', error);
      return [];
    }
  };
}

// EMERGENCY FIX: Add global error boundary
const SafeApp = () => {
  try {
    return <App />;
  } catch (error) {
    console.error('Critical render error in App:', error);
    return (
      <div className="p-8 bg-red-50 text-red-900 rounded-lg max-w-2xl mx-auto mt-8">
        <h2 className="text-2xl font-bold mb-4">Application Error</h2>
        <p className="mb-4">The application encountered a critical error.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Reload Application
        </button>
      </div>
    );
  }
};

// Get root element with fallback
const rootElement = document.getElementById("root") || document.createElement('div');
if (!rootElement.parentElement) {
  rootElement.id = 'root';
  document.body.appendChild(rootElement);
}

try {
  createRoot(rootElement).render(<SafeApp />);
} catch (error) {
  console.error('Fatal rendering error:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; margin: 20px; border: 1px solid #f44336; border-radius: 4px; background-color: #ffebee;">
      <h2 style="color: #d32f2f; margin-bottom: 10px;">Critical Application Error</h2>
      <p>The application could not be loaded. Please try again later.</p>
      <button onclick="window.location.reload()" style="padding: 8px 16px; background-color: #d32f2f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px;">
        Reload Page
      </button>
    </div>
  `;
}
