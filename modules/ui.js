class UIManager {
  constructor() {
    this.sidebar = null;
    this.sidebarToggle = null;
    this.aboutModal = null;
    
    setTimeout(() => this.initDOM(), 100);
  }

  initDOM() {
    this.sidebar = document.getElementById('sidebar');
    this.sidebarToggle = document.getElementById('sidebar-toggle');
    this.aboutModal = document.getElementById('about-modal');
  }

  toggleSidebar() {
    if (!this.sidebar || !this.sidebarToggle) {
      this.initDOM();
    }
    
    if (!this.sidebar) return;
    
    const isHidden = window.getComputedStyle(this.sidebar).display === "none";
    
    if (isHidden) {
      this.sidebar.style.display = "flex";
      if (this.sidebarToggle) {
        this.sidebarToggle.classList.remove("closed");
      }
    } else {
      this.sidebar.style.display = "none";
      if (this.sidebarToggle) {
        this.sidebarToggle.classList.add("closed");
      }
    }
  }

  openAbout() {
    if (!this.aboutModal) {
      this.initDOM();
    }
    if (this.aboutModal) {
      this.aboutModal.style.display = "flex";
    }
  }

  closeAbout() {
    if (this.aboutModal) {
      this.aboutModal.style.display = "none";
    }
  }

  setStatus(text) {
    const statusElement = document.getElementById('status-bar') || 
                        document.getElementById('status-text');
    if (statusElement) {
      statusElement.textContent = text;
    }
  }
}

setTimeout(() => {
    if (typeof window.ui === 'undefined') {
        window.ui = new UIManager();
    }
}, 100);