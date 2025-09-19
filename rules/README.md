# Rule Engine Components

This directory contains the core rule engine for processing insurance coverage determinations.

## Components

### Authorization Rules (`auth-rules.json`)
- Pre-authorization requirements by service category and CPT codes
- Medical necessity criteria mappings
- Expedited review availability

### Benefit Calculation (`benefit-calc.json`)
- Deductible tracking and application
- Copay vs coinsurance logic
- Out-of-pocket maximum tracking
- Family vs individual accumulator logic

### Network Rules (`network-rules.json`)
- In-network vs out-of-network determination
- Emergency service exceptions
- No Surprises Act applicability logic

### Site of Service (`site-of-service-rules.json`)
- Preferred site steering logic
- Cost-sharing differentials by site
- Medical necessity by setting

### Formulary Rules (`formulary-rules.json`)
- Drug tier determination
- Step therapy requirements
- Prior authorization triggers
- Quantity limit enforcement

### COB Rules (`cob-rules.json`)
- Primary vs secondary determination
- MSP (Medicare Secondary Payer) logic
- Subrogation flagging

### Denial Codes (`denial-codes.json`)
- Standardized denial reason codes
- Appeal rights mapping
- Required documentation for appeals

### Modifiers (`modifier-rules.json`)
- CPT modifier validation by service type
- Site-specific modifier requirements
- Global period and bundling rules