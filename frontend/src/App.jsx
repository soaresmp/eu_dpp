import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Products from './pages/Products.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import ProductForm from './pages/ProductForm.jsx';
import Stakeholders from './pages/Stakeholders.jsx';
import Analytics from './pages/Analytics.jsx';
import Compliance from './pages/Compliance.jsx';
import Scanner from './pages/Scanner.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/new" element={<ProductForm />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="products/:id/edit" element={<ProductForm />} />
          <Route path="stakeholders" element={<Stakeholders />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="compliance" element={<Compliance />} />
          <Route path="scanner" element={<Scanner />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
