class TabSystem {
  constructor() {
    this.openTabs = new Map();
    this.activePath = null;
    this.tabBar = null;
    this.editorsStack = null;
    this.emptyState = null;
    this.initialized = false;
    
    setTimeout(() => this.init(), 200);
  }

  init() {
    this.tabBar = document.getElementById('tab-bar');
    this.editorsStack = document.getElementById('editors-stack');
    this.emptyState = document.getElementById('empty-state');
    
    if (!this.tabBar || !this.editorsStack || !this.emptyState) {
      console.warn('TabSystem DOM elements not ready, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }
    this.tabBar.addEventListener("wheel", (e) => {
      if (e.deltaY !== 0) {
          e.preventDefault();
          this.tabBar.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    this.initContextMenu();
    
    this.initialized = true;
  }

  openTab(filePath, zipEntry) {
    if (this.openTabs.has(filePath)) {
        this.activateTab(filePath);
        return;
    }

    const fileName = filePath.split('/').pop();
    
    const tabEl = this.createTabElement(filePath, fileName);
    this.tabBar.appendChild(tabEl);
    
    const editorWrapper = this.createEditorElement(filePath, fileName);
    this.editorsStack.appendChild(editorWrapper);
    
    const tabInfo = {
        tabEl,
        editorEl: editorWrapper,
        loadingEl: editorWrapper.querySelector('.loading-overlay'),
        codeEl: editorWrapper.querySelector('code'),
        path: filePath
    };
    
    this.openTabs.set(filePath, tabInfo);

    this.activateTab(filePath);
    
    this.loadContent(filePath, zipEntry, tabInfo);
  }

  createTabElement(filePath, fileName) {
    const tabEl = document.createElement("div");
    tabEl.className = "tab";
    tabEl.innerHTML = `
      <div style="display:flex;align-items:center">
          <span style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px" 
                title="${filePath}">${fileName}</span>
      </div>
      <div class="tab-close">✕</div>
    `;
    
    tabEl.onclick = () => this.activateTab(filePath);
    
    tabEl.querySelector(".tab-close").onclick = (e) => {
      e.stopPropagation(); 
      this.closeTab(filePath);
    };

    tabEl.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      this.showContextMenu(e.clientX, e.clientY, filePath);
    });

    return tabEl;
  }

  createEditorElement(filePath, fileName) {
    const wrapper = document.createElement("div");
    wrapper.className = "editor-instance";
    
    const pre = document.createElement("pre");
    const code = document.createElement("code");
    
    // 根据文件类型设置语言
    let lang = 'plaintext';
    if (fileName.endsWith('.class')) lang = 'java';
    else if (fileName.endsWith('.xml')) lang = 'xml';
    else if (fileName.endsWith('.json')) lang = 'json';
    else if (fileName.endsWith('.js')) lang = 'javascript';
    
    code.className = `language-${lang}`; 
    pre.appendChild(code);
    wrapper.appendChild(pre);
    
    // 加载指示器
    const loading = document.createElement("div");
    loading.className = "loading-overlay";
    loading.textContent = "Queued...";
    wrapper.appendChild(loading);
    
    return wrapper;
  }

  async loadContent(filePath, zipEntry, tabInfo) {
    try {
      tabInfo.loadingEl.style.display = "flex";
      tabInfo.loadingEl.textContent = "Decompiling...";
      
      let content = "";
      
      if (filePath.endsWith(".class")) {
        const className = filePath.replace(/\.class$/, "");
        content = await window.decompiler.decompileClass(className);
      } else {
        content = await zipEntry.async("string");
        if (content.length > 500000) {
            content = content.substring(0, 500000) + "\n... Truncated";
        }
      }
      
      tabInfo.codeEl.textContent = content;
      tabInfo.codeEl.removeAttribute('data-highlighted');
      hljs.highlightElement(tabInfo.codeEl);
      
      if (tabInfo.codeEl.parentElement.querySelectorAll('.hljs-ln').length === 0) {
        hljs.lineNumbersBlock(tabInfo.codeEl);
      }
    } catch (error) {
      console.error("Error loading content:", error);
      tabInfo.codeEl.textContent = "// Error: " + error.message;
      
      if (error.message.includes("Timed out")) {
        tabInfo.codeEl.textContent += `\n\n// Tip: Increase [Web] Timeout in Options`;
      }
    } finally {
      tabInfo.loadingEl.style.display = "none";
    }
  }

  activateTab(path) {
    if (!this.openTabs.has(path)) {
      console.warn("Attempted to activate non-existent tab:", path);
      return;
    }

    if (this.activePath && this.openTabs.has(this.activePath)) {
      const curr = this.openTabs.get(this.activePath);
      if (curr) {
        curr.tabEl.classList.remove("active");
        curr.editorEl.classList.remove("active");
      }
    }

    this.activePath = path;
    const target = this.openTabs.get(path);
    
    if (target) {
      target.tabEl.classList.add("active");
      target.editorEl.classList.add("active");
      this.emptyState.style.display = "none";
    }
  }

  closeTab(path) {
    const target = this.openTabs.get(path);
    if (!target) return;

    target.tabEl.remove();
    target.editorEl.remove();
    this.openTabs.delete(path);

    if (this.activePath === path) {
      this.activePath = null;
      
      const keys = Array.from(this.openTabs.keys());
      if (keys.length > 0) {
        this.activateTab(keys[keys.length - 1]);
      } else {
        this.emptyState.style.display = "block";
      }
    }
  }

  initContextMenu() {
    this.ctxMenu = document.getElementById("tab-ctx-menu");
    this.ctxMenuTarget = null;

    // 绑定上下文菜单事件
    document.getElementById("ctx-close").addEventListener("click", () => {
      if (this.ctxMenuTarget) this.closeTab(this.ctxMenuTarget);
    });

    document.getElementById("ctx-close-others").addEventListener("click", () => {
      if (!this.ctxMenuTarget) return;
      const paths = Array.from(this.openTabs.keys());
      paths.forEach(p => {
          if (p !== this.ctxMenuTarget) this.closeTab(p);
      });
      this.activateTab(this.ctxMenuTarget);
    });

    document.getElementById("ctx-close-all").addEventListener("click", () => {
      const paths = Array.from(this.openTabs.keys());
      paths.forEach(p => this.closeTab(p));
    });

    document.getElementById("ctx-close-right").addEventListener("click", () => {
      if (!this.ctxMenuTarget) return;
      const paths = Array.from(this.openTabs.keys());
      const currentIndex = paths.indexOf(this.ctxMenuTarget);
      if (currentIndex === -1) return;

      const toClose = paths.slice(currentIndex + 1);
      toClose.forEach(p => this.closeTab(p));
      this.activateTab(this.ctxMenuTarget);
    });

    document.getElementById("ctx-close-left").addEventListener("click", () => {
      if (!this.ctxMenuTarget) return;
      const paths = Array.from(this.openTabs.keys());
      const currentIndex = paths.indexOf(this.ctxMenuTarget);
      if (currentIndex === -1) return;

      const toClose = paths.slice(0, currentIndex);
      toClose.forEach(p => this.closeTab(p));
      this.activateTab(this.ctxMenuTarget);
    });

    // 点击其他地方隐藏菜单
    document.addEventListener("click", () => {
      this.ctxMenu.style.display = "none";
    });
  }

  showContextMenu(x, y, path) {
    this.ctxMenuTarget = path;
    this.ctxMenu.style.display = "block";
    
    const winW = window.innerWidth;
    const winH = window.innerHeight;
    const menuW = 160;
    const menuH = 150;
    
    let finalX = x;
    let finalY = y;
    
    if (x + menuW > winW) finalX = winW - menuW - 10;
    if (y + menuH > winH) finalY = winH - menuH - 10;

    this.ctxMenu.style.left = finalX + "px";
    this.ctxMenu.style.top = finalY + "px";
  }
}

setTimeout(() => {
    if (typeof window.tabSystem === 'undefined') {
        window.tabSystem = new TabSystem();
    }
}, 300);