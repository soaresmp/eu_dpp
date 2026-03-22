// Static dataset for GitHub Pages deployment (no backend required)
// This mirrors the data seeded in database.js

const MFR1_ID = 'mfr-ecotech-001';
const MFR2_ID = 'mfr-greentextile-002';
const IMP1_ID = 'imp-euroimport-001';
const DIST1_ID = 'dist-paneuro-001';
const REC1_ID = 'rec-circularlife-001';

export const STAKEHOLDERS = [
  { id: MFR1_ID, name: 'EcoTech GmbH', role: 'manufacturer', email: 'compliance@ecotech.de', country: 'DE', registration_number: 'HRB-123456', address: 'Berliner Str. 42, 10115 Berlin, Germany' },
  { id: MFR2_ID, name: 'GreenTextile SpA', role: 'manufacturer', email: 'dpp@greentextile.it', country: 'IT', registration_number: 'REA-MI-987654', address: 'Via Roma 15, 20121 Milan, Italy' },
  { id: IMP1_ID, name: 'EuroImport BV', role: 'importer', email: 'imports@euroimport.nl', country: 'NL', registration_number: 'KVK-56789012', address: 'Keizersgracht 1, 1015 Amsterdam, Netherlands' },
  { id: DIST1_ID, name: 'PanEuro Distribution SA', role: 'distributor', email: 'ops@paneuro.fr', country: 'FR', registration_number: 'SIREN-123456789', address: '15 Rue de la Paix, 75001 Paris, France' },
  { id: REC1_ID, name: 'CircularLife AS', role: 'recycler', email: 'process@circularlife.se', country: 'SE', registration_number: 'SE556789-1234', address: 'Industrivägen 7, 17048 Stockholm, Sweden' },
];

const daysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString();

export const PRODUCTS = [
  {
    id: 'prod-pw9000-001', uid: 'EU-DPP-2024-PW9000',
    name: 'ProWash EcoSeries 9000', category: 'Appliances', subcategory: 'Washing Machines',
    manufacturer_id: MFR1_ID, manufacturer_name: 'EcoTech GmbH', manufacturer_country: 'DE',
    model_number: 'PW-ES-9000', batch_number: 'BATCH-2024-001',
    description: 'High-efficiency washing machine with A+++ energy rating and 60% recycled plastic components.',
    carbon_footprint: 245.8, carbon_unit: 'kg CO2e',
    recyclability_score: 78, repairability_score: 8.5,
    durability_rating: 'A', energy_class: 'A+++',
    warranty_years: 5, expected_lifetime_years: 15,
    weight_kg: 68.5, country_of_origin: 'DE',
    spare_parts_availability: 'available', status: 'active',
    end_of_life_instructions: 'Disassemble drum and motor for metal recycling. Remove electronic control board for WEEE processing. Plastic parts marked for polymer separation. Contact CircularLife for free take-back.',
    material_composition: [
      { material: 'Steel', percentage: 45, recycled_content: 30, origin: 'DE' },
      { material: 'Recycled Plastic (PP)', percentage: 25, recycled_content: 60, origin: 'EU' },
      { material: 'Copper', percentage: 8, recycled_content: 20, origin: 'CL' },
      { material: 'Aluminum', percentage: 7, recycled_content: 40, origin: 'NO' },
      { material: 'Glass', percentage: 5, recycled_content: 10, origin: 'DE' },
      { material: 'Rubber/Seals', percentage: 3, recycled_content: 0, origin: 'MY' },
      { material: 'Electronics', percentage: 7, recycled_content: 15, origin: 'EU' },
    ],
    hazardous_substances: [
      { name: 'Lead (Pb)', cas: '7439-92-1', concentration_ppm: 0.08, threshold_ppm: 1.0, compliant: true },
      { name: 'Mercury (Hg)', cas: '7439-97-6', concentration_ppm: 0.001, threshold_ppm: 0.1, compliant: true },
    ],
    certifications: [
      { name: 'CE Marking', number: 'CE-2024-DE-4521', issuer: 'TÜV Rheinland', valid_until: '2027-01-01' },
      { name: 'Energy Star', number: 'ES-EU-78921', issuer: 'EU Commission', valid_until: '2026-06-30' },
      { name: 'EU Ecolabel', number: 'DE/030/001', issuer: 'Federal Environment Agency', valid_until: '2026-12-31' },
    ],
    supply_chain: [
      { stage: 'Raw Materials', location: 'Germany/Norway', supplier: 'EuroSteel AG', carbon_kg: 85.2 },
      { stage: 'Component Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 62.4 },
      { stage: 'Assembly', location: 'Berlin, Germany', supplier: 'EcoTech GmbH', carbon_kg: 28.1 },
      { stage: 'Packaging', location: 'Germany', supplier: 'GreenPack GmbH', carbon_kg: 12.3 },
      { stage: 'Transport to EU Market', location: 'EU', supplier: 'DHL GoGreen', carbon_kg: 57.8 },
    ],
    lifecycle_events: [
      { id: 'e1', event_type: 'manufactured', description: 'Product manufactured at Berlin facility', location: 'Berlin, Germany', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(180) },
      { id: 'e2', event_type: 'imported', description: 'Imported to Netherlands distribution center', location: 'Amsterdam, Netherlands', actor_name: 'EuroImport BV', actor_role: 'importer', event_date: daysAgo(165) },
      { id: 'e3', event_type: 'distributed', description: 'Distributed to French retail network', location: 'Paris, France', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(150) },
      { id: 'e4', event_type: 'sold', description: 'Sold to end consumer', location: 'Lyon, France', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(120) },
      { id: 'e5', event_type: 'repaired', description: 'Drum bearing replacement - warranty repair', location: 'Lyon, France', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(30) },
    ],
    documents: [
      { id: 'd1', doc_type: 'declaration', title: 'EU Declaration of Conformity', issued_by: 'EcoTech GmbH', issue_date: '2024-01-15', expiry_date: '2027-01-15' },
      { id: 'd2', doc_type: 'certificate', title: 'CE Certificate - EN 60335-2-7', issued_by: 'TÜV Rheinland', issue_date: '2024-01-10', expiry_date: '2027-01-10' },
      { id: 'd3', doc_type: 'test_report', title: 'Energy Efficiency Test Report', issued_by: 'Intertek', issue_date: '2024-01-08', expiry_date: '2026-12-31' },
      { id: 'd4', doc_type: 'manual', title: 'User Manual & Repair Guide', issued_by: 'EcoTech GmbH', issue_date: '2024-01-15', expiry_date: null },
    ],
    compliance_checks: [
      { id: 'c1', regulation: 'ESPR Regulation (EU) 2024/1781', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'All ecodesign requirements met', checked_at: daysAgo(10) },
      { id: 'c2', regulation: 'RoHS Directive 2011/65/EU', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Hazardous substance levels below thresholds', checked_at: daysAgo(10) },
      { id: 'c3', regulation: 'WEEE Directive 2012/19/EU', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Take-back scheme registered', checked_at: daysAgo(10) },
    ],
    created_at: daysAgo(190), updated_at: daysAgo(5),
  },
  {
    id: 'prod-smpro400-002', uid: 'EU-DPP-2024-SM400',
    name: 'SolarMax Pro 400W Panel', category: 'Electronics', subcategory: 'Solar Panels',
    manufacturer_id: MFR1_ID, manufacturer_name: 'EcoTech GmbH', manufacturer_country: 'DE',
    model_number: 'SM-PRO-400', batch_number: 'BATCH-2024-007',
    description: 'High-efficiency monocrystalline solar panel with 25-year performance warranty.',
    carbon_footprint: 180.2, carbon_unit: 'kg CO2e',
    recyclability_score: 85, repairability_score: 6.0,
    durability_rating: 'A', energy_class: null,
    warranty_years: 10, expected_lifetime_years: 30,
    weight_kg: 21.3, country_of_origin: 'DE',
    spare_parts_availability: 'available', status: 'active',
    end_of_life_instructions: 'Aluminum frame 100% recyclable. Silicon cells require specialist PV recycling. Do not landfill. Contact manufacturer for end-of-life program.',
    material_composition: [
      { material: 'Silicon (monocrystalline)', percentage: 35, recycled_content: 5, origin: 'DE' },
      { material: 'Aluminum Frame', percentage: 30, recycled_content: 60, origin: 'EU' },
      { material: 'Tempered Glass', percentage: 25, recycled_content: 20, origin: 'DE' },
      { material: 'Copper Wiring', percentage: 5, recycled_content: 30, origin: 'EU' },
      { material: 'EVA Encapsulant', percentage: 5, recycled_content: 0, origin: 'CN' },
    ],
    hazardous_substances: [
      { name: 'Cadmium (Cd)', cas: '7440-43-9', concentration_ppm: 0.002, threshold_ppm: 0.01, compliant: true },
    ],
    certifications: [
      { name: 'CE Marking', number: 'CE-2024-DE-8812', issuer: 'TÜV SÜD', valid_until: '2027-03-01' },
      { name: 'IEC 61215', number: 'IEC-2024-7721', issuer: 'Intertek', valid_until: '2029-01-01' },
    ],
    supply_chain: [
      { stage: 'Silicon Production', location: 'Germany', supplier: 'Wacker Chemie', carbon_kg: 62.1 },
      { stage: 'Cell Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 45.3 },
      { stage: 'Module Assembly', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 38.7 },
      { stage: 'Transport', location: 'EU', supplier: 'DB Cargo', carbon_kg: 34.1 },
    ],
    lifecycle_events: [
      { id: 'e6', event_type: 'manufactured', description: 'Panel manufactured at Berlin facility', location: 'Berlin, Germany', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(90) },
      { id: 'e7', event_type: 'distributed', description: 'Distributed to Nordic market', location: 'Copenhagen, Denmark', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(75) },
      { id: 'e8', event_type: 'sold', description: 'Sold to commercial solar installer', location: 'Stockholm, Sweden', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(60) },
    ],
    documents: [
      { id: 'd5', doc_type: 'certificate', title: 'IEC 61215 Type Approval', issued_by: 'TÜV SÜD', issue_date: '2024-02-01', expiry_date: '2027-02-01' },
      { id: 'd6', doc_type: 'declaration', title: 'EU Declaration of Conformity', issued_by: 'EcoTech GmbH', issue_date: '2024-02-10', expiry_date: '2027-02-10' },
    ],
    compliance_checks: [
      { id: 'c4', regulation: 'ESPR Regulation (EU) 2024/1781', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Solar panel requirements met', checked_at: daysAgo(15) },
      { id: 'c5', regulation: 'RoHS Directive 2011/65/EU', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Compliant', checked_at: daysAgo(15) },
    ],
    created_at: daysAgo(100), updated_at: daysAgo(20),
  },
  {
    id: 'prod-ewts100-003', uid: 'EU-DPP-2024-EWTS',
    name: 'EcoWeave Organic T-Shirt', category: 'Textiles', subcategory: 'Apparel',
    manufacturer_id: MFR2_ID, manufacturer_name: 'GreenTextile SpA', manufacturer_country: 'IT',
    model_number: 'EW-TS-100', batch_number: 'BATCH-2024-T001',
    description: '100% organic cotton t-shirt produced under Fair Trade conditions with GOTS certification.',
    carbon_footprint: 3.2, carbon_unit: 'kg CO2e',
    recyclability_score: 92, repairability_score: null,
    durability_rating: 'B', energy_class: null,
    warranty_years: null, expected_lifetime_years: 5,
    weight_kg: 0.22, country_of_origin: 'IN',
    spare_parts_availability: 'limited', status: 'active',
    end_of_life_instructions: 'Compostable if undyed. For dyed items, donate or use textile recycling bins. Compatible with H&M Conscious Drop-off program.',
    material_composition: [
      { material: 'Organic Cotton', percentage: 95, recycled_content: 0, origin: 'IN' },
      { material: 'Natural Dyes', percentage: 3, recycled_content: 0, origin: 'IT' },
      { material: 'Organic Thread', percentage: 2, recycled_content: 0, origin: 'IT' },
    ],
    hazardous_substances: [],
    certifications: [
      { name: 'GOTS Certification', number: 'GOTS-IT-4521', issuer: 'Control Union', valid_until: '2025-12-31' },
      { name: 'Fair Trade', number: 'FT-2024-8821', issuer: 'Fairtrade International', valid_until: '2025-08-31' },
      { name: 'OEKO-TEX Standard 100', number: 'OT-1234567', issuer: 'OEKO-TEX Association', valid_until: '2025-10-31' },
    ],
    supply_chain: [
      { stage: 'Cotton Farming', location: 'India (Gujarat)', supplier: 'Organic Farms Co-op', carbon_kg: 0.8 },
      { stage: 'Spinning & Weaving', location: 'India', supplier: 'EcoSpin Ltd', carbon_kg: 0.6 },
      { stage: 'Dyeing & Finishing', location: 'Italy', supplier: 'GreenTextile SpA', carbon_kg: 0.9 },
      { stage: 'Manufacturing', location: 'Milan, Italy', supplier: 'GreenTextile SpA', carbon_kg: 0.5 },
      { stage: 'Transport', location: 'EU', supplier: 'DHL GoGreen', carbon_kg: 0.4 },
    ],
    lifecycle_events: [
      { id: 'e9', event_type: 'manufactured', description: 'Produced at certified facility in Milan', location: 'Milan, Italy', actor_name: 'GreenTextile SpA', actor_role: 'manufacturer', event_date: daysAgo(45) },
      { id: 'e10', event_type: 'distributed', description: 'Distributed across EU retail', location: 'Amsterdam, Netherlands', actor_name: 'EuroImport BV', actor_role: 'importer', event_date: daysAgo(30) },
    ],
    documents: [
      { id: 'd7', doc_type: 'certificate', title: 'GOTS Scope Certificate', issued_by: 'Control Union', issue_date: '2024-03-01', expiry_date: '2025-12-31' },
      { id: 'd8', doc_type: 'certificate', title: 'Fair Trade Certificate', issued_by: 'Fairtrade International', issue_date: '2024-03-05', expiry_date: '2025-08-31' },
    ],
    compliance_checks: [
      { id: 'c6', regulation: 'ESPR Regulation (EU) 2024/1781', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Textile product requirements met', checked_at: daysAgo(20) },
      { id: 'c7', regulation: 'REACH Regulation (EC) No 1907/2006', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'No SVHC above 0.1% threshold', checked_at: daysAgo(20) },
    ],
    created_at: daysAgo(50), updated_at: daysAgo(10),
  },
  {
    id: 'prod-lpev75-004', uid: 'EU-DPP-2024-LP75',
    name: 'LithiumPack EV 75kWh', category: 'Batteries', subcategory: 'EV Batteries',
    manufacturer_id: MFR1_ID, manufacturer_name: 'EcoTech GmbH', manufacturer_country: 'DE',
    model_number: 'LP-EV-75', batch_number: 'BATCH-2024-B003',
    description: 'High-capacity lithium-ion battery pack for electric vehicles, compliant with EU Battery Regulation 2023/1542.',
    carbon_footprint: 8420.0, carbon_unit: 'kg CO2e',
    recyclability_score: 72, repairability_score: 7.8,
    durability_rating: 'B', energy_class: null,
    warranty_years: 8, expected_lifetime_years: 12,
    weight_kg: 480.0, country_of_origin: 'DE',
    spare_parts_availability: 'available', status: 'active',
    end_of_life_instructions: 'Must be returned to authorized battery recycler. Contains critical raw materials — cobalt and lithium MUST be recovered. Contact manufacturer for take-back scheme.',
    material_composition: [
      { material: 'Lithium Carbonate', percentage: 12, recycled_content: 8, origin: 'CL' },
      { material: 'Nickel Manganese Cobalt (NMC)', percentage: 28, recycled_content: 12, origin: 'BE' },
      { material: 'Graphite (Anode)', percentage: 18, recycled_content: 5, origin: 'CN' },
      { material: 'Aluminum (Casing)', percentage: 20, recycled_content: 45, origin: 'NO' },
      { material: 'Copper (Current Collectors)', percentage: 8, recycled_content: 25, origin: 'EU' },
      { material: 'Electrolyte', percentage: 8, recycled_content: 0, origin: 'DE' },
      { material: 'BMS Electronics', percentage: 6, recycled_content: 10, origin: 'EU' },
    ],
    hazardous_substances: [
      { name: 'Cobalt (Co)', cas: '7440-48-4', concentration_ppm: 180000, threshold_ppm: null, compliant: true },
      { name: 'Lithium (Li)', cas: '7439-93-2', concentration_ppm: 70000, threshold_ppm: null, compliant: true },
      { name: 'Nickel (Ni)', cas: '7440-02-0', concentration_ppm: 210000, threshold_ppm: null, compliant: true },
    ],
    certifications: [
      { name: 'EU Battery Regulation', number: 'BR-2023-DE-0012', issuer: 'Federal Network Agency', valid_until: '2028-01-01' },
      { name: 'UN38.3 Transport', number: 'UN383-2024-TÜV', issuer: 'TÜV Rheinland', valid_until: '2027-06-30' },
      { name: 'CE Marking', number: 'CE-2024-DE-9955', issuer: 'Bureau Veritas', valid_until: '2027-01-01' },
    ],
    supply_chain: [
      { stage: 'Lithium Mining', location: 'Chile (Atacama)', supplier: 'SQM S.A.', carbon_kg: 1240.0 },
      { stage: 'Cathode Production', location: 'Belgium', supplier: 'Umicore NV', carbon_kg: 2180.0 },
      { stage: 'Cell Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 2650.0 },
      { stage: 'Pack Assembly', location: 'Berlin, Germany', supplier: 'EcoTech GmbH', carbon_kg: 1890.0 },
      { stage: 'Transport & Distribution', location: 'EU', supplier: 'DB Schenker', carbon_kg: 460.0 },
    ],
    lifecycle_events: [
      { id: 'e11', event_type: 'manufactured', description: 'Battery pack assembled at Berlin gigafactory', location: 'Berlin, Germany', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(200) },
      { id: 'e12', event_type: 'distributed', description: 'Shipped to EV manufacturer', location: 'Munich, Germany', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(185) },
      { id: 'e13', event_type: 'sold', description: 'Installed in EV - VIN DE112233445566', location: 'Munich, Germany', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(170) },
      { id: 'e14', event_type: 'updated', description: 'BMS firmware update v2.4.1 applied', location: 'Remote OTA', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(30) },
    ],
    documents: [
      { id: 'd9', doc_type: 'certificate', title: 'EU Battery Regulation Compliance', issued_by: 'Federal Network Agency', issue_date: '2024-01-20', expiry_date: '2028-01-20' },
      { id: 'd10', doc_type: 'test_report', title: 'UN38.3 Safety Test Report', issued_by: 'TÜV Rheinland', issue_date: '2024-01-18', expiry_date: '2027-06-30' },
      { id: 'd11', doc_type: 'safety_sheet', title: 'Safety Data Sheet - Lithium Battery', issued_by: 'EcoTech GmbH', issue_date: '2024-01-15', expiry_date: null },
    ],
    compliance_checks: [
      { id: 'c8', regulation: 'EU Battery Regulation 2023/1542', status: 'compliant', checked_by: 'EU Compliance Team', notes: 'Battery passport requirements met', checked_at: daysAgo(25) },
      { id: 'c9', regulation: 'ESPR Regulation (EU) 2024/1781', status: 'under_review', checked_by: 'EU Compliance Team', notes: 'Pending final review for 2024 requirements', checked_at: daysAgo(25) },
    ],
    created_at: daysAgo(210), updated_at: daysAgo(5),
  },
  {
    id: 'prod-heatflow300-005', uid: 'EU-DPP-2024-HF300',
    name: 'HeatFlow 300 Space Heater', category: 'Appliances', subcategory: 'Heating',
    manufacturer_id: MFR1_ID, manufacturer_name: 'EcoTech GmbH', manufacturer_country: 'DE',
    model_number: 'HF-300-EU', batch_number: 'BATCH-2023-H112',
    description: 'Compact 3000W electric space heater. RECALLED due to overheating risk — fire hazard identified in units from batch BATCH-2023-H112.',
    carbon_footprint: 98.4, carbon_unit: 'kg CO2e',
    recyclability_score: 61, repairability_score: 5.5,
    durability_rating: 'C', energy_class: 'D',
    warranty_years: 2, expected_lifetime_years: 8,
    weight_kg: 3.2, country_of_origin: 'DE',
    spare_parts_availability: 'unavailable', status: 'recalled',
    recall_reason: 'Overheating defect — internal thermal fuse fails under sustained load, creating fire hazard. Affected batch: BATCH-2023-H112. Do NOT use. Return immediately.',
    recall_date: daysAgo(14),
    recall_reference: 'RAPEX-2024-A12-0712-DE',
    end_of_life_instructions: 'Do not use. Unplug immediately. Return to point of purchase or contact EcoTech GmbH for free collection.',
    material_composition: [
      { material: 'Steel Housing', percentage: 55, recycled_content: 25, origin: 'DE' },
      { material: 'Plastic (ABS)', percentage: 25, recycled_content: 10, origin: 'EU' },
      { material: 'Copper (Wiring)', percentage: 10, recycled_content: 20, origin: 'EU' },
      { material: 'Ceramic Element', percentage: 10, recycled_content: 0, origin: 'CN' },
    ],
    hazardous_substances: [
      { name: 'Lead (Pb)', cas: '7439-92-1', concentration_ppm: 0.09, threshold_ppm: 1.0, compliant: true },
    ],
    certifications: [
      { name: 'CE Marking', number: 'CE-2023-DE-3301', issuer: 'TÜV Rheinland', valid_until: '2026-01-01' },
    ],
    supply_chain: [
      { stage: 'Component Manufacturing', location: 'Germany', supplier: 'EcoTech GmbH', carbon_kg: 38.2 },
      { stage: 'Assembly', location: 'Berlin, Germany', supplier: 'EcoTech GmbH', carbon_kg: 22.1 },
      { stage: 'Transport', location: 'EU', supplier: 'DHL', carbon_kg: 38.1 },
    ],
    lifecycle_events: [
      { id: 'e20', event_type: 'manufactured', description: 'Manufactured at Berlin facility', location: 'Berlin, Germany', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(400) },
      { id: 'e21', event_type: 'distributed', description: 'Distributed to EU retailers', location: 'EU', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(380) },
      { id: 'e22', event_type: 'sold', description: 'Units sold across EU market', location: 'Various EU countries', actor_name: 'PanEuro Distribution SA', actor_role: 'distributor', event_date: daysAgo(300) },
      { id: 'e23', event_type: 'recalled', description: 'RAPEX recall issued — overheating / fire hazard in batch BATCH-2023-H112. All units must be returned.', location: 'EU-wide', actor_name: 'EcoTech GmbH', actor_role: 'manufacturer', event_date: daysAgo(14) },
    ],
    documents: [
      { id: 'd12', doc_type: 'safety_sheet', title: 'RAPEX Recall Notice RAPEX-2024-A12-0712-DE', issued_by: 'European Commission', issue_date: new Date(Date.now() - 14 * 86400000).toISOString().slice(0, 10), expiry_date: null },
      { id: 'd13', doc_type: 'certificate', title: 'CE Certificate (SUSPENDED)', issued_by: 'TÜV Rheinland', issue_date: '2023-06-01', expiry_date: '2026-01-01' },
    ],
    compliance_checks: [
      { id: 'c10', regulation: 'ESPR Regulation (EU) 2024/1781', status: 'non_compliant', checked_by: 'EU Market Surveillance', notes: 'Thermal safety requirements not met — recall initiated', checked_at: daysAgo(14) },
      { id: 'c11', regulation: 'Low Voltage Directive 2014/35/EU', status: 'non_compliant', checked_by: 'EU Market Surveillance', notes: 'Thermal fuse specification does not meet LVD requirements', checked_at: daysAgo(14) },
      { id: 'c12', regulation: 'General Product Safety Regulation (EU) 2023/988', status: 'non_compliant', checked_by: 'EU Market Surveillance', notes: 'Product presents serious risk — recall mandatory', checked_at: daysAgo(14) },
    ],
    created_at: daysAgo(410), updated_at: daysAgo(14),
  },
];

// ─── Mock API ──────────────────────────────────────────────────────────────────
let _products = [...PRODUCTS];
let _stakeholders = [...STAKEHOLDERS];

function delay(ms = 150) { return new Promise(r => setTimeout(r, ms)); }

export const staticApi = {
  getDashboard: async () => {
    await delay();
    const compliantCount = _products.flatMap(p => p.compliance_checks).filter(c => c.status === 'compliant').length;
    const totalChecks = _products.flatMap(p => p.compliance_checks).length;
    const allEvents = _products.flatMap(p => p.lifecycle_events.map(e => ({ ...e, product_name: p.name, product_id: p.id })));
    return {
      stats: {
        total_products: _products.length,
        active_products: _products.filter(p => p.status === 'active').length,
        recalled_products: _products.filter(p => p.status === 'recalled').length,
        total_stakeholders: _stakeholders.length,
        recent_events: allEvents.filter(e => new Date(e.event_date) > new Date(Date.now() - 30 * 86400000)).length,
        avg_recyclability: _products.reduce((s, p) => s + (p.recyclability_score || 0), 0) / _products.filter(p => p.recyclability_score != null).length,
        avg_repairability: _products.filter(p => p.repairability_score != null).reduce((s, p) => s + p.repairability_score, 0) / _products.filter(p => p.repairability_score != null).length,
        total_carbon: _products.reduce((s, p) => s + (p.carbon_footprint || 0), 0),
      },
      byCategory: Object.entries(_products.reduce((a, p) => { a[p.category] = (a[p.category] || 0) + 1; return a; }, {})).map(([category, count]) => ({ category, count })),
      byStatus: Object.entries(_products.reduce((a, p) => { a[p.status] = (a[p.status] || 0) + 1; return a; }, {})).map(([status, count]) => ({ status, count })),
      recentProducts: [..._products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 5),
      recentEvents: [...allEvents].sort((a, b) => new Date(b.event_date) - new Date(a.event_date)).slice(0, 10),
      complianceOverview: Object.entries(_products.flatMap(p => p.compliance_checks).reduce((a, c) => { a[c.status] = (a[c.status] || 0) + 1; return a; }, {})).map(([status, count]) => ({ status, count })),
    };
  },

  getProducts: async ({ search, category, status, page = 1, limit = 12 } = {}) => {
    await delay();
    let filtered = _products;
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(p => p.name.toLowerCase().includes(q) || p.uid.toLowerCase().includes(q) || p.model_number?.toLowerCase().includes(q) || p.manufacturer_name?.toLowerCase().includes(q) || p.subcategory?.toLowerCase().includes(q));
    }
    if (category && category !== 'all') filtered = filtered.filter(p => p.category === category);
    if (status && status !== 'all') filtered = filtered.filter(p => p.status === status);
    const total = filtered.length;
    const start = (page - 1) * limit;
    return { products: filtered.slice(start, start + limit), total, page, limit };
  },

  getProduct: async (id) => {
    await delay();
    const p = _products.find(p => p.id === id || p.uid === id);
    if (!p) throw new Error('Product not found');
    return { ...p };
  },

  createProduct: async (data) => {
    await delay();
    const id = `prod-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const uid = `EU-DPP-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const s = _stakeholders.find(s => s.id === data.manufacturer_id);
    const product = { ...data, id, uid, manufacturer_name: s?.name, manufacturer_country: s?.country, lifecycle_events: [], documents: [], compliance_checks: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    _products.unshift(product);
    return { id, uid };
  },

  updateProduct: async (id, data) => {
    await delay();
    const idx = _products.findIndex(p => p.id === id);
    if (idx < 0) throw new Error('Product not found');
    const s = _stakeholders.find(s => s.id === data.manufacturer_id);
    _products[idx] = { ..._products[idx], ...data, manufacturer_name: s?.name || _products[idx].manufacturer_name, updated_at: new Date().toISOString() };
    return { success: true };
  },

  deleteProduct: async (id) => {
    await delay();
    _products = _products.filter(p => p.id !== id);
    return { success: true };
  },

  getQRCode: async (id) => {
    await delay();
    const p = _products.find(p => p.id === id || p.uid === id);
    if (!p) throw new Error('Product not found');
    const url = `${window.location.origin}${window.location.pathname}#/products/${p.id}`;
    // Generate a simple QR using a public API for demo purposes
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}&color=1a1a2e`;
    return { qr, url, uid: p.uid, name: p.name };
  },

  addLifecycleEvent: async (productId, data) => {
    await delay();
    const p = _products.find(p => p.id === productId);
    if (!p) throw new Error('Product not found');
    const event = { id: `evt-${Date.now()}`, ...data, event_date: data.event_date || new Date().toISOString() };
    p.lifecycle_events.unshift(event);
    return { id: event.id };
  },

  addDocument: async (productId, data) => {
    await delay();
    const p = _products.find(p => p.id === productId);
    if (!p) throw new Error('Product not found');
    const doc = { id: `doc-${Date.now()}`, ...data };
    p.documents.unshift(doc);
    return { id: doc.id };
  },

  addCompliance: async (productId, data) => {
    await delay();
    const p = _products.find(p => p.id === productId);
    if (!p) throw new Error('Product not found');
    const check = { id: `cc-${Date.now()}`, ...data, checked_at: new Date().toISOString() };
    p.compliance_checks.unshift(check);
    return { id: check.id };
  },

  getStakeholders: async ({ role } = {}) => {
    await delay();
    return role && role !== 'all' ? _stakeholders.filter(s => s.role === role) : [..._stakeholders];
  },

  getStakeholder: async (id) => {
    await delay();
    const s = _stakeholders.find(s => s.id === id);
    if (!s) throw new Error('Not found');
    return { ...s, products: _products.filter(p => p.manufacturer_id === id).map(p => ({ id: p.id, uid: p.uid, name: p.name, category: p.category, status: p.status })) };
  },

  createStakeholder: async (data) => {
    await delay();
    const id = `stk-${Date.now()}`;
    _stakeholders.push({ id, ...data });
    return { id };
  },

  updateStakeholder: async (id, data) => {
    await delay();
    const idx = _stakeholders.findIndex(s => s.id === id);
    if (idx >= 0) _stakeholders[idx] = { ..._stakeholders[idx], ...data };
    return { success: true };
  },

  getCompliance: async () => {
    await delay();
    return _products.flatMap(p => p.compliance_checks.map(c => ({ ...c, product_name: p.name, product_uid: p.uid, product_id: p.id, category: p.category })));
  },

  updateCompliance: async (id, data) => {
    await delay();
    for (const p of _products) {
      const idx = p.compliance_checks.findIndex(c => c.id === id);
      if (idx >= 0) { p.compliance_checks[idx] = { ...p.compliance_checks[idx], ...data, checked_at: new Date().toISOString() }; break; }
    }
    return { success: true };
  },

  getAnalytics: async () => {
    await delay();
    const cats = [...new Set(_products.map(p => p.category))];
    const sustainability = cats.map(cat => {
      const ps = _products.filter(p => p.category === cat);
      return {
        category: cat,
        avg_carbon: ps.reduce((s, p) => s + (p.carbon_footprint || 0), 0) / ps.length,
        avg_recyclability: ps.filter(p => p.recyclability_score != null).reduce((s, p) => s + p.recyclability_score, 0) / (ps.filter(p => p.recyclability_score != null).length || 1),
        avg_repairability: ps.filter(p => p.repairability_score != null).reduce((s, p) => s + p.repairability_score, 0) / (ps.filter(p => p.repairability_score != null).length || 1),
        count: ps.length,
      };
    });

    const recycledContent = cats.reduce((acc, cat) => {
      const ps = _products.filter(p => p.category === cat);
      const all = ps.flatMap(p => p.material_composition || []);
      acc[cat] = { total: all.reduce((s, m) => s + (m.percentage || 0), 0), recycled: all.reduce((s, m) => s + (m.percentage || 0) * (m.recycled_content || 0) / 100, 0) };
      return acc;
    }, {});

    const supplyChainCarbon = _products.map(p => ({ name: p.name, category: p.category, stages: p.supply_chain || [] }));
    const allChecks = _products.flatMap(p => p.compliance_checks);
    const complianceRate = {
      total: allChecks.length,
      compliant: allChecks.filter(c => c.status === 'compliant').length,
      non_compliant: allChecks.filter(c => c.status === 'non_compliant').length,
      under_review: allChecks.filter(c => c.status === 'under_review').length,
      pending: allChecks.filter(c => c.status === 'pending').length,
    };

    return { sustainability, recycledContent, supplyChainCarbon, complianceRate };
  },
};
