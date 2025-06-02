// Enhanced CSS injection script for Docker environments
(function() {
  console.log('CSS injection process starting...');
  
  // Check if tailwind-inject.js has already run
  if (document.getElementById('tailwind-css-primary') || document.getElementById('essential-styles')) {
    console.log('Stylesheets already injected by tailwind-inject.js');
    return;
  }
  
  // Utility function to inject a CSS file with error handling
  function injectCSS(href, id) {
    return new Promise((resolve) => {
      console.log(`Attempting to inject ${href}...`);
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.id = id;
      
      link.onload = () => {
        console.log(`Successfully loaded ${href}`);
        resolve(true);
      };
      
      link.onerror = () => {
        console.warn(`Failed to load ${href}`);
        resolve(false);
      };
      
      document.head.appendChild(link);
    });
  }
  
  // Main function to attempt loading CSS in order of preference
  async function loadCSS() {
    const tailwindSuccess = await injectCSS('/tailwind.css', 'css-inject-tailwind');
    
    // Always load essential styles as a backup
    await injectCSS('/essential-styles.css', 'css-inject-essential');
    
    // Notify the application that CSS loading is complete
    document.dispatchEvent(new CustomEvent('css-loaded', { 
      detail: { success: tailwindSuccess } 
    }));
  }
  
  // Start loading process
  loadCSS().catch(err => {
    console.error('Error in CSS injection process:', err);
    // Ensure the event is always dispatched even in case of errors
    if (!document.getElementById('css-inject-essential')) {
      injectCSS('/essential-styles.css', 'css-inject-essential-fallback');
    }
    document.dispatchEvent(new CustomEvent('css-loaded', { 
      detail: { success: false, error: err.message } 
    }));
  });
})();
