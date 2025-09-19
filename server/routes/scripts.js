const express = require('express');
const router = express.Router();

/**
 * Provider Scripts - Pre-filled communication templates
 */
router.get('/provider/:scriptType', async (req, res) => {
  try {
    const { scriptType } = req.params;
    const { serviceCode, facilityType, insurancePlan } = req.query;

    const script = generateProviderScript(scriptType, { serviceCode, facilityType, insurancePlan });
    
    res.json({
      scriptType,
      script,
      usage: getScriptUsage(scriptType),
      citations: getScriptCitations(scriptType)
    });
  } catch (error) {
    console.error('Provider script error:', error);
    res.status(500).json({ error: 'Failed to generate provider script' });
  }
});

/**
 * Dispute Scripts - Templates for billing disputes
 */
router.get('/dispute/:scriptType', async (req, res) => {
  try {
    const { scriptType } = req.params;
    const { billAmount, gfeAmount, issueType } = req.query;

    const script = generateDisputeScript(scriptType, { billAmount, gfeAmount, issueType });
    
    res.json({
      scriptType,
      script,
      nextSteps: getDisputeNextSteps(scriptType),
      timeline: getDisputeTimeline(scriptType),
      citations: getScriptCitations(scriptType)
    });
  } catch (error) {
    console.error('Dispute script error:', error);
    res.status(500).json({ error: 'Failed to generate dispute script' });
  }
});

/**
 * Insurance Appeal Scripts
 */
router.get('/appeal/:appealType', async (req, res) => {
  try {
    const { appealType } = req.params;
    const { denialReason, serviceCode, medicalNecessity } = req.query;

    const script = generateAppealScript(appealType, { denialReason, serviceCode, medicalNecessity });
    
    res.json({
      appealType,
      script,
      requiredDocuments: getAppealDocuments(appealType),
      timeline: getAppealTimeline(appealType),
      successTips: getAppealSuccessTips(appealType)
    });
  } catch (error) {
    console.error('Appeal script error:', error);
    res.status(500).json({ error: 'Failed to generate appeal script' });
  }
});

/**
 * Financial Assistance Scripts
 */
router.get('/financial-assistance/:hospitalId', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { income, familySize, billAmount } = req.query;

    const script = generateFinancialAssistanceScript({ hospitalId, income, familySize, billAmount });
    const hospitalPolicy = await getHospitalFAPInfo(hospitalId);
    
    res.json({
      script,
      hospitalPolicy,
      eligibilityGuidance: getEligibilityGuidance(income, familySize, hospitalPolicy),
      requiredDocuments: getFAPDocuments(),
      citations: [
        "IRS Section 501(r) - Financial Assistance Policy Requirements",
        "https://www.irs.gov/charities-non-profits/financial-assistance-policy-and-emergency-medical-care-policy-section-501r4"
      ]
    });
  } catch (error) {
    console.error('Financial assistance script error:', error);
    res.status(500).json({ error: 'Failed to generate financial assistance script' });
  }
});

// Helper functions
function generateProviderScript(scriptType, params) {
  const scripts = {
    site_of_service: `
Hello, I'm scheduled for ${params.serviceCode || 'a procedure'} and I'd like to discuss the site of service to help manage my healthcare costs. 

Can we schedule this procedure at ${getSiteRecommendation(params.facilityType)} instead of the hospital outpatient department? My insurance plan provides better coverage for outpatient settings, and this would significantly reduce my out-of-pocket costs.

I understand the clinical appropriateness needs to be considered, but if this procedure can safely be performed in an outpatient setting, I would prefer that option.

Could you help me understand the different site options available and their associated costs with my insurance plan?

Thank you for helping me make an informed decision about my care.`,

    good_faith_estimate: `
I'm scheduled for services on [DATE] and I'd like to request a Good Faith Estimate as required under the No Surprises Act.

Could you please provide:
1. A detailed estimate of expected charges for all services
2. Information about all providers who will be involved
3. Any facility fees that may apply
4. The expected total cost range

I understand this estimate is not a guarantee, but it will help me plan financially and understand my options. I also understand I have the right to dispute charges that exceed this estimate by $400 or more.

Please provide this in writing so I can review it before my scheduled service date.`,

    network_status: `
I want to confirm the network status of all providers who will be involved in my care to avoid surprise billing.

Can you please verify:
1. Your network status with my insurance plan [PLAN NAME]
2. The network status of any other physicians who may be involved
3. The network status of the facility where services will be provided
4. Any potential out-of-network providers I should be aware of

If any providers are out-of-network, please let me know so we can discuss alternatives or I can provide appropriate consent if needed.

I want to ensure I receive the full protection of the No Surprises Act.`
  };

  return scripts[scriptType] || 'Script type not found';
}

function generateDisputeScript(scriptType, params) {
  const scripts = {
    itemized_bill_request: `
I am requesting a detailed, itemized bill for services provided on [SERVICE DATE]. 

The current bill does not provide sufficient detail for me to understand the charges. Please provide:
1. A complete itemized breakdown of all services
2. Procedure codes (CPT/HCPCS) for all services
3. Diagnosis codes (ICD-10) used
4. Individual pricing for each line item
5. Any applicable facility fees

This request is made in accordance with my patient rights and is necessary for me to properly review the accuracy of charges.

Please pause any collection activities until I receive and have the opportunity to review the itemized statement.`,

    gfe_variance_dispute: `
I am disputing charges that exceed the Good Faith Estimate provided prior to service.

The actual charges of $${params.billAmount} exceed the estimated amount of $${params.gfeAmount} by $${params.billAmount - params.gfeAmount}, which is more than the $400 threshold established under the No Surprises Act.

I am requesting:
1. A review of all charges against the original estimate
2. An explanation for the variance in costs
3. Adjustment of charges to align with the original estimate where appropriate
4. Initiation of the patient-provider dispute resolution process if needed

I have attached the original Good Faith Estimate for your reference.`,

    cfpb_guidance: `
I am requesting a review of these medical charges based on concerns about accuracy and billing practices.

The Consumer Financial Protection Bureau has issued guidance regarding the collection of inaccurate medical debts, emphasizing that providers must verify the accuracy of charges before pursuing collection activities.

I am requesting:
1. Verification of the accuracy of all charges
2. Supporting documentation for all services billed
3. Correction of any identified errors
4. Suspension of collection activities pending resolution

Please treat this as a formal dispute requiring investigation and response within 30 days.`
  };

  return scripts[scriptType] || 'Script type not found';
}

function generateAppealScript(appealType, params) {
  const scripts = {
    prior_auth_denial: `
I am formally appealing the denial of prior authorization for ${params.serviceCode}.

The denial was based on "${params.denialReason}", however, I believe this service is medically necessary based on:

1. My physician's clinical assessment and recommendation
2. Evidence-based treatment guidelines that support this intervention
3. Failure of previous conservative treatments
4. The potential for significant health consequences without treatment

I am including:
- Physician's letter of medical necessity
- Relevant medical records and test results
- Published clinical guidelines supporting this treatment
- Documentation of previous treatments attempted

I request an expedited review given the potential impact on my health condition.`,

    experimental_treatment: `
I am appealing the denial of coverage for treatment that was classified as "experimental" or "investigational."

This treatment is supported by:
1. Published peer-reviewed studies demonstrating efficacy
2. Professional medical society guidelines
3. FDA approval for this indication
4. Standard of care in the medical community

The denial appears to be based on outdated information or overly restrictive interpretation of coverage policies. I request a thorough review by a qualified medical professional in the relevant specialty.`
  };

  return scripts[appealType] || 'Script type not found';
}

function generateFinancialAssistanceScript(params) {
  return `
I am writing to request information about your Financial Assistance Policy and to apply for financial assistance with my medical bills.

Account Information:
- Patient Name: [NAME]
- Account Number: ${params.hospitalId || '[ACCOUNT_NUMBER]'}
- Service Date: [SERVICE_DATE]
- Total Amount Due: $${params.billAmount || '[AMOUNT]'}

Financial Information:
- Annual Household Income: $${params.income || '[INCOME]'}
- Family Size: ${params.familySize || '[FAMILY_SIZE]'}

I believe I may qualify for assistance under your Financial Assistance Policy as required by IRS Section 501(r). 

Please provide:
1. A copy of your current Financial Assistance Policy
2. The financial assistance application
3. A list of required supporting documents
4. Information about payment plan options

I understand that nonprofit hospitals are required to have written financial assistance policies and to limit charges and collections for eligible patients.

I am committed to working with you to resolve this matter and would appreciate your guidance on the application process.

Thank you for your consideration.`;
}

// Utility functions
function getSiteRecommendation(currentFacilityType) {
  const alternatives = {
    hospital_outpatient: 'an ambulatory surgical center or your office',
    hospital_inpatient: 'an outpatient setting if clinically appropriate',
    emergency_room: 'an urgent care center or your office if not a true emergency'
  };

  return alternatives[currentFacilityType] || 'a more cost-effective setting';
}

function getScriptUsage(scriptType) {
  const usage = {
    site_of_service: 'Use when discussing procedure location options with your provider',
    good_faith_estimate: 'Request before any non-emergency services',
    network_status: 'Verify before scheduling any appointments or procedures'
  };

  return usage[scriptType] || 'General use';
}

function getScriptCitations(scriptType) {
  const citations = {
    site_of_service: [
      "CMS Hospital Price Transparency Requirements",
      "https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency"
    ],
    good_faith_estimate: [
      "No Surprises Act - Good Faith Estimate Requirements",
      "https://www.cms.gov/nosurprises/policies-and-resources/overview-of-rules-fact-sheets"
    ],
    cfpb_guidance: [
      "CFPB Takes Aim at Double Billing and Inflated Charges",
      "https://www.consumerfinance.gov/about-us/newsroom/cfpb-takes-aim-at-double-billing-and-inflated-charges-in-medical-debt-collection/"
    ]
  };

  return citations[scriptType] || [];
}

function getDisputeNextSteps(scriptType) {
  return [
    'Send via email and certified mail',
    'Keep copies of all correspondence',
    'Follow up in 14 days if no response',
    'Escalate to insurance ombudsman if needed'
  ];
}

function getDisputeTimeline(scriptType) {
  return '30 days for initial response, 60 days for full resolution';
}

function getAppealDocuments(appealType) {
  return [
    'Copy of denial letter',
    'Physician letter of medical necessity',
    'Relevant medical records',
    'Clinical studies or guidelines',
    'Insurance plan documents'
  ];
}

function getAppealTimeline(appealType) {
  return 'Initial appeal: 30 days, External review: 60 days';
}

function getAppealSuccessTips(appealType) {
  return [
    'Include specific medical evidence',
    'Reference plan coverage criteria',
    'Request expedited review if urgent',
    'Consider external review if denied'
  ];
}

async function getHospitalFAPInfo(hospitalId) {
  // Mock hospital FAP information
  return {
    hospitalName: 'Sample Hospital',
    fapUrl: 'https://hospital.com/financial-assistance',
    incomeThresholds: {
      '100%_discount': 200, // % of Federal Poverty Level
      '75%_discount': 250,
      '50%_discount': 300,
      '25%_discount': 400
    },
    applicationProcess: 'Online or paper application available',
    processingTime: '30-45 days'
  };
}

function getEligibilityGuidance(income, familySize, hospitalPolicy) {
  // Simplified eligibility estimation
  const fplGuidelines = {
    1: 14580,
    2: 19720,
    3: 24860,
    4: 30000 // 2024 Federal Poverty Level guidelines (simplified)
  };

  const fpl = fplGuidelines[familySize] || 30000;
  const incomePercent = (income / fpl) * 100;

  if (incomePercent <= 200) {
    return { eligible: true, discountLevel: '100%', recommendation: 'Apply immediately - you likely qualify for full assistance' };
  } else if (incomePercent <= 400) {
    return { eligible: true, discountLevel: 'Partial', recommendation: 'You likely qualify for partial assistance' };
  } else {
    return { eligible: false, discountLevel: 'None', recommendation: 'You may not qualify, but payment plans may be available' };
  }
}

function getFAPDocuments() {
  return [
    'Completed financial assistance application',
    'Recent tax returns or tax transcript',
    'Recent pay stubs or unemployment documentation',
    'Bank statements',
    'Proof of other income or benefits'
  ];
}

module.exports = router;