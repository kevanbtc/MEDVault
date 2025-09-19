# MEDVault

A comprehensive healthcare insurance system with payer profiles, rule engine, NSA calculator, and automated compliance tools.

## 🚀 Overview

MEDVault transforms the complex insurance landscape into manageable, machine-readable code that enables real-time collaboration between doctors, patients, and payers. The system provides:

- **Machine-readable payer profiles** with versioning and validation
- **Rule engine DSL** for modifiers, bundling, prior auth, and NSA protection
- **NSA Calculator** for deterministic patient liability calculations
- **FHIR questionnaires** for streamlined doctor and patient workflows
- **Event-driven architecture** with Avro schemas
- **Comprehensive testing** with golden test vectors
- **CI/CD validation** to prevent configuration errors

## 📋 Features

### Core Components

- **Payer Profile Schema (YAML)** - Machine-readable, versioned insurance plan definitions
- **Example Profiles** - UHC PPO, Medicare Advantage, Medicaid MCO ready-to-use profiles
- **Rule Engine DSL** - Flexible rule processing for healthcare billing scenarios
- **NSA Calculator** - No Surprises Act compliance with deterministic patient liability calculations
- **APIs (OpenAPI)** - RESTful endpoints for `/scrubber/run`, `/nsa/calc`, `/payer-profiles`
- **FHIR Questionnaires** - Standardized forms for doctors and patients
- **Event Schemas (Avro)** - `ScrubEvaluated`, `NsaComputed` events for downstream processing
- **Test Vectors** - Golden test cases for PET+26, NCCI bundles, NSA ED OON scenarios
- **CI Hooks** - Automated validators and simulators

### SpecRunner CLI

Interactive command-line tool for healthcare professionals:

```bash
# Run claim scrubbing
npm start scrub --profile uhc-ppo --cpt 99213,90471 --amount 250.00

# Calculate NSA patient liability
npm start nsa --service-type emergency_care --charged 2500 --contracted 1800

# Run test vectors
npm start test --category nsa_ed_oon_cases --verbose

# Start interactive mode
npm start interactive
```

## 🏗️ Project Structure

```
MEDVault/
├── schemas/
│   ├── payer-profiles/           # YAML schema definitions
│   ├── events/                   # Avro event schemas
│   └── api/                      # OpenAPI specifications
├── examples/
│   └── payer-profiles/           # Sample payer configurations
├── src/
│   ├── api/                      # Express.js API server
│   ├── cli/                      # SpecRunner command-line tool
│   ├── rule-engine/              # Healthcare billing rule engine
│   ├── nsa-calculator/           # NSA compliance calculator
│   ├── validators/               # Schema and business rule validators
│   └── simulators/               # Load testing and simulation tools
├── questionnaires/
│   └── fhir/                     # FHIR questionnaire resources
├── tests/
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── test-vectors.yaml         # Golden test cases
└── docs/                         # Documentation
```

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Python 3.8+ (for validation tools)

### Installation

```bash
# Clone the repository
git clone https://github.com/kevanbtc/MEDVault.git
cd MEDVault

# Install Node.js dependencies
npm install

# Install Python dependencies (optional, for validation tools)
pip install -r requirements.txt
```

### Running the API Server

```bash
# Start the API server
node src/api/server.js

# Access API documentation
open http://localhost:3000/docs
```

### Using the SpecRunner CLI

```bash
# Make the CLI executable
chmod +x src/cli/specrunner.js

# Run a basic claim scrub
npm start scrub --profile uhc-ppo --cpt 99213 --amount 150.00

# Calculate NSA liability for emergency care
npm start nsa --service-type emergency_care --facility-network out_of_network --charged 3000.00

# Run all test vectors
npm start test

# Validate all configurations
npm run validate

# Run load simulation
npm run simulate
```

## 📊 API Endpoints

### Scrubber API
- `POST /scrubber/run` - Process claims through rule engine
- Validates CPT codes, applies bundling rules, checks prior authorization

### NSA Calculator API  
- `POST /nsa/calc` - Calculate patient liability under NSA rules
- Handles emergency services, out-of-network scenarios, QPA calculations

### Payer Profiles API
- `GET /payer-profiles` - List available payer profiles
- `GET /payer-profiles/{id}` - Get specific payer profile
- `POST /payer-profiles` - Create new payer profile
- `PUT /payer-profiles/{id}` - Update existing profile

### Questionnaires API
- `GET /questionnaires` - Get FHIR questionnaires for doctors/patients

## 🧪 Testing

### Run Unit Tests
```bash
npm test
```

### Run Test Vectors
```bash
# Run all test vectors
npm start test

# Run specific category
npm start test --category pet_26_cases

# Run with verbose output
npm start test --verbose
```

### Validation
```bash
# Validate all schemas and profiles
npm run validate

# The validator checks:
# - Payer profile schema compliance
# - Business rule consistency
# - API schema validity
# - Avro schema structure
```

### Simulation & Load Testing
```bash
# Run basic claim simulation
npm run simulate basic --num-claims 1000

# Run load test
npm run simulate load --concurrent-users 50 --claims-per-user 100
```

## 📋 Payer Profile Schema

Example payer profile structure:

```yaml
schema_version: "1.0.0"

payer_info:
  name: "UnitedHealthcare PPO"
  type: "PPO"
  region: "National"
  effective_date: "2024-01-01"

coverage_rules:
  in_network_coverage:
    percentage: 80
    max_out_of_pocket: 8550
  out_of_network_coverage:
    percentage: 60
    max_out_of_pocket: 17100

prior_auth_rules:
  required_services:
    - cpt_codes: ["27447", "27130"]
      service_category: "orthopedic_surgery"
      authorization_window_days: 30

nsa_rules:
  emergency_services:
    applies_in_network_rate: true
    patient_liability_limit: "in_network_cost_sharing"
  
bundling_rules:
  - name: "Colonoscopy with Biopsy"
    primary_cpt: "45380"
    bundled_cpts: ["88305"]
    modifier_exceptions: ["59"]
```

## 🔧 Rule Engine DSL

The rule engine processes healthcare billing rules using a domain-specific language:

```javascript
// Eligibility checking with staleness rules
RULE eligibility_check
WHEN patient_id = "PAT123" 
    AND service_date = "2024-01-15"
    AND eligibility_data.staleness_hours <= 24
THEN eligible = true
ELSE eligible = false, action = "verify_eligibility"

// Prior authorization rules  
RULE prior_auth_check
FOR_EACH required_service IN required_services
WHEN cpt_codes INTERSECTS required_service.cpt_codes
THEN prior_auth_required = true

// NSA protection rules
RULE nsa_protection
WHEN service_type = "emergency_care"
THEN nsa_protected = true,
     patient_liability = "in_network_cost_sharing",
     balance_billing_prohibited = true
```

## 💰 NSA Calculator

Calculate patient liability under No Surprises Act rules:

```javascript
const calculator = new NSACalculator(payerProfile);

const result = calculator.calculatePatientLiability({
    serviceType: 'emergency_care',
    facilityNetworkStatus: 'out_of_network',
    providerNetworkStatus: 'out_of_network', 
    chargedAmount: 2500.00,
    contractedRate: 1800.00,
    patientConsent: false
});

// Result includes:
// - nsa_applicable: true
// - qualifying_payment_amount: 1800.00
// - balance_billing_allowed: false
// - final_patient_liability: 360.00
// - calculation_method: "nsa_protected"
```

## 📋 FHIR Questionnaires

Standardized forms for clinical workflows:

- **Doctor Questionnaire** - Prior authorization assessment, clinical justification
- **Patient Questionnaire** - Coverage understanding, consent collection, NSA rights

Both questionnaires are fully FHIR R4 compliant and integrate with existing EHR systems.

## 🎯 Test Vectors

Golden test cases cover critical healthcare scenarios:

- **PET+26 Cases** - Positron emission tomography with professional/technical component modifiers
- **NCCI Bundle Cases** - National Correct Coding Initiative bundling rules
- **NSA ED OON Cases** - No Surprises Act emergency department out-of-network scenarios

## 🚨 CI/CD Integration

Prevent bad configurations from reaching production:

```yaml
# .github/workflows/validate.yml
name: Validate Configurations
on: [push, pull_request]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run validate
      - run: npm test
      - run: npm start test
```

## 📚 Documentation

- [API Documentation](http://localhost:3000/docs) - Interactive OpenAPI documentation
- [Schema Reference](docs/schemas.md) - Detailed schema documentation
- [Rule Engine Guide](docs/rule-engine.md) - Rule engine DSL reference
- [NSA Calculator Guide](docs/nsa-calculator.md) - NSA compliance calculations
- [Integration Guide](docs/integration.md) - How to integrate with existing systems

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run validation (`npm run validate`)
4. Run tests (`npm test`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📧 Email: support@medvault.com
- 📖 Documentation: [docs.medvault.com](https://docs.medvault.com)
- 🐛 Issues: [GitHub Issues](https://github.com/kevanbtc/MEDVault/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/kevanbtc/MEDVault/discussions)

## 🏆 Acknowledgments

- Built with healthcare professionals in mind
- Compliant with FHIR R4 standards  
- No Surprises Act (NSA) compliant
- HIPAA security considerations
- CMS and OIG guidance adherence

---

**MEDVault** - Transforming healthcare insurance complexity into manageable, automated workflows.