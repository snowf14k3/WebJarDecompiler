let decompilerWorker = null;
let pendingResolves = new Map();

function initWorker() {
  const workerScript = `
      import { decompile } from "https://cdn.jsdelivr.net/npm/@run-slicer/cfr/cfr.js";

      self.onmessage = async (e) => {
          const { msgId, action, payload } = e.data;

          if (action === 'decompile') {
              const { className, options } = payload;
              
              try {
                  const result = await decompile(className, {
                      source: async (requestPath) => {
                          const requestId = Math.random().toString(36);
                          
                          self.postMessage({ 
                              type: 'request_file', 
                              requestId: requestId, 
                              path: requestPath 
                          });

                          return new Promise((resolve) => {
                              const handler = (evt) => {
                                  if (evt.data.type === 'response_file' && evt.data.requestId === requestId) {
                                      self.removeEventListener('message', handler);
                                      resolve(evt.data.content);
                                  }
                              };
                              self.addEventListener('message', handler);
                          });
                      },
                      options: options
                  });

                  self.postMessage({ type: 'finish', msgId, success: true, content: result });
              } catch (err) {
                  self.postMessage({ type: 'finish', msgId, success: false, error: err.toString() });
              }
          }
      };
  `;

  const blob = new Blob([workerScript], { type: 'application/javascript' });
  const workerUrl = URL.createObjectURL(blob);
  decompilerWorker = new Worker(workerUrl, { type: 'module' });

  decompilerWorker.onmessage = async (e) => {
    const data = e.data;

    if (data.type === 'request_file') {
      const { requestId, path } = data;
      let content = null;
      
      let cleanPath = path;
      if (cleanPath.indexOf('.') !== -1 && cleanPath.indexOf('/') === -1) cleanPath = cleanPath.replace(/\./g, '/');
      if (!cleanPath.endsWith(".class")) cleanPath += ".class";
      if (cleanPath.startsWith("/")) cleanPath = cleanPath.substring(1);

      // 从全局状态中获取当前zip
      if (window.appState && window.appState.currentZip) {
        const f = window.appState.currentZip.file(cleanPath);
        if (f) {
            content = await f.async("uint8array");
        }
      }
      
      decompilerWorker.postMessage({ 
          type: 'response_file', 
          requestId, 
          content 
      }, content ? [content.buffer] : []);
    }
    
    else if (data.type === 'finish') {
      const resolver = pendingResolves.get(data.msgId);
      if (resolver) {
        if (data.success) resolver.resolve(data.content);
        else resolver.reject(new Error(data.error));
        pendingResolves.delete(data.msgId);
      }
    }
  };
}

async function decompileClass(className, options) {
  if (!decompilerWorker) {
      initWorker();
  }

  const msgId = Math.random().toString(36);
  
  return new Promise((resolve, reject) => {
    pendingResolves.set(msgId, { resolve, reject });
    
    const realCfrOptions = { ...options };
    delete realCfrOptions["decompiletimeout"];
    
    decompilerWorker.postMessage({
      msgId,
      action: 'decompile',
      payload: { className, options: realCfrOptions }
    });
  });
}

window.workerModule = {
  initWorker,
  decompileClass
};