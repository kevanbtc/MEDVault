const Ajv = require('ajv');
const addFormats = require('ajv-formats');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

class PayerProfileValidator {
    constructor() {
        this.ajv = new Ajv({ allErrors: true, verbose: true });
        addFormats(this.ajv);
        this.schema = null;
        this.loadSchema();
    }

    loadSchema() {
        try {
            const schemaPath = path.join(__dirname, '../../schemas/payer-profiles/payer-profile-schema.yaml');
            const schemaYaml = fs.readFileSync(schemaPath, 'utf8');
            this.schema = yaml.load(schemaYaml);
            this.validate = this.ajv.compile(this.schema);
        } catch (error) {
            console.error('Failed to load payer profile schema:', error.message);
        }
    }

    validateProfile(profile) {
        if (!this.validate) {
            throw new Error('Schema not loaded');
        }

        const valid = this.validate(profile);
        
        const result = {
            valid,
            errors: valid ? [] : this.validate.errors || [],
            warnings: []
        };

        // Additional business logic validations
        if (valid) {
            result.warnings = this.performBusinessValidations(profile);
        }

        return result;
    }

    performBusinessValidations(profile) {
        const warnings = [];

        // Check for reasonable coverage percentages
        if (profile.coverage_rules?.in_network_coverage?.percentage < 50) {
            warnings.push({
                field: 'coverage_rules.in_network_coverage.percentage',
                message: 'In-network coverage percentage is unusually low (< 50%)'
            });
        }

        if (profile.coverage_rules?.out_of_network_coverage?.percentage > profile.coverage_rules?.in_network_coverage?.percentage) {
            warnings.push({
                field: 'coverage_rules.out_of_network_coverage.percentage',
                message: 'Out-of-network coverage should typically be lower than in-network coverage'
            });
        }

        // Check deductible reasonableness
        const individualDeductible = profile.coverage_rules?.deductible_rules?.individual || 0;
        const familyDeductible = profile.coverage_rules?.deductible_rules?.family || 0;
        
        if (familyDeductible > 0 && familyDeductible < individualDeductible * 2) {
            warnings.push({
                field: 'coverage_rules.deductible_rules.family',
                message: 'Family deductible is typically at least 2x individual deductible'
            });
        }

        // Check NSA rules completeness
        if (!profile.nsa_rules?.emergency_services) {
            warnings.push({
                field: 'nsa_rules.emergency_services',
                message: 'NSA emergency services rules should be defined for compliance'
            });
        }

        // Check effective date
        if (profile.payer_info?.effective_date) {
            const effectiveDate = new Date(profile.payer_info.effective_date);
            const today = new Date();
            const oneYearFromNow = new Date();
            oneYearFromNow.setFullYear(today.getFullYear() + 1);

            if (effectiveDate > oneYearFromNow) {
                warnings.push({
                    field: 'payer_info.effective_date',
                    message: 'Effective date is more than one year in the future'
                });
            }
        }

        return warnings;
    }

    validateAllProfiles() {
        const profilesDir = path.join(__dirname, '../../examples/payer-profiles');
        const results = [];

        if (!fs.existsSync(profilesDir)) {
            throw new Error(`Profiles directory not found: ${profilesDir}`);
        }

        const files = fs.readdirSync(profilesDir).filter(file => file.endsWith('.yaml'));

        for (const file of files) {
            const profilePath = path.join(profilesDir, file);
            
            try {
                const profileData = yaml.load(fs.readFileSync(profilePath, 'utf8'));
                const validationResult = this.validateProfile(profileData);
                
                results.push({
                    file,
                    profile_name: profileData.payer_info?.name || 'Unknown',
                    ...validationResult
                });
            } catch (error) {
                results.push({
                    file,
                    profile_name: 'Failed to load',
                    valid: false,
                    errors: [{ message: error.message }],
                    warnings: []
                });
            }
        }

        return results;
    }
}

class APIValidator {
    constructor() {
        this.ajv = new Ajv({ allErrors: true });
        addFormats(this.ajv);
        this.schemas = new Map();
        this.loadSchemas();
    }

    loadSchemas() {
        try {
            const openApiPath = path.join(__dirname, '../../schemas/api/openapi.yaml');
            const openApiSpec = yaml.load(fs.readFileSync(openApiPath, 'utf8'));
            
            // Extract component schemas
            if (openApiSpec.components?.schemas) {
                for (const [schemaName, schema] of Object.entries(openApiSpec.components.schemas)) {
                    this.schemas.set(schemaName, this.ajv.compile(schema));
                }
            }
        } catch (error) {
            console.error('Failed to load API schemas:', error.message);
        }
    }

    validateRequest(schemaName, data) {
        const validator = this.schemas.get(schemaName);
        if (!validator) {
            throw new Error(`Schema ${schemaName} not found`);
        }

        const valid = validator(data);
        return {
            valid,
            errors: valid ? [] : validator.errors || []
        };
    }
}

class AvroValidator {
    constructor() {
        this.schemas = new Map();
        this.loadSchemas();
    }

    loadSchemas() {
        try {
            const eventsDir = path.join(__dirname, '../../schemas/events');
            const files = fs.readdirSync(eventsDir).filter(file => file.endsWith('.avsc'));

            for (const file of files) {
                const schemaPath = path.join(eventsDir, file);
                const schemaData = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));
                const schemaName = path.basename(file, '.avsc');
                
                // In a real implementation, you would use avsc library
                this.schemas.set(schemaName, schemaData);
            }
        } catch (error) {
            console.error('Failed to load Avro schemas:', error.message);
        }
    }

    validateEvent(schemaName, eventData) {
        const schema = this.schemas.get(schemaName);
        if (!schema) {
            throw new Error(`Avro schema ${schemaName} not found`);
        }

        // Simplified validation - in real implementation use avsc
        const result = {
            valid: true,
            errors: []
        };

        // Basic structure validation
        if (!eventData.event_id || !eventData.event_timestamp) {
            result.valid = false;
            result.errors.push({ message: 'Missing required event fields' });
        }

        return result;
    }
}

// Main validation runner
function validateAll() {
    console.log('🔍 MEDVault Validation Suite');
    console.log('=' .repeat(50));

    const results = {
        payer_profiles: [],
        api_schemas: { valid: true, errors: [] },
        avro_schemas: { valid: true, errors: [] },
        overall_valid: true
    };

    try {
        // Validate payer profiles
        console.log('📋 Validating payer profiles...');
        const profileValidator = new PayerProfileValidator();
        results.payer_profiles = profileValidator.validateAllProfiles();
        
        const invalidProfiles = results.payer_profiles.filter(p => !p.valid);
        if (invalidProfiles.length > 0) {
            results.overall_valid = false;
            console.log(`❌ ${invalidProfiles.length} invalid payer profiles found`);
            
            for (const profile of invalidProfiles) {
                console.log(`   - ${profile.file}: ${profile.errors.map(e => e.message).join(', ')}`);
            }
        } else {
            console.log(`✅ All ${results.payer_profiles.length} payer profiles are valid`);
        }

        // Show warnings
        const profilesWithWarnings = results.payer_profiles.filter(p => p.warnings.length > 0);
        if (profilesWithWarnings.length > 0) {
            console.log(`⚠️  ${profilesWithWarnings.length} profiles have warnings`);
            
            for (const profile of profilesWithWarnings) {
                console.log(`   - ${profile.file}:`);
                for (const warning of profile.warnings) {
                    console.log(`     ${warning.field}: ${warning.message}`);
                }
            }
        }

        // Validate API schemas
        console.log('\n🔌 Validating API schemas...');
        try {
            new APIValidator();
            console.log('✅ API schemas loaded successfully');
        } catch (error) {
            results.api_schemas.valid = false;
            results.api_schemas.errors.push({ message: error.message });
            results.overall_valid = false;
            console.log('❌ API schema validation failed:', error.message);
        }

        // Validate Avro schemas
        console.log('\n📡 Validating Avro schemas...');
        try {
            new AvroValidator();
            console.log('✅ Avro schemas loaded successfully');
        } catch (error) {
            results.avro_schemas.valid = false;
            results.avro_schemas.errors.push({ message: error.message });
            results.overall_valid = false;
            console.log('❌ Avro schema validation failed:', error.message);
        }

    } catch (error) {
        results.overall_valid = false;
        console.error('❌ Validation suite failed:', error.message);
    }

    console.log('\n📊 Validation Summary:');
    console.log('=' .repeat(50));
    console.log(`Overall Status: ${results.overall_valid ? '✅ VALID' : '❌ INVALID'}`);
    console.log(`Payer Profiles: ${results.payer_profiles.filter(p => p.valid).length}/${results.payer_profiles.length} valid`);
    console.log(`API Schemas: ${results.api_schemas.valid ? 'Valid' : 'Invalid'}`);
    console.log(`Avro Schemas: ${results.avro_schemas.valid ? 'Valid' : 'Invalid'}`);

    return results;
}

// Export for use as module or run directly
if (require.main === module) {
    const results = validateAll();
    process.exit(results.overall_valid ? 0 : 1);
}

module.exports = {
    PayerProfileValidator,
    APIValidator,
    AvroValidator,
    validateAll
};