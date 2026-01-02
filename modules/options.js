class OptionsManager {
  constructor() {
    this.modal = null;
    this.optionsList = null;
    this.searchInput = null;
    
    setTimeout(() => this.initDOM(), 100);
  }

  initDOM() {
    this.modal = document.getElementById('options-modal');
    this.optionsList = document.getElementById('options-list');
    this.searchInput = document.getElementById('opt-search');
  }

  openOptions() {
    if (!this.modal || !this.optionsList || !this.searchInput) {
      this.initDOM();
    }
    
    this.renderOptionsList();
    if (this.modal) {
      this.modal.style.display = "flex";
    }
    if (this.searchInput) {
      this.searchInput.focus();
    }
  }

  closeOptions() {
      this.modal.style.display = "none";
  }

  renderOptionsList() {
    this.optionsList.innerHTML = "";
    
    CFR_DEFAULTS.forEach(opt => {
      const div = document.createElement("div");
      div.className = "opt-row";
      div.dataset.key = opt.k;
      
      const val = window.decompiler.getOptions()[opt.k];
      let inputHtml = "";
      
      if (opt.t === 'bool') {
        inputHtml = `<input type="checkbox" id="opt-${opt.k}" ${val === "true" ? 'checked' : ''}>`;
      } else if (opt.t === 'troolean') {
        inputHtml = `
          <select id="opt-${opt.k}">
              <option value="true" ${val === 'true' ? 'selected' : ''}>True</option>
              <option value="false" ${val === 'false' ? 'selected' : ''}>False</option>
              <option value="neither" ${val === 'neither' ? 'selected' : ''}>Neither</option>
          </select>
        `;
      } else if (opt.t === 'int') {
        inputHtml = `<input type="number" id="opt-${opt.k}" value="${val}" style="width:70px">`;
      }
      
      div.innerHTML = `
        <div>
            <span class="opt-name">${opt.k}</span>
            <span class="opt-desc">${opt.d}</span>
        </div>
        <div>${inputHtml}</div>
      `;
      
      this.optionsList.appendChild(div);
    });
  }

  filterOptions() {
    const filter = this.searchInput.value.toLowerCase();
    document.querySelectorAll(".opt-row").forEach(row => {
        const txt = row.querySelector(".opt-name").textContent + 
                    row.querySelector(".opt-desc").textContent;
        row.style.display = txt.toLowerCase().includes(filter) ? "flex" : "none";
    });
  }

  saveOptions() {
    const newOptions = {};
    
    CFR_DEFAULTS.forEach(opt => {
      const el = document.getElementById("opt-" + opt.k);
      if (el) {
        if (opt.t === 'bool') {
            newOptions[opt.k] = el.checked ? "true" : "false";
        } else {
            newOptions[opt.k] = el.value.toString();
        }
      }
    });
    window.decompiler.setOptions(newOptions);
    
    this.closeOptions();
    window.decompiler.reloadActiveTab();
  }
}

setTimeout(() => {
  if (typeof window.options === 'undefined') {
    window.options = new OptionsManager();
  }
}, 350);