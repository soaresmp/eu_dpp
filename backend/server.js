const express = require('express');
const cors = require('cors');
const path = require('path');
const { getDb } = require('./database');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Serve React frontend build
const frontendBuild = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendBuild));

// ─── Dashboard ───────────────────────────────────────────────────────────────
app.get('/api/dashboard', (req, res) => {
  const db = getDb();
  const stats = db.prepare(`
    SELECT
      (SELECT COUNT(*) FROM products WHERE status != 'end_of_life') AS total_products,
      (SELECT COUNT(*) FROM products WHERE status = 'active') AS active_products,
      (SELECT COUNT(*) FROM products WHERE status = 'recalled') AS recalled_products,
      (SELECT COUNT(*) FROM stakeholders) AS total_stakeholders,
      (SELECT COUNT(*) FROM lifecycle_events WHERE event_date > datetime('now', '-30 days')) AS recent_events,
      (SELECT AVG(recyclability_score) FROM products WHERE recyclability_score IS NOT NULL) AS avg_recyclability,
      (SELECT AVG(repairability_score) FROM products WHERE repairability_score IS NOT NULL) AS avg_repairability,
      (SELECT SUM(carbon_footprint) FROM products WHERE carbon_footprint IS NOT NULL) AS total_carbon
  `).get();

  const byCategory = db.prepare(`
    SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC
  `).all();

  const byStatus = db.prepare(`
    SELECT status, COUNT(*) as count FROM products GROUP BY status
  `).all();

  const recentProducts = db.prepare(`
    SELECT p.*, s.name as manufacturer_name
    FROM products p
    LEFT JOIN stakeholders s ON p.manufacturer_id = s.id
    ORDER BY p.created_at DESC LIMIT 5
  `).all();

  const recentEvents = db.prepare(`
    SELECT le.*, p.name as product_name, s.name as actor_name
    FROM lifecycle_events le
    LEFT JOIN products p ON le.product_id = p.id
    LEFT JOIN stakeholders s ON le.actor_id = s.id
    ORDER BY le.event_date DESC LIMIT 10
  `).all();

  const complianceOverview = db.prepare(`
    SELECT status, COUNT(*) as count FROM compliance_checks GROUP BY status
  `).all();

  res.json({ stats, byCategory, byStatus, recentProducts, recentEvents, complianceOverview });
});

// ─── Products ─────────────────────────────────────────────────────────────────
app.get('/api/products', (req, res) => {
  const db = getDb();
  const { search, category, status, page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  let where = [];
  let params = [];

  if (search) {
    where.push('(p.name LIKE ? OR p.uid LIKE ? OR p.model_number LIKE ? OR s.name LIKE ? OR p.subcategory LIKE ?)');
    const q = `%${search}%`;
    params.push(q, q, q, q, q);
  }
  if (category && category !== 'all') {
    where.push('p.category = ?');
    params.push(category);
  }
  if (status && status !== 'all') {
    where.push('p.status = ?');
    params.push(status);
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const products = db.prepare(`
    SELECT p.*, s.name as manufacturer_name, s.country as manufacturer_country
    FROM products p
    LEFT JOIN stakeholders s ON p.manufacturer_id = s.id
    ${whereClause}
    ORDER BY p.updated_at DESC
    LIMIT ? OFFSET ?
  `).all([...params, parseInt(limit), parseInt(offset)]);

  const total = db.prepare(`
    SELECT COUNT(*) as count FROM products p
    LEFT JOIN stakeholders s ON p.manufacturer_id = s.id
    ${whereClause}
  `).get(params);

  res.json({ products, total: total.count, page: parseInt(page), limit: parseInt(limit) });
});

app.get('/api/products/:id', (req, res) => {
  const db = getDb();
  const product = db.prepare(`
    SELECT p.*, s.name as manufacturer_name, s.country as manufacturer_country,
           s.email as manufacturer_email, s.registration_number as manufacturer_reg
    FROM products p
    LEFT JOIN stakeholders s ON p.manufacturer_id = s.id
    WHERE p.id = ? OR p.uid = ?
  `).get(req.params.id, req.params.id);

  if (!product) return res.status(404).json({ error: 'Product not found' });

  // Parse JSON fields
  ['material_composition', 'hazardous_substances', 'certifications', 'supply_chain'].forEach(field => {
    try { product[field] = JSON.parse(product[field] || '[]'); } catch { product[field] = []; }
  });

  const events = db.prepare(`
    SELECT le.*, s.name as actor_name, s.role as actor_role
    FROM lifecycle_events le
    LEFT JOIN stakeholders s ON le.actor_id = s.id
    WHERE le.product_id = ?
    ORDER BY le.event_date DESC
  `).all(product.id);

  const documents = db.prepare(`
    SELECT * FROM documents WHERE product_id = ? ORDER BY created_at DESC
  `).all(product.id);

  const compliance = db.prepare(`
    SELECT * FROM compliance_checks WHERE product_id = ? ORDER BY checked_at DESC
  `).all(product.id);

  const epcisRaw = db.prepare(`SELECT * FROM epcis_events WHERE product_id = ? ORDER BY event_time ASC`).all(product.id);
  const jsonFields = ['epc_list','child_epc_list','input_epc_list','output_epc_list','biz_location','read_point','biz_transactions','source_parties','destination_parties','ilmd','certifications'];
  const epcis_events = epcisRaw.map(e => {
    jsonFields.forEach(f => { try { e[f] = JSON.parse(e[f] || (f.endsWith('_list')||f.endsWith('parties')||f.endsWith('transactions') ? '[]' : '{}')); } catch { e[f] = []; } });
    return e;
  });

  res.json({ ...product, lifecycle_events: events, documents, compliance_checks: compliance, epcis_events });
});

app.post('/api/products', (req, res) => {
  const db = getDb();
  const id = uuidv4();
  const uid = `EU-DPP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const now = new Date().toISOString();
  const {
    name, category, subcategory, manufacturer_id, model_number, batch_number, serial_number, description,
    carbon_footprint, carbon_unit, recyclability_score, repairability_score, durability_rating,
    energy_class, material_composition, hazardous_substances, certifications, supply_chain,
    warranty_years, expected_lifetime_years, weight_kg, country_of_origin,
    end_of_life_instructions, spare_parts_availability, status = 'draft'
  } = req.body;

  if (!name || !category) return res.status(400).json({ error: 'name and category are required' });

  db.prepare(`
    INSERT INTO products (id, uid, name, category, subcategory, manufacturer_id, model_number, batch_number,
      serial_number, description, carbon_footprint, carbon_unit, recyclability_score, repairability_score,
      durability_rating, energy_class, material_composition, hazardous_substances, certifications, supply_chain,
      warranty_years, expected_lifetime_years, weight_kg, country_of_origin, end_of_life_instructions,
      spare_parts_availability, status, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, uid, name, category, subcategory, manufacturer_id, model_number, batch_number,
    serial_number, description, carbon_footprint, carbon_unit || 'kg CO2e', recyclability_score,
    repairability_score, durability_rating, energy_class,
    JSON.stringify(material_composition || []), JSON.stringify(hazardous_substances || []),
    JSON.stringify(certifications || []), JSON.stringify(supply_chain || []),
    warranty_years, expected_lifetime_years, weight_kg, country_of_origin,
    end_of_life_instructions, spare_parts_availability, status, now, now);

  res.status(201).json({ id, uid });
});

app.put('/api/products/:id', (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT id FROM products WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Product not found' });

  const fields = ['name', 'category', 'subcategory', 'manufacturer_id', 'model_number', 'batch_number',
    'serial_number', 'description', 'carbon_footprint', 'carbon_unit', 'recyclability_score',
    'repairability_score', 'durability_rating', 'energy_class', 'warranty_years',
    'expected_lifetime_years', 'weight_kg', 'country_of_origin', 'end_of_life_instructions',
    'spare_parts_availability', 'status'];

  const jsonFields = ['material_composition', 'hazardous_substances', 'certifications', 'supply_chain'];
  const updates = [];
  const values = [];

  fields.forEach(f => {
    if (f in req.body) { updates.push(`${f} = ?`); values.push(req.body[f]); }
  });
  jsonFields.forEach(f => {
    if (f in req.body) { updates.push(`${f} = ?`); values.push(JSON.stringify(req.body[f])); }
  });
  updates.push('updated_at = ?');
  values.push(new Date().toISOString());
  values.push(req.params.id);

  db.prepare(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`).run(values);
  res.json({ success: true });
});

app.delete('/api/products/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

// ─── QR Code ──────────────────────────────────────────────────────────────────
app.get('/api/products/:id/qrcode', async (req, res) => {
  const db = getDb();
  const product = db.prepare('SELECT id, uid, name FROM products WHERE id = ? OR uid = ?')
    .get(req.params.id, req.params.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });

  const baseUrl = req.query.baseUrl || `${req.protocol}://${req.get('host')}`;
  const url = `${baseUrl}/products/${product.id}`;
  const qr = await QRCode.toDataURL(url, { width: 300, margin: 2, color: { dark: '#1a1a2e', light: '#ffffff' } });
  res.json({ qr, url, uid: product.uid, name: product.name });
});

// ─── Lifecycle Events ─────────────────────────────────────────────────────────
app.post('/api/products/:id/events', (req, res) => {
  const db = getDb();
  const { event_type, description, location, actor_id, event_date } = req.body;
  if (!event_type) return res.status(400).json({ error: 'event_type required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO lifecycle_events (id, product_id, event_type, description, location, actor_id, event_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, event_type, description, location, actor_id, event_date || new Date().toISOString());

  res.status(201).json({ id });
});

// ─── Stakeholders ─────────────────────────────────────────────────────────────
app.get('/api/stakeholders', (req, res) => {
  const db = getDb();
  const { role } = req.query;
  let query = 'SELECT * FROM stakeholders';
  let params = [];
  if (role && role !== 'all') { query += ' WHERE role = ?'; params.push(role); }
  query += ' ORDER BY name';
  res.json(db.prepare(query).all(params));
});

app.get('/api/stakeholders/:id', (req, res) => {
  const db = getDb();
  const stakeholder = db.prepare('SELECT * FROM stakeholders WHERE id = ?').get(req.params.id);
  if (!stakeholder) return res.status(404).json({ error: 'Stakeholder not found' });
  const products = db.prepare(`
    SELECT id, uid, name, category, status FROM products WHERE manufacturer_id = ? ORDER BY name
  `).all(req.params.id);
  res.json({ ...stakeholder, products });
});

app.post('/api/stakeholders', (req, res) => {
  const db = getDb();
  const { name, role, email, country, registration_number, address } = req.body;
  if (!name || !role || !country) return res.status(400).json({ error: 'name, role, country required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO stakeholders (id, name, role, email, country, registration_number, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, name, role, email, country, registration_number, address);
  res.status(201).json({ id });
});

app.put('/api/stakeholders/:id', (req, res) => {
  const db = getDb();
  const { name, role, email, country, registration_number, address } = req.body;
  db.prepare(`
    UPDATE stakeholders SET name=?, role=?, email=?, country=?, registration_number=?, address=? WHERE id=?
  `).run(name, role, email, country, registration_number, address, req.params.id);
  res.json({ success: true });
});

// ─── EPCIS Events ─────────────────────────────────────────────────────────────
app.get('/api/products/:id/epcis', (req, res) => {
  const db = getDb();
  const events = db.prepare(`
    SELECT * FROM epcis_events WHERE product_id = ? ORDER BY event_time ASC
  `).all(req.params.id);

  const parsed = events.map(e => {
    const jsonFields = ['epc_list','child_epc_list','input_epc_list','output_epc_list',
                        'biz_location','read_point','biz_transactions','source_parties',
                        'destination_parties','ilmd','certifications'];
    jsonFields.forEach(f => { try { e[f] = JSON.parse(e[f] || (f.endsWith('_list') || f.endsWith('parties') || f.endsWith('transactions') ? '[]' : '{}')); } catch { e[f] = f.endsWith('_list') || f.endsWith('parties') || f.endsWith('transactions') ? [] : {}; } });
    return e;
  });
  res.json(parsed);
});

app.post('/api/products/:id/epcis', (req, res) => {
  const db = getDb();
  const { event_type, action, biz_step, disposition, event_time, epc_list, child_epc_list,
          input_epc_list, output_epc_list, biz_location, read_point, biz_transactions,
          source_parties, destination_parties, ilmd, certifications, notes } = req.body;

  if (!event_type || !action || !biz_step) return res.status(400).json({ error: 'event_type, action, biz_step required' });

  const id = require('uuid').v4();
  db.prepare(`
    INSERT INTO epcis_events (id, product_id, event_type, action, biz_step, disposition, event_time,
      epc_list, child_epc_list, input_epc_list, output_epc_list, biz_location, read_point,
      biz_transactions, source_parties, destination_parties, ilmd, certifications, notes)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `).run(id, req.params.id, event_type, action, biz_step, disposition, event_time || new Date().toISOString(),
    JSON.stringify(epc_list||[]), JSON.stringify(child_epc_list||[]),
    JSON.stringify(input_epc_list||[]), JSON.stringify(output_epc_list||[]),
    JSON.stringify(biz_location||{}), JSON.stringify(read_point||{}),
    JSON.stringify(biz_transactions||[]), JSON.stringify(source_parties||[]),
    JSON.stringify(destination_parties||[]), JSON.stringify(ilmd||{}),
    JSON.stringify(certifications||[]), notes);
  res.status(201).json({ id });
});

// ─── Documents ────────────────────────────────────────────────────────────────
app.post('/api/products/:id/documents', (req, res) => {
  const db = getDb();
  const { doc_type, title, issued_by, issue_date, expiry_date } = req.body;
  if (!doc_type || !title) return res.status(400).json({ error: 'doc_type and title required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO documents (id, product_id, doc_type, title, issued_by, issue_date, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, doc_type, title, issued_by, issue_date, expiry_date);
  res.status(201).json({ id });
});

// ─── Compliance ───────────────────────────────────────────────────────────────
app.get('/api/compliance', (req, res) => {
  const db = getDb();
  const checks = db.prepare(`
    SELECT cc.*, p.name as product_name, p.uid as product_uid, p.category
    FROM compliance_checks cc
    JOIN products p ON cc.product_id = p.id
    ORDER BY cc.checked_at DESC
  `).all();
  res.json(checks);
});

app.post('/api/products/:id/compliance', (req, res) => {
  const db = getDb();
  const { regulation, status, checked_by, notes } = req.body;
  if (!regulation) return res.status(400).json({ error: 'regulation required' });

  const id = uuidv4();
  db.prepare(`
    INSERT INTO compliance_checks (id, product_id, regulation, status, checked_by, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(id, req.params.id, regulation, status || 'pending', checked_by, notes);
  res.status(201).json({ id });
});

app.put('/api/compliance/:id', (req, res) => {
  const db = getDb();
  const { status, checked_by, notes } = req.body;
  db.prepare(`
    UPDATE compliance_checks SET status=?, checked_by=?, notes=?, checked_at=datetime('now') WHERE id=?
  `).run(status, checked_by, notes, req.params.id);
  res.json({ success: true });
});

// ─── Analytics ────────────────────────────────────────────────────────────────
app.get('/api/analytics', (req, res) => {
  const db = getDb();
  const sustainability = db.prepare(`
    SELECT category,
      AVG(carbon_footprint) as avg_carbon,
      AVG(recyclability_score) as avg_recyclability,
      AVG(repairability_score) as avg_repairability,
      COUNT(*) as count
    FROM products
    WHERE status = 'active'
    GROUP BY category
  `).all();

  const materialTypes = db.prepare(`SELECT category, material_composition FROM products`).all()
    .flatMap(p => {
      try {
        return JSON.parse(p.material_composition || '[]').map(m => ({ category: p.category, ...m }));
      } catch { return []; }
    });

  const recycledContent = {};
  materialTypes.forEach(m => {
    if (!recycledContent[m.category]) recycledContent[m.category] = { total: 0, recycled: 0 };
    recycledContent[m.category].total += m.percentage || 0;
    recycledContent[m.category].recycled += (m.percentage || 0) * (m.recycled_content || 0) / 100;
  });

  const supplyChainCarbon = db.prepare(`SELECT name, category, supply_chain FROM products`).all()
    .map(p => {
      try {
        const sc = JSON.parse(p.supply_chain || '[]');
        return { name: p.name, category: p.category, stages: sc };
      } catch { return null; }
    }).filter(Boolean);

  const complianceRate = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant,
      SUM(CASE WHEN status = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
      SUM(CASE WHEN status = 'under_review' THEN 1 ELSE 0 END) as under_review
    FROM compliance_checks
  `).get();

  res.json({ sustainability, recycledContent, supplyChainCarbon, complianceRate });
});

// Catch-all: serve React app
app.get('*', (req, res) => {
  const indexPath = path.join(frontendBuild, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) res.status(200).send(`
      <html><body style="font-family:sans-serif;padding:40px;background:#f0f4f8">
      <h1>EU Digital Product Passport Portal</h1>
      <p>Backend is running. Please build the frontend first:</p>
      <pre>cd frontend && npm install && npm run build</pre>
      <p>Or access the API at <a href="/api/dashboard">/api/dashboard</a></p>
      </body></html>
    `);
  });
});

app.listen(PORT, () => {
  console.log(`\n🇪🇺 EU Digital Product Passport Portal`);
  console.log(`   Server running at http://localhost:${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/dashboard\n`);
  getDb(); // Initialize DB on startup
});
