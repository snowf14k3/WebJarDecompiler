class Decompiler {
  constructor() {
    this.options = {};
    this.initOptions();
    
    if (window.workerModule) {
      window.workerModule.initWorker();
    }
  }

  initOptions() {
    CFR_DEFAULTS.forEach(o => this.options[o.k] = o.v);
  }

  async decompileClass(className) {
    const timeoutMs = parseInt(this.options["decompiletimeout"]) || 15000;
    
    if (!window.workerModule) {
      throw new Error("Worker module not initialized");
    }

    const decompilePromise = window.workerModule.decompileClass(className, this.options);
    
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Timed out after ${timeoutMs}ms`));
      }, timeoutMs);
    });

    return Promise.race([decompilePromise, timeoutPromise]);
  }

  getOptions() {
    return this.options;
  }

  setOptions(newOptions) {
    this.options = { ...this.options, ...newOptions };
  }

  reloadActiveTab() {
    if (window.tabSystem && window.tabSystem.activePath) {
      const activePath = window.tabSystem.activePath;
      if (activePath.endsWith(".class")) {
        const tabInfo = window.tabSystem.openTabs.get(activePath);
        if (tabInfo && window.fileLoader && window.fileLoader.getCurrentZip()) {
          const entry = window.fileLoader.getCurrentZip().file(activePath);
          if (entry) {
            tabInfo.loadingEl.style.display = "flex";
            window.tabSystem.loadContent(activePath, entry, tabInfo);
          }
        }
      }
    }
  }
}

window.decompiler = new Decompiler();