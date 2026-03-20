// Auto-detect: use static data on GitHub Pages, live API when backend is running
const IS_STATIC = import.meta.env.VITE_STATIC_MODE === 'true' || !window.location.hostname.match(/localhost|127\.0\.0\.1/);

let _staticApi = null;

async function getStaticApi() {
  if (!_staticApi) {
    const mod = await import('./staticData.js');
    _staticApi = mod.staticApi;
  }
  return _staticApi;
}

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

// Proxy that transparently routes to static or live API
function makeApi() {
  const methods = [
    'getDashboard', 'getProducts', 'getProduct', 'createProduct', 'updateProduct',
    'deleteProduct', 'getQRCode', 'addLifecycleEvent', 'addDocument', 'addCompliance',
    'getStakeholders', 'getStakeholder', 'createStakeholder', 'updateStakeholder',
    'getCompliance', 'updateCompliance', 'getAnalytics',
  ];

  const liveApi = {
    getDashboard: () => request('/dashboard'),
    getProducts: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString(); return request(`/products${q ? `?${q}` : ''}`); },
    getProduct: (id) => request(`/products/${id}`),
    createProduct: (data) => request('/products', { method: 'POST', body: data }),
    updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
    deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
    getQRCode: (id) => request(`/products/${id}/qrcode`),
    addLifecycleEvent: (id, data) => request(`/products/${id}/events`, { method: 'POST', body: data }),
    addDocument: (id, data) => request(`/products/${id}/documents`, { method: 'POST', body: data }),
    addCompliance: (id, data) => request(`/products/${id}/compliance`, { method: 'POST', body: data }),
    getStakeholders: (params = {}) => { const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString(); return request(`/stakeholders${q ? `?${q}` : ''}`); },
    getStakeholder: (id) => request(`/stakeholders/${id}`),
    createStakeholder: (data) => request('/stakeholders', { method: 'POST', body: data }),
    updateStakeholder: (id, data) => request(`/stakeholders/${id}`, { method: 'PUT', body: data }),
    getCompliance: () => request('/compliance'),
    updateCompliance: (id, data) => request(`/compliance/${id}`, { method: 'PUT', body: data }),
    getAnalytics: () => request('/analytics'),
  };

  const proxy = {};
  methods.forEach(m => {
    proxy[m] = async (...args) => {
      if (IS_STATIC) {
        const s = await getStaticApi();
        return s[m](...args);
      }
      return liveApi[m](...args);
    };
  });
  return proxy;
}

export const api = makeApi();
