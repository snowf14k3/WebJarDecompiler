class TreeView {
  constructor() {
    this.container = null;
    this.searchInput = null;
    this.initialized = false;
    
    setTimeout(() => this.init(), 150);
  }

  init() {
    this.container = document.getElementById('tree-content');
    this.searchInput = document.getElementById('tree-search');
    
    if (!this.container || !this.searchInput) {
      console.warn('TreeView DOM elements not ready, retrying...');
      setTimeout(() => this.init(), 100);
      return;
    }
    
    this.searchInput.addEventListener('input', this.debounce(this.filterTree.bind(this), 300));
    this.initialized = true;
  }

  debounce(func, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  renderTree(files) {
    this.container.innerHTML = "";
    
    this.searchInput.value = "";
    
    const root = {};
    Object.keys(files).forEach(path => {
      const parts = path.split('/');
      let current = root;
      parts.forEach((part, index) => {
        if (!part) return;
        if (!current[part]) {
          current[part] = { 
            __name: part, 
            __path: path, 
            __isDir: index < parts.length - 1 || files[path].dir 
          };
        }
        if (index === parts.length - 1 && !files[path].dir) {
          current[part].__file = files[path];
        }
        current = current[part];
      });
    });
    
    const ul = document.createElement('div');
    this.buildDom(root, ul);
    this.container.appendChild(ul);
  }

  buildDom(node, container) {
    const keys = Object.keys(node)
        .filter(k => !k.startsWith('__'))
        .sort((a, b) => {
            const aDir = node[a].__isDir; 
            const bDir = node[b].__isDir;
            if (aDir === bDir) return a.localeCompare(b);
            return aDir ? -1 : 1;
        });

    keys.forEach(key => {
      const item = node[key];
      const isDir = item.__isDir;
      const wrapper = document.createElement('div');
      wrapper.className = isDir ? 'folder-wrapper' : 'file-wrapper';
      
      const row = document.createElement('div');
      row.className = 'tree-item ' + (isDir ? 'tree-folder' : 'tree-file');
      
      const arrow = isDir ? '<span class="arrow">▶</span>' : '<span style="width:12px;display:inline-block"></span>';
      let icon = isDir ? '📁' : (key.endsWith('.class') ? '☕' : '📄');
      
      row.innerHTML = `${arrow}<span style="margin-right:5px">${icon}</span> ${key}`;
      wrapper.appendChild(row);

      if (isDir) {
        const children = document.createElement('div');
        children.className = 'folder-children';
        this.buildDom(item, children);
        wrapper.appendChild(children);
        
        row.addEventListener('click', (e) => {
          e.stopPropagation(); 
          wrapper.classList.toggle('folder-open');
        });
      } else {
        row.addEventListener('click', (e) => {
          e.stopPropagation();
          
          document.querySelectorAll('.tree-item.selected')
            .forEach(el => el.classList.remove('selected'));
          
          row.classList.add('selected');
          
          if (window.tabSystem) {
            window.tabSystem.openTab(item.__path, item.__file);
          }
        });
      }
      
      container.appendChild(wrapper);
    });
  }

  filterTree() {
    const filter = this.searchInput.value.toLowerCase();
    const root = this.container;
    const allWrappers = root.querySelectorAll('.file-wrapper, .folder-wrapper');
    
    if (!filter) {
      allWrappers.forEach(el => el.style.display = "");
      return;
    }
    
    allWrappers.forEach(el => el.style.display = "none");
    
    const items = root.querySelectorAll('.tree-item');
    items.forEach(item => {
      if (item.innerText.toLowerCase().includes(filter)) {
        let currentWrapper = item.closest('.file-wrapper, .folder-wrapper');
        if (currentWrapper) currentWrapper.style.display = "block";
        
        let parent = currentWrapper.parentElement;
        while(parent && parent !== root) {
          if (parent.classList.contains('folder-children')) {
            const folderWrapper = parent.closest('.folder-wrapper');
            if (folderWrapper) {
              folderWrapper.style.display = "block";
              folderWrapper.classList.add('folder-open');
            }
          }
          parent = parent.parentElement;
        }
      }
    });
  }
}

setTimeout(() => {
  if (typeof window.treeViewModule === 'undefined') {
    window.treeViewModule = new TreeView();
  }
}, 250);