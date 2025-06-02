
  // Simple script to inject our CSS files
  (function() {
    console.log('Injecting Tailwind CSS...');
    
    // Function to add stylesheet to head
    function addStylesheet(href) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
    }
    
    // Add our simple CSS file
    addStylesheet('/tailwind-simple.css');
  })();
  