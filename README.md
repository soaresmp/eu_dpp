# 🇪🇺 EU Digital Product Passport Portal

A full-featured web portal implementing the **EU Digital Product Passport (DPP)** specification under the **Ecodesign for Sustainable Products Regulation (ESPR) — EU 2024/1781**.

## Features

### Core DPP Functionality
- **Product Registry** — Full CRUD for Digital Product Passports with ESPR-compliant data fields
- **Material Composition** — Track materials, recycled content percentages, and origin countries
- **Sustainability Indicators** — Carbon footprint, recyclability score (0-100%), repairability score (0-10), energy class (A+++ to G), durability rating
- **Hazardous Substances** — REACH-compliant substance declarations with CAS numbers and concentration limits
- **Certifications & Standards** — CE marking, EU Ecolabel, GOTS, etc. with expiry tracking
- **QR Code Generation** — Download data carrier QR codes linking to each product passport
- **Supply Chain Tracking** — Stage-by-stage carbon footprint across the value chain

### Stakeholder Management
- Register manufacturers, importers, distributors, retailers, recyclers, and regulators
- Multi-country support across all EU member states

### Lifecycle Tracking
- Full lifecycle event log: manufactured → imported → distributed → sold → repaired → recalled → recycled
- Actor attribution, location, and timestamp for each event

### Compliance Monitoring
- Track compliance with: ESPR, EU Battery Regulation 2023/1542, RoHS, WEEE, REACH, and more
- Status workflow: Pending → Under Review → Compliant / Non-Compliant
- Compliance rate dashboard with visual progress tracking

### Analytics & Reporting
- Carbon footprint breakdown by category and supply chain stage
- Recyclability vs. repairability radar charts
- Recycled content visualization
- Compliance distribution pie charts

### DPP Scanner
- Look up any product by DPP ID, UID, or QR code URL
- Quick-access sample product lookups

## Quick Start

```bash
# 1. Install all dependencies
npm run install:all

# 2. Build the frontend
npm run build

# 3. Start the server
npm start
# Portal available at http://localhost:3001
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Tailwind CSS, Recharts |
| Backend | Node.js, Express.js |
| Database | SQLite (better-sqlite3) |
| QR Codes | qrcode library |
| Icons | Lucide React |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |
| GET/POST | `/api/products` | List/create products |
| GET/PUT/DELETE | `/api/products/:id` | Product operations |
| GET | `/api/products/:id/qrcode` | Generate QR code |
| POST | `/api/products/:id/events` | Add lifecycle event |
| POST | `/api/products/:id/documents` | Add document |
| POST | `/api/products/:id/compliance` | Add compliance check |
| GET/POST | `/api/stakeholders` | Stakeholder registry |
| GET | `/api/compliance` | All compliance checks |
| PUT | `/api/compliance/:id` | Update compliance status |
| GET | `/api/analytics` | Sustainability analytics |

## Regulatory Compliance

This portal implements data fields and workflows required by:

- **ESPR Regulation (EU) 2024/1781** — Ecodesign for Sustainable Products
- **EU Battery Regulation 2023/1542** — Battery passport requirements
- **RoHS Directive 2011/65/EU** — Hazardous substance restrictions
- **WEEE Directive 2012/19/EU** — Waste electrical equipment
- **REACH Regulation (EC) No 1907/2006** — Chemical substance safety
- **Energy Labelling Regulation (EU) 2017/1369** — Energy class labelling

## Sample Data

The application seeds with 4 representative products:
1. **ProWash EcoSeries 9000** — A+++ washing machine (Appliances)
2. **SolarMax Pro 400W Panel** — Monocrystalline solar panel (Electronics)
3. **EcoWeave Organic T-Shirt** — GOTS certified organic cotton (Textiles)
4. **LithiumPack EV 75kWh** — Electric vehicle battery pack (Batteries)
