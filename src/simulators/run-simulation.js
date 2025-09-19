const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const RuleEngine = require('../rule-engine/rule-engine');
const NSACalculator = require('../nsa-calculator/nsa-calculator');

class ClaimSimulator {
    constructor() {
        this.payerProfiles = new Map();
        this.loadPayerProfiles();
    }

    loadPayerProfiles() {
        const profilesDir = path.join(__dirname, '../../examples/payer-profiles');
        const files = fs.readdirSync(profilesDir);
        
        for (const file of files) {
            if (file.endsWith('.yaml')) {
                const profilePath = path.join(profilesDir, file);
                const profileData = yaml.load(fs.readFileSync(profilePath, 'utf8'));
                const profileId = path.basename(file, '.yaml');
                this.payerProfiles.set(profileId, profileData);
            }
        }
    }

    generateRandomClaim() {
        const cptCodes = [
            '99213', '99214', '99215', // Office visits
            '45380', '88305', // Colonoscopy with biopsy
            '66984', '66821', // Cataract surgery
            '27447', '27130', // Orthopedic procedures
            '70551', '70552', // MRI scans
            '99281', '99282', '99283', '99284', '99285' // Emergency visits
        ];

        const modifiers = ['26', 'TC', '59', '25', 'LT', 'RT', '50'];

        return {
            claim_id: 'SIM_' + Math.random().toString(36).substr(2, 10),
            patient_id: 'PAT_' + Math.random().toString(36).substr(2, 8),
            service_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            cpt_codes: [cptCodes[Math.floor(Math.random() * cptCodes.length)]],
            modifiers: Math.random() > 0.7 ? [modifiers[Math.floor(Math.random() * modifiers.length)]] : [],
            provider_npi: '12345' + Math.floor(Math.random() * 100000),
            facility_npi: '67890' + Math.floor(Math.random() * 100000),
            charged_amount: Math.floor(Math.random() * 5000) + 100,
            network_status: Math.random() > 0.3 ? 'in_network' : 'out_of_network'
        };
    }

    async runClaimSimulation(options = {}) {
        const {
            numClaims = 100,
            payerProfileId = 'uhc-ppo',
            showProgress = true
        } = options;

        console.log(`🎯 Running claim simulation with ${numClaims} claims`);
        
        const payerProfile = this.payerProfiles.get(payerProfileId);
        if (!payerProfile) {
            throw new Error(`Payer profile ${payerProfileId} not found`);
        }

        const ruleEngine = new RuleEngine(payerProfile);
        const nsaCalculator = new NSACalculator(payerProfile);
        
        const results = {
            total_claims: numClaims,
            processed_claims: 0,
            successful_claims: 0,
            failed_claims: 0,
            nsa_protected_claims: 0,
            bundled_claims: 0,
            prior_auth_required: 0,
            total_charged_amount: 0,
            total_patient_liability: 0,
            processing_times: [],
            error_distribution: {},
            claims: []
        };

        for (let i = 0; i < numClaims; i++) {
            if (showProgress && i % 10 === 0) {
                process.stdout.write(`\r🔄 Processing claim ${i + 1}/${numClaims}...`);
            }

            const claim = this.generateRandomClaim();
            const startTime = Date.now();

            try {
                // Process through rule engine
                const scrubResult = await this.processClaim(ruleEngine, claim);
                
                // Calculate NSA if applicable
                let nsaResult = null;
                if (claim.network_status === 'out_of_network') {
                    nsaResult = nsaCalculator.calculatePatientLiability({
                        serviceType: this.getServiceType(claim.cpt_codes[0]),
                        facilityNetworkStatus: claim.network_status,
                        providerNetworkStatus: claim.network_status,
                        chargedAmount: claim.charged_amount,
                        contractedRate: claim.charged_amount * 0.75,
                        patientConsent: Math.random() > 0.8,
                        patientPlan: {
                            deductible_met: Math.random() * 1000,
                            out_of_pocket_met: Math.random() * 2000
                        }
                    });

                    if (nsaResult.nsa_applicable) {
                        results.nsa_protected_claims++;
                    }
                }

                const processingTime = Date.now() - startTime;
                results.processing_times.push(processingTime);
                results.processed_claims++;
                results.successful_claims++;
                results.total_charged_amount += claim.charged_amount;
                
                if (nsaResult) {
                    results.total_patient_liability += nsaResult.final_patient_liability;
                } else {
                    results.total_patient_liability += claim.charged_amount * 0.2; // Assume 20% patient responsibility
                }

                // Track bundling
                if (scrubResult.bundled) {
                    results.bundled_claims++;
                }

                // Track prior auth
                if (scrubResult.prior_auth_required) {
                    results.prior_auth_required++;
                }

                results.claims.push({
                    claim,
                    scrub_result: scrubResult,
                    nsa_result: nsaResult,
                    processing_time: processingTime
                });

            } catch (error) {
                results.failed_claims++;
                results.error_distribution[error.message] = (results.error_distribution[error.message] || 0) + 1;
            }
        }

        if (showProgress) {
            process.stdout.write(`\r✅ Processed ${results.processed_claims}/${numClaims} claims\n`);
        }

        // Calculate statistics
        results.average_processing_time = results.processing_times.length > 0 ? 
            results.processing_times.reduce((a, b) => a + b, 0) / results.processing_times.length : 0;
        
        results.success_rate = (results.successful_claims / numClaims) * 100;
        results.nsa_protection_rate = (results.nsa_protected_claims / numClaims) * 100;
        results.bundling_rate = (results.bundled_claims / numClaims) * 100;
        results.prior_auth_rate = (results.prior_auth_required / numClaims) * 100;
        results.average_patient_liability = results.total_patient_liability / results.successful_claims;

        return results;
    }

    async processClaim(ruleEngine, claim) {
        const result = {
            bundled: false,
            prior_auth_required: false,
            errors: []
        };

        // Check bundling
        const bundlingResult = ruleEngine.applyBundlingRules(claim.cpt_codes);
        if (bundlingResult && bundlingResult.action === 'bundle_services') {
            result.bundled = true;
        }

        // Check prior auth
        const priorAuthResult = ruleEngine.checkPriorAuth(claim.cpt_codes);
        if (priorAuthResult && priorAuthResult.prior_auth_required) {
            result.prior_auth_required = true;
        }

        return result;
    }

    getServiceType(cptCode) {
        const emergencyCodes = ['99281', '99282', '99283', '99284', '99285'];
        const surgeryCodes = ['27447', '27130', '66984'];
        
        if (emergencyCodes.includes(cptCode)) {
            return 'emergency_care';
        } else if (surgeryCodes.includes(cptCode)) {
            return 'surgery';
        } else {
            return 'outpatient';
        }
    }
}

class LoadTester {
    constructor() {
        this.simulator = new ClaimSimulator();
    }

    async runLoadTest(options = {}) {
        const {
            concurrentUsers = 10,
            claimsPerUser = 50,
            rampUpSeconds = 30
        } = options;

        console.log(`🚀 Running load test: ${concurrentUsers} users, ${claimsPerUser} claims each`);
        console.log(`📈 Ramp up: ${rampUpSeconds} seconds`);

        const startTime = Date.now();
        const promises = [];
        const results = [];

        // Stagger user start times
        for (let user = 0; user < concurrentUsers; user++) {
            const delay = (user / concurrentUsers) * rampUpSeconds * 1000;
            
            const userPromise = new Promise(async (resolve) => {
                await new Promise(r => setTimeout(r, delay));
                
                const userStartTime = Date.now();
                const userResult = await this.simulator.runClaimSimulation({
                    numClaims: claimsPerUser,
                    showProgress: false
                });
                const userEndTime = Date.now();

                resolve({
                    user_id: user + 1,
                    start_time: userStartTime,
                    end_time: userEndTime,
                    duration: userEndTime - userStartTime,
                    ...userResult
                });
            });

            promises.push(userPromise);
        }

        // Wait for all users to complete
        const userResults = await Promise.all(promises);
        const totalTime = Date.now() - startTime;

        // Aggregate results
        const aggregated = {
            test_config: { concurrentUsers, claimsPerUser, rampUpSeconds },
            total_test_time: totalTime,
            total_claims: concurrentUsers * claimsPerUser,
            total_successful: userResults.reduce((sum, r) => sum + r.successful_claims, 0),
            total_failed: userResults.reduce((sum, r) => sum + r.failed_claims, 0),
            average_response_time: 0,
            throughput_claims_per_second: 0,
            user_results: userResults
        };

        // Calculate averages
        const allProcessingTimes = userResults.flatMap(r => r.processing_times);
        aggregated.average_response_time = allProcessingTimes.reduce((a, b) => a + b, 0) / allProcessingTimes.length;
        aggregated.throughput_claims_per_second = (aggregated.total_successful / totalTime) * 1000;

        return aggregated;
    }
}

// Main simulation runner
async function runSimulation(type = 'basic', options = {}) {
    console.log('🧪 MEDVault Simulation Suite');
    console.log('=' .repeat(50));

    try {
        if (type === 'basic') {
            const simulator = new ClaimSimulator();
            const results = await simulator.runClaimSimulation(options);
            
            console.log('\n📊 Simulation Results:');
            console.log('=' .repeat(50));
            console.log(`Total Claims: ${results.total_claims}`);
            console.log(`Success Rate: ${results.success_rate.toFixed(1)}%`);
            console.log(`NSA Protection Rate: ${results.nsa_protection_rate.toFixed(1)}%`);
            console.log(`Bundling Rate: ${results.bundling_rate.toFixed(1)}%`);
            console.log(`Prior Auth Rate: ${results.prior_auth_rate.toFixed(1)}%`);
            console.log(`Average Processing Time: ${results.average_processing_time.toFixed(2)}ms`);
            console.log(`Average Patient Liability: $${results.average_patient_liability.toFixed(2)}`);
            
            if (Object.keys(results.error_distribution).length > 0) {
                console.log('\n❌ Error Distribution:');
                for (const [error, count] of Object.entries(results.error_distribution)) {
                    console.log(`   ${error}: ${count}`);
                }
            }

        } else if (type === 'load') {
            const loadTester = new LoadTester();
            const results = await loadTester.runLoadTest(options);
            
            console.log('\n📊 Load Test Results:');
            console.log('=' .repeat(50));
            console.log(`Total Test Time: ${(results.total_test_time / 1000).toFixed(1)}s`);
            console.log(`Total Claims: ${results.total_claims}`);
            console.log(`Successful Claims: ${results.total_successful}`);
            console.log(`Failed Claims: ${results.total_failed}`);
            console.log(`Average Response Time: ${results.average_response_time.toFixed(2)}ms`);
            console.log(`Throughput: ${results.throughput_claims_per_second.toFixed(1)} claims/second`);
        }

    } catch (error) {
        console.error('❌ Simulation failed:', error.message);
        process.exit(1);
    }
}

// Export for use as module or run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const type = args[0] || 'basic';
    const options = {};
    
    // Parse simple options
    for (let i = 1; i < args.length; i += 2) {
        const key = args[i].replace('--', '').replace('-', '_');
        const value = args[i + 1];
        
        if (value && !isNaN(value)) {
            options[key] = parseInt(value);
        } else if (value) {
            options[key] = value;
        }
    }

    runSimulation(type, options);
}

module.exports = {
    ClaimSimulator,
    LoadTester,
    runSimulation
};