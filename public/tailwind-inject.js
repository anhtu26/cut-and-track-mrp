// Enhanced tailwind-inject.js for Docker environments - v4.1.5 compatible
// This script ensures Tailwind CSS is loaded even if the PostCSS integration fails
(function() {
  console.log('Tailwind CSS v4.1.5 injection script started');
  
  // Set CSS loading timeout - Docker environments might be slow
  const CSS_LOAD_TIMEOUT = 5000; // 5 seconds
  
  // Helper function to add stylesheets with error handling and timeout
  function injectStylesheet(href, id, fallback = null) {
    return new Promise((resolve) => {
      // Check if stylesheet already exists
      const existingLink = document.getElementById(id);
      if (existingLink) {
        console.log(`Stylesheet ${id} already exists, skipping injection`);
        resolve(true);
        return;
      }
      
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (id) link.id = id;
      
      // Set up timeout for loading
      const timeout = setTimeout(() => {
        console.warn(`Loading ${href} timed out after ${CSS_LOAD_TIMEOUT}ms`);
        if (fallback) {
          console.log(`Attempting to load fallback: ${fallback}`);
          injectStylesheet(fallback, `${id}-fallback`).then(resolve);
        } else {
          console.error(`No fallback available for ${href}`);
          resolve(false);
        }
      }, CSS_LOAD_TIMEOUT);
      
      // Handle loading errors
      link.onerror = () => {
        clearTimeout(timeout);
        console.error(`Failed to load stylesheet: ${href}`);
        if (fallback) {
          console.log(`Attempting to load fallback: ${fallback}`);
          injectStylesheet(fallback, `${id}-fallback`).then(resolve);
        } else {
          console.error(`No fallback available for ${href}`);
          resolve(false);
        }
      };
      
      link.onload = () => {
        clearTimeout(timeout);
        console.log(`Successfully loaded: ${href}`);
        resolve(true);
      };
      
      document.head.appendChild(link);
    });
  }
  
  // Check if styles are already applied
  function hasAppliedStyles() {
    // Test for a few basic Tailwind classes
    const testElement = document.createElement('div');
    testElement.className = 'hidden lg:block p-4 flex';
    document.body.appendChild(testElement);
    
    const styles = window.getComputedStyle(testElement);
    const hasStyles = 
      styles.display === 'none' && // 'hidden' works
      styles.padding === '1rem';   // 'p-4' works
    
    document.body.removeChild(testElement);
    return hasStyles;
  }
  
  // Apply inline styles if external stylesheets fail
  function applyEssentialInlineStyles() {
    console.log('Applying essential inline styles as last resort');
    const style = document.createElement('style');
    style.id = 'essential-inline-styles';
    style.textContent = `
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .flex-1 { flex: 1 1 0%; }
      .flex-shrink-0 { flex-shrink: 0; }
      .w-72 { width: 18rem; }
      .min-h-screen { min-height: 100vh; }
      .p-4 { padding: 1rem; }
      .md\:p-8 { padding: 2rem; }
      .mx-auto { margin-left: auto; margin-right: auto; }
      .max-w-7xl { max-width: 80rem; }
      .w-full { width: 100%; }
      .bg-background { background-color: hsl(var(--background)); }
      .overflow-auto { overflow: auto; }
      .h-8 { height: 2rem; }
      .w-8 { width: 2rem; }
      .rounded-md { border-radius: 0.375rem; }
      .text-lg { font-size: 1.125rem; }
      .font-bold { font-weight: 700; }
      .m-0 { margin: 0; }
      .hidden { display: none; }
      @media (min-width: 1024px) { .lg\:block { display: block; } }
    `;
    document.head.appendChild(style);
    return true;
  }
  
  // Main execution - attempt different loading strategies
  const loadStyles = async () => {
    // First check if styles are already loaded
    if (hasAppliedStyles()) {
      console.log('Tailwind styles already applied, skipping injection');
      document.dispatchEvent(new CustomEvent('css-loaded', { detail: { alreadyLoaded: true } }));
      return;
    }
    
    try {
      // Try loading the full Tailwind CSS
      const tailwindLoaded = await injectStylesheet('/tailwind.css', 'tailwind-css-main', '/essential-styles.css');
      
      // Always load essential styles as a backup layer
      const essentialLoaded = await injectStylesheet('/essential-styles.css', 'essential-styles-backup');
      
      // If neither external stylesheet loaded, try inline styles
      if (!tailwindLoaded && !essentialLoaded) {
        applyEssentialInlineStyles();
      }
      
      console.log('CSS injection completed');
      document.dispatchEvent(new CustomEvent('css-loaded', { detail: { success: true } }));
    } catch (error) {
      console.error('Error during CSS injection:', error);
      
      // Apply inline styles as last resort
      applyEssentialInlineStyles();
      
      // Still notify the app that we're done, even with errors
      document.dispatchEvent(new CustomEvent('css-loaded', { detail: { error: true } }));
    }
  };
  
  // Start loading process
  loadStyles();
})();
