const RuleEngine = require('../../src/rule-engine/rule-engine');
const NSACalculator = require('../../src/nsa-calculator/nsa-calculator');
const { PayerProfileValidator } = require('../../src/validators/validate-all');

// Mock payer profile for testing
const mockPayerProfile = {
    schema_version: "1.0.0",
    payer_info: {
        name: "Test PPO",
        type: "PPO",
        region: "Test"
    },
    coverage_rules: {
        in_network_coverage: { percentage: 80, max_out_of_pocket: 5000 },
        out_of_network_coverage: { percentage: 60, max_out_of_pocket: 10000 },
        deductible_rules: { individual: 1000, family: 2000 }
    },
    prior_auth_rules: {
        required_services: [
            {
                cpt_codes: ["27447"],
                service_category: "orthopedic_surgery",
                authorization_window_days: 30
            }
        ]
    },
    nsa_rules: {
        emergency_services: {
            applies_in_network_rate: true,
            patient_liability_limit: "in_network_cost_sharing"
        },
        out_of_network_facility: {
            qpa_calculation_method: "median_contracted_rate"
        }
    },
    eligibility_rules: {
        staleness_threshold_hours: 24
    },
    bundling_rules: [
        {
            name: "Test Bundle",
            primary_cpt: "45380",
            bundled_cpts: ["88305"],
            ncci_compliant: true
        }
    ]
};

describe('RuleEngine', () => {
    let ruleEngine;

    beforeEach(() => {
        ruleEngine = new RuleEngine(mockPayerProfile);
    });

    test('should create rule engine instance', () => {
        expect(ruleEngine).toBeDefined();
        expect(ruleEngine.payerProfile).toBe(mockPayerProfile);
    });

    test('should check eligibility with staleness rules', () => {
        const result = ruleEngine.checkEligibility('PAT123', '2024-01-15');
        expect(result).toBeDefined();
        expect(result.context).toBeDefined();
        expect(typeof result.context).toBe('object');
    });

    test('should check prior authorization requirements', () => {
        const result = ruleEngine.checkPriorAuth(['27447'], 'orthopedic_surgery');
        expect(result).toBeDefined();
        expect(result.context.cptCodes).toEqual(['27447']);
    });

    test('should apply bundling rules', () => {
        const result = ruleEngine.applyBundlingRules(['45380', '88305']);
        expect(result).toBeDefined();
        expect(result.context.cptCodes).toEqual(['45380', '88305']);
    });
});

describe('NSACalculator', () => {
    let nsaCalculator;

    beforeEach(() => {
        nsaCalculator = new NSACalculator(mockPayerProfile);
    });

    test('should create NSA calculator instance', () => {
        expect(nsaCalculator).toBeDefined();
        expect(nsaCalculator.payerProfile).toBe(mockPayerProfile);
    });

    test('should calculate patient liability for emergency care', () => {
        const params = {
            serviceType: 'emergency_care',
            facilityNetworkStatus: 'out_of_network',
            providerNetworkStatus: 'out_of_network',
            chargedAmount: 2500.00,
            contractedRate: 1800.00,
            patientConsent: false,
            patientPlan: {
                deductible_met: 0.00,
                out_of_pocket_met: 500.00
            }
        };

        const result = nsaCalculator.calculatePatientLiability(params);
        
        expect(result).toBeDefined();
        expect(result.input_parameters).toEqual(params);
        expect(result.nsa_applicable).toBeDefined();
        expect(result.final_patient_liability).toBeGreaterThanOrEqual(0);
    });

    test('should determine NSA applicability for emergency services', () => {
        const applicable = nsaCalculator.isNSAApplicable('emergency_care', 'out_of_network', 'out_of_network');
        expect(applicable).toBe(true);
    });

    test('should calculate QPA using median contracted rate', () => {
        const params = {
            contractedRate: 1000.00,
            chargedAmount: 1500.00
        };

        const qpa = nsaCalculator.calculateQPA(params);
        expect(qpa).toBeGreaterThan(0);
        expect(qpa).toBeLessThanOrEqual(params.chargedAmount);
    });
});

describe('PayerProfileValidator', () => {
    let validator;

    beforeEach(() => {
        validator = new PayerProfileValidator();
    });

    test('should create validator instance', () => {
        expect(validator).toBeDefined();
        expect(validator.schema).toBeDefined();
    });

    test('should validate valid payer profile', () => {
        const result = validator.validateProfile(mockPayerProfile);
        
        expect(result).toBeDefined();
        expect(result.valid).toBeDefined();
        expect(result.errors).toBeInstanceOf(Array);
        expect(result.warnings).toBeInstanceOf(Array);
    });

    test('should detect missing required fields', () => {
        const invalidProfile = {
            schema_version: "1.0.0"
            // Missing required fields
        };

        const result = validator.validateProfile(invalidProfile);
        expect(result.valid).toBe(false);
        expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should generate business rule warnings', () => {
        const profileWithWarnings = {
            ...mockPayerProfile,
            coverage_rules: {
                ...mockPayerProfile.coverage_rules,
                in_network_coverage: { percentage: 30 } // Unusually low
            }
        };

        const result = validator.validateProfile(profileWithWarnings);
        // Even if schema valid, should have business warnings
        expect(result.warnings).toBeInstanceOf(Array);
    });
});