class App {
  constructor() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      setTimeout(() => this.init(), 100);
    }
  }

  init() {
    console.log('Initializing Web Jar Decompiler...');
    
    window.appState = {
      currentZip: null
    };
    
    this.initModules();
    
    this.bindEvents();
    
    console.log('Web Jar Decompiler initialized successfully');
  }

  initModules() {
    try {
      console.log('Initializing modules...');
      
      if (!window.ui) {
        console.warn('UI module not found, creating...');
        window.ui = new UIManager();
      }
      
      if (!window.workerModule) {
        console.warn('Worker module not found, creating...');
        window.workerModule = {
          initWorker: function() {
            console.log('Worker would be initialized here');
          },
          decompileClass: async function() {
            throw new Error('Worker not implemented');
          }
        };
      }
      
      if (!window.decompiler) {
        console.warn('Decompiler module not found, creating...');
        window.decompiler = new Decompiler();
      }
      
      if (!window.fileLoader) {
        console.warn('File loader module not found, creating...');
        window.fileLoader = new FileLoader();
      }
      
      if (!window.treeViewModule) {
        console.warn('Tree view module not found, creating...');
        window.treeViewModule = new TreeView();
      }
      
      if (!window.tabSystem) {
        console.warn('Tab system module not found, creating...');
        window.tabSystem = new TabSystem();
      }
      
      if (!window.options) {
        console.warn('Options module not found, creating...');
        window.options = new OptionsManager();
      }
        
    } catch (error) {
      console.error('Error initializing modules:', error);
    }
  }

  bindEvents() {
    console.log('Binding events...');
    
    document.addEventListener('click', (e) => {
      const target = e.target;
      
      if (target.closest('#open-file-btn') || 
        (target.classList.contains('btn') && target.textContent.includes('Open JAR'))) {
        e.preventDefault();
        document.getElementById('file-input').click();
      }
      
      else if (target.closest('#options-btn') || 
          (target.classList.contains('btn') && target.textContent.includes('Options'))) {
        e.preventDefault();
        if (window.options && window.options.openOptions) {
          window.options.openOptions();
        }
      }
      
      else if (target.closest('#about-btn') || 
          (target.classList.contains('btn') && target.textContent.includes('About'))) {
        e.preventDefault();
        if (window.ui && window.ui.openAbout) {
          window.ui.openAbout();
        }
      }
      
      else if (target.closest('#sidebar-toggle-btn') || 
        target.closest('#sidebar-toggle')) {
        e.preventDefault();
        if (window.ui && window.ui.toggleSidebar) {
          window.ui.toggleSidebar();
        }
      }
    });
    
    document.addEventListener('click', (e) => {
      if (e.target.closest('.modal-header span[style*="cursor:pointer"]')) {
        const modal = e.target.closest('.modal-overlay');
        if (modal) {
          modal.style.display = 'none';
        }
      }
    });
  }
}

let app;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    app = new App();
    window.app = app;
  });
} else {
  app = new App();
  window.app = app;
}