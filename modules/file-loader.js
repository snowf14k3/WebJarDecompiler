class FileLoader {
  constructor() {
    this.currentZip = null;
    this.treeView = null;
    this.statusElement = null;
    this.initialized = false;
    
    setTimeout(() => this.init(), 100);
  }

  init() {
    const input = document.getElementById('file-input');
    const treeContent = document.getElementById('tree-content');
    
    if (!input || !treeContent) {
      console.warn('DOM elements not ready, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }
    
    input.addEventListener('change', (e) => {
      this.loadJarFile(e.target.files[0]);
    });

    treeContent.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.stopPropagation();
      treeContent.classList.add('drag-active');
    });

    treeContent.addEventListener('dragleave', (e) => {
      e.preventDefault();
      e.stopPropagation();
      treeContent.classList.remove('drag-active');
    });

    treeContent.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      treeContent.classList.remove('drag-active');
      
      const file = e.dataTransfer.files[0];
      if (file) {
        this.loadJarFile(file);
      }
    });
    
    this.initialized = true;
  }

  async loadJarFile(file) {
    if (!file) return;
    
    // 验证文件类型
    if (!file.name.endsWith('.jar') && 
      !file.name.endsWith('.zip') && 
      !file.name.endsWith('.war')) {
      alert("Please drop a valid .jar, .zip, or .war file.");
      return;
    }

    this.setStatus(`Loading ${file.name}...`);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      this.currentZip = await JSZip.loadAsync(arrayBuffer);
      
      // 更新全局状态
      if (window.appState) {
        window.appState.currentZip = this.currentZip;
      }
      
      // 渲染文件树
      if (window.treeViewModule) {
        window.treeViewModule.renderTree(this.currentZip.files);
      }
      
      this.setStatus(file.name);
    } catch (err) {
      console.error(err);
      alert("Failed to load JAR: " + err.message);
      this.setStatus("Error loading file");
    }
  }

  setStatus(text) {
    if (!this.statusElement) {
      this.statusElement = document.getElementById('status-bar') || 
        document.getElementById('status-text');
    }
    if (this.statusElement) {
      this.statusElement.textContent = text;
    }
  }

  getCurrentZip() {
      return this.currentZip;
  }
}

setTimeout(() => {
  if (typeof window.fileLoader === 'undefined') {
    window.fileLoader = new FileLoader();
  }
}, 200);