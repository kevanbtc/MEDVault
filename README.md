# MEDVault

Medical cost-saving and transparency platform that enforces patient cost-saving strategies with verifiable rules, receipts, and UI gates.

## Features

### Money Tab - Patient Cost-Saving Playbook

**Battle-tested + source-backed** strategies to reduce healthcare costs:

#### 1) Before care: set the price and the rules
- **Good-Faith Estimate (GFE)** requests with NSA dispute process
- **Hospital price tools** with screenshot capture for evidence
- **Site of service optimization** (outpatient/ASC/office vs hospital)
- **Insurance plan parsing** with benefits verification

#### 2) Prescriptions: pay the lower number, but mind the traps
- **Drug price comparison** (insurance vs GoodRx vs Cuban Cost Plus vs manufacturer coupons)
- **Accumulator impact warnings** when discount cards don't count toward deductible/OOP

#### 3) During care: avoid surprise billing
- **NSA protection calculator** using median contracted rates
- **Surprise billing consent form** alerts and protection

#### 4) After care: audit, negotiate, escalate
- **Bill auditor** comparing itemized bills vs GFE/EOB
- **CFPB-backed dispute letter** generation
- **Charity care/financial assistance** eligibility checking for nonprofit hospitals

#### 5) Additional tools
- **HSA/FSA eligibility** validation and tax savings calculation
- **Pharmacy network finder** with price comparisons
- **Provider and dispute script** templates

## Technical Implementation

### Backend (Node.js/Express)
- `/api/money` - NSA calculator and GFE generation
- `/api/prices` - Hospital price transparency and site comparison
- `/api/bills` - Bill auditing and dispute letter generation  
- `/api/drugs` - Drug price comparison and HSA/FSA validation
- `/api/scripts` - Template generation for provider communication and disputes

### Frontend (React/TypeScript)
- Modern React application with Tailwind CSS
- Tabbed interface with Money tab as primary focus
- Real-time price comparisons and bill analysis
- Evidence capture and dispute letter generation

## Data Sources & Citations

All functionality is backed by primary sources:
- Centers for Medicare & Medicaid Services (No Surprises Act & Price Transparency)
- Consumer Financial Protection Bureau (Medical Debt Collection Guidance)
- IRS Section 501(r) (Nonprofit Hospital Financial Assistance Requirements)
- Hospital machine-readable pricing files
- Peer-reviewed research on discount drug pricing effectiveness

## Installation

```bash
# Install dependencies
npm run install:all

# Start development servers
npm run dev
```

## Usage

1. **Navigate to Money Tab** - Access all cost-saving tools
2. **Plan Phase** - Import benefits, check network status, get GFE
3. **Shop Phase** - Compare hospital prices and sites of service
4. **Fill Phase** - Compare drug prices with accumulator warnings
5. **Visit Phase** - NSA eligibility check and consent form alerts
6. **Bill Phase** - Audit itemized bills and generate dispute letters

## Key Differentiators

- **Regulatory compliance** - Built on actual NSA, CMS, and CFPB requirements
- **Evidence-based** - Screenshot capture, citation tracking, dispute documentation
- **Automated workflows** - Pre-filled scripts, auto-generated letters, regulatory citations
- **Cost transparency** - Real hospital pricing data, not estimates
- **Patient advocacy** - CFPB talking points, charity care requirements, appeal processes

This platform transforms cost-saving from suggestions into **enforceable default paths** with regulatory backing.

## License

MIT