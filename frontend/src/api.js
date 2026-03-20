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

export const api = {
  // Dashboard
  getDashboard: () => request('/dashboard'),

  // Products
  getProducts: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/products${q ? `?${q}` : ''}`);
  },
  getProduct: (id) => request(`/products/${id}`),
  createProduct: (data) => request('/products', { method: 'POST', body: data }),
  updateProduct: (id, data) => request(`/products/${id}`, { method: 'PUT', body: data }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  getQRCode: (id) => request(`/products/${id}/qrcode`),
  addLifecycleEvent: (id, data) => request(`/products/${id}/events`, { method: 'POST', body: data }),
  addDocument: (id, data) => request(`/products/${id}/documents`, { method: 'POST', body: data }),
  addCompliance: (id, data) => request(`/products/${id}/compliance`, { method: 'POST', body: data }),

  // Stakeholders
  getStakeholders: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/stakeholders${q ? `?${q}` : ''}`);
  },
  getStakeholder: (id) => request(`/stakeholders/${id}`),
  createStakeholder: (data) => request('/stakeholders', { method: 'POST', body: data }),
  updateStakeholder: (id, data) => request(`/stakeholders/${id}`, { method: 'PUT', body: data }),

  // Compliance
  getCompliance: () => request('/compliance'),
  updateCompliance: (id, data) => request(`/compliance/${id}`, { method: 'PUT', body: data }),

  // Analytics
  getAnalytics: () => request('/analytics'),
};
