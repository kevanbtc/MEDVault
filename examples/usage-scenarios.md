# Example Usage Scenarios

This directory contains real-world examples of how the MEDVault system handles complex insurance scenarios.

## Scenario 1: Oncology Prior Authorization

**Patient**: 65-year-old with lung cancer, Medicare Advantage plan
**Service**: Pembrolizumab (Keytruda) for first-line treatment

### System Processing:

1. **Payer Profile Load**: Humana Medicare Advantage
2. **Service Lookup**: J9271 (pembrolizumab)
3. **Prior Auth Check**: Required for oncology drugs
4. **Medical Necessity**: NCCN guideline compliance
5. **Benefit Calculation**: Specialty tier 5, 33% coinsurance
6. **Network Validation**: In-network oncology practice

### Expected Outcome:
- Prior authorization approved with NCCN compliance
- Patient pays 33% of allowed amount after deductible
- Global treatment authorization for 6 months

## Scenario 2: Emergency Department - No Surprises Act

**Patient**: 35-year-old commercial PPO member
**Service**: Emergency appendectomy at in-network hospital
**Complication**: Out-of-network surgeon

### System Processing:

1. **Service Classification**: Emergency surgery
2. **NSA Evaluation**: Ancillary service at in-network facility
3. **Protection Applied**: Patient liable for in-network cost sharing only
4. **Balance Billing**: Prohibited under NSA
5. **Payment Dispute**: IDR process between surgeon and payer

### Expected Outcome:
- Patient pays in-network emergency copay ($250)
- No balance billing permitted
- Payer and surgeon resolve payment via arbitration

## Scenario 3: Site-of-Service Steering

**Patient**: 55-year-old requiring colonoscopy screening
**Options**: Hospital outpatient vs ASC vs office

### Cost Comparison:

| Setting | Facility Fee | Professional Fee | Patient Cost |
|---------|-------------|------------------|--------------|
| Hospital OP | $1,200 | $500 | $250 copay |
| ASC | $800 | $500 | $0 copay |
| Office | $600 | $500 | $50 copay |

### System Recommendation:
- Steer to ASC for $0 copay incentive
- Generate patient education on options
- Provider notification of incentive structure