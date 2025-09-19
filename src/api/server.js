const express = require('express');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const RuleEngine = require('../rule-engine/rule-engine');
const NSACalculator = require('../nsa-calculator/nsa-calculator');

const app = express();
app.use(express.json());

// Load OpenAPI specification
const openApiPath = path.join(__dirname, '../../schemas/api/openapi.yaml');
const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));

// Swagger UI
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));

// Load payer profiles
const payerProfiles = new Map();

function loadPayerProfiles() {
    const profilesDir = path.join(__dirname, '../../examples/payer-profiles');
    const files = fs.readdirSync(profilesDir);
    
    for (const file of files) {
        if (file.endsWith('.yaml')) {
            const profilePath = path.join(profilesDir, file);
            const profileData = yaml.load(fs.readFileSync(profilePath, 'utf8'));
            const profileId = path.basename(file, '.yaml');
            payerProfiles.set(profileId, {
                id: profileId,
                ...profileData,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });
        }
    }
}

// Initialize profiles
loadPayerProfiles();

// Middleware for payer profile validation
function validatePayerProfile(req, res, next) {
    const profileId = req.body.payer_profile_id || req.params.profileId;
    if (profileId && !payerProfiles.has(profileId)) {
        return res.status(404).json({
            error: "Profile not found",
            message: `Payer profile '${profileId}' does not exist`
        });
    }
    req.payerProfile = payerProfiles.get(profileId);
    next();
}

// API Routes

// Scrubber API
app.post('/scrubber/run', validatePayerProfile, async (req, res) => {
    try {
        const { payer_profile_id, claims, options = {} } = req.body;
        
        if (!claims || !Array.isArray(claims) || claims.length === 0) {
            return res.status(400).json({
                error: "Invalid request",
                message: "Claims array is required and must not be empty"
            });
        }

        const ruleEngine = new RuleEngine(req.payerProfile);
        const startTime = Date.now();
        
        const results = [];
        let passed = 0, failed = 0, warnings = 0;

        for (const claim of claims) {
            const result = await processClaim(ruleEngine, claim, options);
            results.push(result);
            
            switch (result.status) {
                case 'passed': passed++; break;
                case 'failed': failed++; break;
                case 'warning': warnings++; break;
            }
        }

        const processingTime = Date.now() - startTime;

        res.json({
            request_id: generateRequestId(),
            processed_at: new Date().toISOString(),
            results,
            summary: {
                total_claims: claims.length,
                passed_claims: passed,
                failed_claims: failed,
                warnings,
                processing_time_ms: processingTime
            }
        });

    } catch (error) {
        res.status(500).json({
            error: "Processing error",
            message: error.message
        });
    }
});

// NSA Calculator API
app.post('/nsa/calc', validatePayerProfile, async (req, res) => {
    try {
        const calculator = new NSACalculator(req.payerProfile);
        const calculation = calculator.calculatePatientLiability(req.body);
        
        res.json({
            calculation_id: generateRequestId(),
            calculated_at: new Date().toISOString(),
            ...calculation
        });

    } catch (error) {
        res.status(500).json({
            error: "Calculation error",
            message: error.message
        });
    }
});

// Payer Profiles API
app.get('/payer-profiles', (req, res) => {
    const { type, region, active_only = 'true' } = req.query;
    let profiles = Array.from(payerProfiles.values());

    if (type) {
        profiles = profiles.filter(p => p.payer_info?.type === type);
    }

    if (region) {
        profiles = profiles.filter(p => p.payer_info?.region === region);
    }

    if (active_only === 'true') {
        const now = new Date();
        profiles = profiles.filter(p => {
            const effectiveDate = new Date(p.payer_info?.effective_date);
            const expirationDate = p.payer_info?.expiration_date ? 
                new Date(p.payer_info.expiration_date) : null;
            
            return effectiveDate <= now && (!expirationDate || expirationDate >= now);
        });
    }

    res.json({
        profiles,
        total: profiles.length,
        page: 1,
        per_page: profiles.length
    });
});

app.get('/payer-profiles/:profileId', validatePayerProfile, (req, res) => {
    res.json(req.payerProfile);
});

app.post('/payer-profiles', (req, res) => {
    try {
        const profileId = generateRequestId();
        const profile = {
            id: profileId,
            ...req.body,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        // Validate schema here in a real implementation
        payerProfiles.set(profileId, profile);
        
        res.status(201).json(profile);
    } catch (error) {
        res.status(400).json({
            error: "Validation error",
            message: error.message
        });
    }
});

app.put('/payer-profiles/:profileId', validatePayerProfile, (req, res) => {
    const profile = {
        ...req.payerProfile,
        ...req.body,
        updated_at: new Date().toISOString()
    };

    payerProfiles.set(req.params.profileId, profile);
    res.json(profile);
});

// Questionnaires API
app.get('/questionnaires', (req, res) => {
    const { audience, payer_type } = req.query;
    
    const questionnaires = [];
    
    if (!audience || audience === 'doctor') {
        questionnaires.push({
            id: 'doctor-prior-auth-questionnaire',
            title: 'Doctor Prior Authorization Assessment',
            description: 'Clinical assessment form for prior authorization requests',
            audience: 'doctor',
            fhir_resource: loadQuestionnaire('doctor-questionnaire.json')
        });
    }

    if (!audience || audience === 'patient') {
        questionnaires.push({
            id: 'patient-coverage-questionnaire',
            title: 'Patient Coverage and Consent Form',
            description: 'Patient information and consent collection',
            audience: 'patient',
            fhir_resource: loadQuestionnaire('patient-questionnaire.json')
        });
    }

    res.json({ questionnaires });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        payer_profiles_loaded: payerProfiles.size
    });
});

// Helper functions
async function processClaim(ruleEngine, claim, options) {
    const result = {
        claim_id: claim.claim_id,
        status: 'passed',
        original_claim: claim,
        processed_claim: { ...claim },
        applied_rules: [],
        issues: []
    };

    try {
        // Check eligibility
        const eligibilityResult = ruleEngine.checkEligibility(claim.patient_id, claim.service_date);
        if (eligibilityResult.result === 'false') {
            result.issues.push({
                type: 'warning',
                code: 'ELIGIBILITY_STALE',
                message: 'Eligibility verification required'
            });
            result.status = 'warning';
        }

        // Check prior authorization
        const priorAuthResult = ruleEngine.checkPriorAuth(claim.cpt_codes, claim.service_category);
        if (priorAuthResult.result === 'true') {
            result.issues.push({
                type: 'error',
                code: 'PRIOR_AUTH_REQUIRED',
                message: 'Prior authorization required for this service'
            });
            result.status = 'failed';
        }

        // Apply bundling rules
        const bundlingResult = ruleEngine.applyBundlingRules(claim.cpt_codes);
        if (bundlingResult.result === 'bundle_services') {
            result.processed_claim.cpt_codes = [bundlingResult.primary_cpt];
            result.applied_rules.push('bundling');
        }

        // Apply modifier rules
        if (claim.modifiers && claim.modifiers.length > 0) {
            const modifierResult = ruleEngine.applyModifiers(claim.cpt_codes[0], claim.modifiers);
            if (modifierResult.result === 'reject_modifier') {
                result.issues.push({
                    type: 'error',
                    code: 'INVALID_MODIFIER',
                    message: 'Invalid modifier for this service'
                });
                result.status = 'failed';
            }
        }

    } catch (error) {
        result.status = 'failed';
        result.issues.push({
            type: 'error',
            code: 'PROCESSING_ERROR',
            message: error.message
        });
    }

    return result;
}

function loadQuestionnaire(filename) {
    try {
        const questionnairePath = path.join(__dirname, '../../questionnaires/fhir', filename);
        return JSON.parse(fs.readFileSync(questionnairePath, 'utf8'));
    } catch (error) {
        return null;
    }
}

function generateRequestId() {
    return 'req_' + Math.random().toString(36).substr(2, 16) + Date.now().toString(36);
}

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`MEDVault API server running on port ${PORT}`);
    console.log(`API Documentation available at http://localhost:${PORT}/docs`);
    console.log(`Loaded ${payerProfiles.size} payer profiles`);
});

module.exports = app;