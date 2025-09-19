/**
 * NSA (No Surprises Act) Calculator
 * Deterministic inputs/outputs for patient liability calculation
 */

class NSACalculator {
    constructor(payerProfile) {
        this.payerProfile = payerProfile;
    }

    /**
     * Calculate patient liability under NSA rules
     * @param {Object} params - Calculation parameters
     * @param {string} params.serviceType - Type of service (emergency, ancillary, etc.)
     * @param {string} params.facilityNetworkStatus - in_network, out_of_network
     * @param {string} params.providerNetworkStatus - in_network, out_of_network
     * @param {number} params.chargedAmount - Provider's charged amount
     * @param {number} params.contractedRate - In-network contracted rate (if available)
     * @param {boolean} params.patientConsent - Whether patient provided informed consent
     * @param {Object} params.patientPlan - Patient's plan details
     */
    calculatePatientLiability(params) {
        const {
            serviceType,
            facilityNetworkStatus,
            providerNetworkStatus,
            chargedAmount,
            contractedRate,
            patientConsent = false,
            patientPlan
        } = params;

        const calculation = {
            input_parameters: params,
            nsa_applicable: false,
            qpa_used: false,
            qualifying_payment_amount: null,
            patient_cost_sharing: null,
            balance_billing_allowed: false,
            calculation_method: null,
            final_patient_liability: null,
            calculation_steps: []
        };

        // Step 1: Determine if NSA applies
        calculation.nsa_applicable = this.isNSAApplicable(serviceType, facilityNetworkStatus, providerNetworkStatus);
        calculation.calculation_steps.push({
            step: 1,
            description: "NSA Applicability Check",
            result: calculation.nsa_applicable,
            reasoning: this.getNSAApplicabilityReason(serviceType, facilityNetworkStatus, providerNetworkStatus)
        });

        if (!calculation.nsa_applicable) {
            // Standard out-of-network calculation
            calculation.patient_cost_sharing = this.calculateStandardOONLiability(chargedAmount, patientPlan);
            calculation.final_patient_liability = calculation.patient_cost_sharing;
            calculation.balance_billing_allowed = true;
            calculation.calculation_method = "standard_oon";
        } else {
            // NSA protection applies
            calculation.balance_billing_allowed = this.isBalanceBillingAllowed(serviceType, patientConsent);
            
            // Step 2: Calculate QPA (Qualifying Payment Amount)
            calculation.qualifying_payment_amount = this.calculateQPA(params);
            calculation.qpa_used = true;
            calculation.calculation_steps.push({
                step: 2,
                description: "QPA Calculation",
                result: calculation.qualifying_payment_amount,
                method: this.payerProfile.nsa_rules.out_of_network_facility.qpa_calculation_method
            });

            // Step 3: Calculate patient cost-sharing based on QPA
            calculation.patient_cost_sharing = this.calculateInNetworkCostSharing(
                calculation.qualifying_payment_amount, 
                patientPlan
            );
            calculation.calculation_steps.push({
                step: 3,
                description: "Patient Cost-sharing Calculation",
                result: calculation.patient_cost_sharing,
                basis: "in_network_equivalent"
            });

            // Step 4: Final liability determination
            if (calculation.balance_billing_allowed) {
                calculation.final_patient_liability = Math.min(
                    chargedAmount,
                    calculation.patient_cost_sharing + (chargedAmount - calculation.qualifying_payment_amount)
                );
                calculation.calculation_method = "nsa_with_balance_billing";
            } else {
                calculation.final_patient_liability = calculation.patient_cost_sharing;
                calculation.calculation_method = "nsa_protected";
            }
        }

        calculation.calculation_steps.push({
            step: "final",
            description: "Final Patient Liability",
            result: calculation.final_patient_liability,
            method: calculation.calculation_method
        });

        return calculation;
    }

    /**
     * Determine if NSA protections apply
     */
    isNSAApplicable(serviceType, facilityNetworkStatus, providerNetworkStatus) {
        const nsaRules = this.payerProfile.nsa_rules;

        // Emergency services are always protected
        if (serviceType === "emergency_care") {
            return true;
        }

        // Ancillary services at in-network facilities
        if (facilityNetworkStatus === "in_network" && 
            providerNetworkStatus === "out_of_network" &&
            nsaRules.out_of_network_facility.ancillary_services_protected) {
            return true;
        }

        return nsaRules.balance_billing_protection.protected_services.includes(serviceType);
    }

    /**
     * Check if balance billing is allowed (notice and consent scenario)
     */
    isBalanceBillingAllowed(serviceType, patientConsent) {
        const nsaRules = this.payerProfile.nsa_rules;
        
        if (serviceType === "emergency_care") {
            return false; // Never allowed for emergency services
        }

        return nsaRules.balance_billing_protection.notice_and_consent_eligible.includes(serviceType) 
               && patientConsent;
    }

    /**
     * Calculate Qualifying Payment Amount (QPA)
     */
    calculateQPA(params) {
        const method = this.payerProfile.nsa_rules.out_of_network_facility.qpa_calculation_method;
        
        switch (method) {
            case "median_contracted_rate":
                return this.calculateMedianContractedRate(params);
            case "ghost_rate":
                return this.calculateGhostRate(params);
            case "all_payer_database":
                return this.calculateAllPayerDatabaseRate(params);
            default:
                return params.contractedRate || (params.chargedAmount * 0.8); // Fallback
        }
    }

    calculateMedianContractedRate(params) {
        // In a real implementation, this would query contracted rates
        // For now, return a reasonable estimate
        return params.contractedRate || (params.chargedAmount * 0.75);
    }

    calculateGhostRate(params) {
        // Ghost rate calculation based on historical data
        return params.chargedAmount * 0.70;
    }

    calculateAllPayerDatabaseRate(params) {
        // Would query state all-payer claims database
        return params.chargedAmount * 0.80;
    }

    /**
     * Calculate standard out-of-network liability
     */
    calculateStandardOONLiability(chargedAmount, patientPlan) {
        const oonCoverage = this.payerProfile.coverage_rules.out_of_network_coverage.percentage / 100;
        const patientResponsibility = chargedAmount * (1 - oonCoverage);
        
        return Math.min(
            patientResponsibility,
            this.payerProfile.coverage_rules.out_of_network_coverage.max_out_of_pocket
        );
    }

    /**
     * Calculate in-network equivalent cost-sharing
     */
    calculateInNetworkCostSharing(allowedAmount, patientPlan) {
        const inNetworkCoverage = this.payerProfile.coverage_rules.in_network_coverage.percentage / 100;
        const patientResponsibility = allowedAmount * (1 - inNetworkCoverage);
        
        // Apply deductible and copay logic
        // This would be more complex in a real implementation
        return Math.min(
            patientResponsibility,
            this.payerProfile.coverage_rules.in_network_coverage.max_out_of_pocket
        );
    }

    getNSAApplicabilityReason(serviceType, facilityNetworkStatus, providerNetworkStatus) {
        if (serviceType === "emergency_care") {
            return "Emergency services are protected under NSA";
        }
        if (facilityNetworkStatus === "in_network" && providerNetworkStatus === "out_of_network") {
            return "Ancillary services at in-network facility protected under NSA";
        }
        return "Service type in NSA protected categories";
    }

    /**
     * Batch calculation for multiple services
     */
    calculateBatchLiability(serviceParams) {
        return serviceParams.map(params => this.calculatePatientLiability(params));
    }
}

module.exports = NSACalculator;