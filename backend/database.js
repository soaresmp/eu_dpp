const Database = require('better-sqlite3');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const DB_PATH = path.join(__dirname, 'dpp.sqlite');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
    seedData();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS stakeholders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('manufacturer','importer','distributor','retailer','recycler','regulator')),
      email TEXT,
      country TEXT NOT NULL,
      registration_number TEXT,
      address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      uid TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT,
      manufacturer_id TEXT REFERENCES stakeholders(id),
      model_number TEXT,
      batch_number TEXT,
      serial_number TEXT,
      description TEXT,
      carbon_footprint REAL,
      carbon_unit TEXT DEFAULT 'kg CO2e',
      recyclability_score INTEGER CHECK(recyclability_score BETWEEN 0 AND 100),
      repairability_score REAL CHECK(repairability_score BETWEEN 0 AND 10),
      durability_rating TEXT CHECK(durability_rating IN ('A','B','C','D','E','F','G')),
      energy_class TEXT CHECK(energy_class IN ('A+++','A++','A+','A','B','C','D','E','F','G')),
      material_composition TEXT DEFAULT '[]',
      hazardous_substances TEXT DEFAULT '[]',
      certifications TEXT DEFAULT '[]',
      supply_chain TEXT DEFAULT '[]',
      warranty_years INTEGER,
      expected_lifetime_years INTEGER,
      weight_kg REAL,
      country_of_origin TEXT,
      end_of_life_instructions TEXT,
      spare_parts_availability TEXT CHECK(spare_parts_availability IN ('available','limited','unavailable')),
      status TEXT DEFAULT 'active' CHECK(status IN ('draft','active','recalled','end_of_life')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS lifecycle_events (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL CHECK(event_type IN ('manufactured','imported','distributed','sold','repaired','updated','recalled','recycled')),
      description TEXT,
      location TEXT,
      actor_id TEXT REFERENCES stakeholders(id),
      metadata TEXT DEFAULT '{}',
      event_date DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      doc_type TEXT NOT NULL CHECK(doc_type IN ('certificate','declaration','test_report','manual','safety_sheet','other')),
      title TEXT NOT NULL,
      filename TEXT,
      issued_by TEXT,
      issue_date DATE,
      expiry_date DATE,
      content_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS compliance_checks (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      regulation TEXT NOT NULL,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending','compliant','non_compliant','under_review')),
      checked_by TEXT,
      notes TEXT,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

function seedData() {
  const count = db.prepare('SELECT COUNT(*) as c FROM stakeholders').get();
  if (count.c > 0) return;

  const insertStakeholder = db.prepare(`
    INSERT INTO stakeholders (id, name, role, email, country, registration_number, address)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertProduct = db.prepare(`
    INSERT INTO products (id, uid, name, category, subcategory, manufacturer_id, model_number, batch_number,
      description, carbon_footprint, recyclability_score, repairability_score, durability_rating,
      energy_class, material_composition, hazardous_substances, certifications, supply_chain,
      warranty_years, expected_lifetime_years, weight_kg, country_of_origin,
      end_of_life_instructions, spare_parts_availability, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertEvent = db.prepare(`
    INSERT INTO lifecycle_events (id, product_id, event_type, description, location, actor_id, event_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertDoc = db.prepare(`
    INSERT INTO documents (id, product_id, doc_type, title, issued_by, issue_date, expiry_date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const insertCompliance = db.prepare(`
    INSERT INTO compliance_checks (id, product_id, regulation, status, checked_by, notes)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  // Stakeholders
  const mfr1 = uuidv4(), mfr2 = uuidv4(), imp1 = uuidv4(), dist1 = uuidv4(), rec1 = uuidv4();
  insertStakeholder.run(mfr1, 'EcoTech GmbH', 'manufacturer', 'compliance@ecotech.de', 'DE', 'HRB-123456', 'Berliner Str. 42, 10115 Berlin, Germany');
  insertStakeholder.run(mfr2, 'GreenTextile SpA', 'manufacturer', 'dpp@greentextile.it', 'IT', 'REA-MI-987654', 'Via Roma 15, 20121 Milan, Italy');
  insertStakeholder.run(imp1, 'EuroImport BV', 'importer', 'imports@euroimport.nl', 'NL', 'KVK-56789012', 'Keizersgracht 1, 1015 Amsterdam, Netherlands');
  insertStakeholder.run(dist1, 'PanEuro Distribution SA', 'distributor', 'ops@paneuro.fr', 'FR', 'SIREN-123456789', '15 Rue de la Paix, 75001 Paris, France');
  insertStakeholder.run(rec1, 'CircularLife AS', 'recycler', 'process@circularlife.se', 'SE', 'SE556789-1234', 'Industrivägen 7, 17048 Stockholm, Sweden');

  // Products
  const p1 = uuidv4(), p2 = uuidv4(), p3 = uuidv4(), p4 = uuidv4();
  const uid1 = `EU-DPP-${Date.now()}-001`;
  const uid2 = `EU-DPP-${Date.now()}-002`;
  const uid3 = `EU-DPP-${Date.now()}-003`;
  const uid4 = `EU-DPP-${Date.now()}-004`;

  insertProduct.run(
    p1, uid1, 'ProWash EcoSeries 9000', 'Appliances', 'Washing Machines', mfr1, 'PW-ES-9000', 'BATCH-2024-001',
    'High-efficiency washing machine with A+++ energy rating and 60% recycled plastic components.',
    245.8, 78, 8.5, 'A', 'A+++',
    JSON.stringify([
      { material: 'Steel', percentage: 45, recycled_content: 30, origin: 'DE' },
      { material: 'Recycled Plastic (PP)', percentage: 25, recycled_content: 60, origin: 'EU' },
      { material: 'Copper', percentage: 8, recycled_content: 20, origin: 'CL' },
      { material: 'Aluminum', percentage: 7, recycled_content: 40, origin: 'NO' },
      { material: 'Glass', percentage: 5, recycled_content: 10, origin: 'DE' },
      { material: 'Rubber/Seals', percentage: 3, recycled_content: 0, origin: 'MY' },
      { material: 'Electronics', percentage: 7, recycled_content: 15, origin: 'EU' }
    ]),
    JSON.stringify([
      { name: 'Lead (Pb)', cas: '7439-92-1', concentration_ppm: 0.08, threshold_ppm: 1.0, compliant: true },
      { name: 'Mercury (Hg)', cas: '7439-97-6', concentration_ppm: 0.001, threshold_ppm: 0.1, compliant: true }
    ]),
    JSON.stringify([
      { name: 'CE Marking', number: 'CE-2024-DE-4521', issuer: 'TÜV Rheinland', valid_until: '2027-01-01' },
      { name: 'Energy Star', number: 'ES-EU-78921', issuer: 'EU Commission', valid_until: '2026-06-30' },
      { name: 'EU Ecolabel', number: 'DE/030/001', issuer: 'Federal Environment Agency', valid_until: '2026-12-31' }
    ]),
    JSON.stringify([
      { stage: 'Raw Materials', location: 'Germany/Norway', supplier: 'EuroSteel AG', carbon_kg: 85.2 },
      { stage: 'Component Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 62.4 },
      { stage: 'Assembly', location: 'Berlin, Germany', supplier: 'EcoTech GmbH', carbon_kg: 28.1 },
      { stage: 'Packaging', location: 'Germany', supplier: 'GreenPack GmbH', carbon_kg: 12.3 },
      { stage: 'Transport to EU Market', location: 'EU', supplier: 'DHL GoGreen', carbon_kg: 57.8 }
    ]),
    5, 15, 68.5, 'DE',
    'Disassemble drum and motor for metal recycling. Remove electronic control board for WEEE processing. Plastic parts marked for polymer separation. Contact CircularLife for free take-back.',
    'available', 'active'
  );

  insertProduct.run(
    p2, uid2, 'SolarMax Pro 400W Panel', 'Electronics', 'Solar Panels', mfr1, 'SM-PRO-400', 'BATCH-2024-007',
    'High-efficiency monocrystalline solar panel with 25-year performance warranty.',
    180.2, 85, 6.0, 'A', null,
    JSON.stringify([
      { material: 'Silicon (monocrystalline)', percentage: 35, recycled_content: 5, origin: 'DE' },
      { material: 'Aluminum Frame', percentage: 30, recycled_content: 60, origin: 'EU' },
      { material: 'Tempered Glass', percentage: 25, recycled_content: 20, origin: 'DE' },
      { material: 'Copper Wiring', percentage: 5, recycled_content: 30, origin: 'EU' },
      { material: 'EVA Encapsulant', percentage: 5, recycled_content: 0, origin: 'CN' }
    ]),
    JSON.stringify([
      { name: 'Cadmium (Cd)', cas: '7440-43-9', concentration_ppm: 0.002, threshold_ppm: 0.01, compliant: true }
    ]),
    JSON.stringify([
      { name: 'CE Marking', number: 'CE-2024-DE-8812', issuer: 'TÜV SÜD', valid_until: '2027-03-01' },
      { name: 'IEC 61215', number: 'IEC-2024-7721', issuer: 'Intertek', valid_until: '2029-01-01' },
      { name: 'MCS Certification', number: 'MCS-0019-0001', issuer: 'MCS', valid_until: '2026-09-30' }
    ]),
    JSON.stringify([
      { stage: 'Silicon Production', location: 'Germany', supplier: 'Wacker Chemie', carbon_kg: 62.1 },
      { stage: 'Cell Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 45.3 },
      { stage: 'Module Assembly', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 38.7 },
      { stage: 'Transport', location: 'EU', supplier: 'DB Cargo', carbon_kg: 34.1 }
    ]),
    10, 30, 21.3, 'DE',
    'Aluminum frame 100% recyclable. Silicon cells require specialist PV recycling. Do not landfill. Contact manufacturer for end-of-life program.',
    'available', 'active'
  );

  insertProduct.run(
    p3, uid3, 'EcoWeave Organic T-Shirt', 'Textiles', 'Apparel', mfr2, 'EW-TS-100', 'BATCH-2024-T001',
    '100% organic cotton t-shirt produced under Fair Trade conditions with GOTS certification.',
    3.2, 92, null, 'B', null,
    JSON.stringify([
      { material: 'Organic Cotton', percentage: 95, recycled_content: 0, origin: 'IN' },
      { material: 'Natural Dyes', percentage: 3, recycled_content: 0, origin: 'IT' },
      { material: 'Organic Thread', percentage: 2, recycled_content: 0, origin: 'IT' }
    ]),
    JSON.stringify([]),
    JSON.stringify([
      { name: 'GOTS Certification', number: 'GOTS-IT-4521', issuer: 'Control Union', valid_until: '2025-12-31' },
      { name: 'Fair Trade', number: 'FT-2024-8821', issuer: 'Fairtrade International', valid_until: '2025-08-31' },
      { name: 'OEKO-TEX Standard 100', number: 'OT-1234567', issuer: 'OEKO-TEX Association', valid_until: '2025-10-31' }
    ]),
    JSON.stringify([
      { stage: 'Cotton Farming', location: 'India (Gujarat)', supplier: 'Organic Farms Co-op', carbon_kg: 0.8 },
      { stage: 'Spinning & Weaving', location: 'India', supplier: 'EcoSpin Ltd', carbon_kg: 0.6 },
      { stage: 'Dyeing & Finishing', location: 'Italy', supplier: 'GreenTextile SpA', carbon_kg: 0.9 },
      { stage: 'Manufacturing', location: 'Milan, Italy', supplier: 'GreenTextile SpA', carbon_kg: 0.5 },
      { stage: 'Transport', location: 'EU', supplier: 'DHL GoGreen', carbon_kg: 0.4 }
    ]),
    null, 5, 0.22, 'IN',
    'Compostable if undyed. For dyed items, donate or use textile recycling bins. Do not mix with food waste. Compatible with H&M Conscious Drop-off program.',
    'limited', 'active'
  );

  insertProduct.run(
    p4, uid4, 'LithiumPack EV 75kWh', 'Batteries', 'EV Batteries', mfr1, 'LP-EV-75', 'BATCH-2024-B003',
    'High-capacity lithium-ion battery pack for electric vehicles, compliant with EU Battery Regulation 2023/1542.',
    8420.0, 72, 7.8, 'B', null,
    JSON.stringify([
      { material: 'Lithium Carbonate', percentage: 12, recycled_content: 8, origin: 'CL' },
      { material: 'Nickel Manganese Cobalt (NMC)', percentage: 28, recycled_content: 12, origin: 'BE' },
      { material: 'Graphite (Anode)', percentage: 18, recycled_content: 5, origin: 'CN' },
      { material: 'Aluminum (Casing)', percentage: 20, recycled_content: 45, origin: 'NO' },
      { material: 'Copper (Current Collectors)', percentage: 8, recycled_content: 25, origin: 'EU' },
      { material: 'Electrolyte', percentage: 8, recycled_content: 0, origin: 'DE' },
      { material: 'BMS Electronics', percentage: 6, recycled_content: 10, origin: 'EU' }
    ]),
    JSON.stringify([
      { name: 'Cobalt (Co)', cas: '7440-48-4', concentration_ppm: 180000, threshold_ppm: null, compliant: true },
      { name: 'Lithium (Li)', cas: '7439-93-2', concentration_ppm: 70000, threshold_ppm: null, compliant: true },
      { name: 'Nickel (Ni)', cas: '7440-02-0', concentration_ppm: 210000, threshold_ppm: null, compliant: true }
    ]),
    JSON.stringify([
      { name: 'EU Battery Regulation', number: 'BR-2023-DE-0012', issuer: 'Federal Network Agency', valid_until: '2028-01-01' },
      { name: 'UN38.3 Transport', number: 'UN383-2024-TÜV', issuer: 'TÜV Rheinland', valid_until: '2027-06-30' },
      { name: 'CE Marking', number: 'CE-2024-DE-9955', issuer: 'Bureau Veritas', valid_until: '2027-01-01' }
    ]),
    JSON.stringify([
      { stage: 'Lithium Mining', location: 'Chile (Atacama)', supplier: 'SQM S.A.', carbon_kg: 1240.0 },
      { stage: 'Cathode Production', location: 'Belgium', supplier: 'Umicore NV', carbon_kg: 2180.0 },
      { stage: 'Cell Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 2650.0 },
      { stage: 'Pack Assembly', location: 'Berlin, Germany', supplier: 'EcoTech GmbH', carbon_kg: 1890.0 },
      { stage: 'Transport & Distribution', location: 'EU', supplier: 'DB Schenker', carbon_kg: 460.0 }
    ]),
    8, 12, 480.0, 'DE',
    'Must be returned to authorized battery recycler. Contains critical raw materials - cobalt and lithium MUST be recovered. Contact manufacturer for take-back scheme. Do NOT dispose in general waste.',
    'available', 'active'
  );

  // Lifecycle Events
  const now = new Date();
  const daysAgo = (n) => new Date(now - n * 86400000).toISOString();

  insertEvent.run(uuidv4(), p1, 'manufactured', 'Product manufactured at Berlin facility', 'Berlin, Germany', mfr1, daysAgo(180));
  insertEvent.run(uuidv4(), p1, 'imported', 'Imported to Netherlands distribution center', 'Amsterdam, Netherlands', imp1, daysAgo(165));
  insertEvent.run(uuidv4(), p1, 'distributed', 'Distributed to French retail network', 'Paris, France', dist1, daysAgo(150));
  insertEvent.run(uuidv4(), p1, 'sold', 'Sold to end consumer', 'Lyon, France', dist1, daysAgo(120));
  insertEvent.run(uuidv4(), p1, 'repaired', 'Drum bearing replacement - warranty repair', 'Lyon, France', mfr1, daysAgo(30));

  insertEvent.run(uuidv4(), p2, 'manufactured', 'Panel manufactured at Berlin facility', 'Berlin, Germany', mfr1, daysAgo(90));
  insertEvent.run(uuidv4(), p2, 'distributed', 'Distributed to Nordic market', 'Copenhagen, Denmark', dist1, daysAgo(75));
  insertEvent.run(uuidv4(), p2, 'sold', 'Sold to commercial solar installer', 'Stockholm, Sweden', dist1, daysAgo(60));

  insertEvent.run(uuidv4(), p3, 'manufactured', 'Produced at certified facility in Milan', 'Milan, Italy', mfr2, daysAgo(45));
  insertEvent.run(uuidv4(), p3, 'distributed', 'Distributed across EU retail', 'Amsterdam, Netherlands', imp1, daysAgo(30));

  insertEvent.run(uuidv4(), p4, 'manufactured', 'Battery pack assembled at Berlin gigafactory', 'Berlin, Germany', mfr1, daysAgo(200));
  insertEvent.run(uuidv4(), p4, 'distributed', 'Shipped to EV manufacturer', 'Munich, Germany', dist1, daysAgo(185));
  insertEvent.run(uuidv4(), p4, 'sold', 'Installed in EV - VIN DE112233445566', 'Munich, Germany', dist1, daysAgo(170));
  insertEvent.run(uuidv4(), p4, 'updated', 'BMS firmware update v2.4.1 applied', 'Remote OTA', mfr1, daysAgo(30));

  // Documents
  insertDoc.run(uuidv4(), p1, 'declaration', 'EU Declaration of Conformity', 'EcoTech GmbH', '2024-01-15', '2027-01-15');
  insertDoc.run(uuidv4(), p1, 'certificate', 'CE Certificate - EN 60335-2-7', 'TÜV Rheinland', '2024-01-10', '2027-01-10');
  insertDoc.run(uuidv4(), p1, 'test_report', 'Energy Efficiency Test Report', 'Intertek', '2024-01-08', '2026-12-31');
  insertDoc.run(uuidv4(), p1, 'manual', 'User Manual & Repair Guide', 'EcoTech GmbH', '2024-01-15', null);

  insertDoc.run(uuidv4(), p2, 'certificate', 'IEC 61215 Type Approval', 'TÜV SÜD', '2024-02-01', '2027-02-01');
  insertDoc.run(uuidv4(), p2, 'declaration', 'EU Declaration of Conformity', 'EcoTech GmbH', '2024-02-10', '2027-02-10');

  insertDoc.run(uuidv4(), p3, 'certificate', 'GOTS Scope Certificate', 'Control Union', '2024-03-01', '2025-12-31');
  insertDoc.run(uuidv4(), p3, 'certificate', 'Fair Trade Certificate', 'Fairtrade International', '2024-03-05', '2025-08-31');

  insertDoc.run(uuidv4(), p4, 'certificate', 'EU Battery Regulation Compliance', 'Federal Network Agency', '2024-01-20', '2028-01-20');
  insertDoc.run(uuidv4(), p4, 'test_report', 'UN38.3 Safety Test Report', 'TÜV Rheinland', '2024-01-18', '2027-06-30');
  insertDoc.run(uuidv4(), p4, 'safety_sheet', 'Safety Data Sheet - Lithium Battery', 'EcoTech GmbH', '2024-01-15', null);

  // Compliance Checks
  insertCompliance.run(uuidv4(), p1, 'ESPR Regulation (EU) 2024/1781', 'compliant', 'EU Compliance Team', 'All ecodesign requirements met');
  insertCompliance.run(uuidv4(), p1, 'RoHS Directive 2011/65/EU', 'compliant', 'EU Compliance Team', 'Hazardous substance levels below thresholds');
  insertCompliance.run(uuidv4(), p1, 'WEEE Directive 2012/19/EU', 'compliant', 'EU Compliance Team', 'Take-back scheme registered');
  insertCompliance.run(uuidv4(), p2, 'ESPR Regulation (EU) 2024/1781', 'compliant', 'EU Compliance Team', 'Solar panel requirements met');
  insertCompliance.run(uuidv4(), p2, 'RoHS Directive 2011/65/EU', 'compliant', 'EU Compliance Team', 'Compliant');
  insertCompliance.run(uuidv4(), p3, 'ESPR Regulation (EU) 2024/1781', 'compliant', 'EU Compliance Team', 'Textile product requirements met');
  insertCompliance.run(uuidv4(), p3, 'REACH Regulation (EC) No 1907/2006', 'compliant', 'EU Compliance Team', 'No SVHC above 0.1% threshold');
  insertCompliance.run(uuidv4(), p4, 'EU Battery Regulation 2023/1542', 'compliant', 'EU Compliance Team', 'Battery passport requirements met');
  insertCompliance.run(uuidv4(), p4, 'ESPR Regulation (EU) 2024/1781', 'under_review', 'EU Compliance Team', 'Pending final review for 2024 requirements');
}

module.exports = { getDb };
