const express = require('express');
const router = express.Router();

/**
 * Bill Auditor - Compares itemized bills against GFE and EOB
 */
router.post('/audit', async (req, res) => {
  try {
    const { 
      itemizedBill, 
      goodFaithEstimate, 
      insuranceEOB, 
      patientInfo 
    } = req.body;

    if (!itemizedBill || !itemizedBill.lineItems) {
      return res.status(400).json({ error: 'Itemized bill with line items required' });
    }

    const auditResults = await performBillAudit(itemizedBill, goodFaithEstimate, insuranceEOB);
    
    res.json({
      billId: itemizedBill.billId,
      auditDate: new Date().toISOString(),
      auditResults,
      disputeRecommendation: generateDisputeRecommendation(auditResults),
      cfpbGuidance: getCFPBGuidance(auditResults),
      nextSteps: generateNextSteps(auditResults)
    });
  } catch (error) {
    console.error('Bill audit error:', error);
    res.status(500).json({ error: 'Failed to audit bill' });
  }
});

/**
 * Generate Dispute Letter
 */
router.post('/generate-dispute-letter', async (req, res) => {
  try {
    const { 
      auditResults, 
      patientInfo, 
      providerInfo, 
      billInfo 
    } = req.body;

    const disputeLetter = generateDisputeLetter(auditResults, patientInfo, providerInfo, billInfo);
    
    res.json({
      disputeLetter,
      supportingDocuments: [
        'Original itemized bill',
        'Good Faith Estimate (if applicable)',
        'Insurance EOB',
        'Bill audit report'
      ],
      submissionInstructions: {
        method: 'Email and certified mail',
        timeline: 'Submit within 120 days of service date',
        followUp: 'Allow 30 days for provider response'
      }
    });
  } catch (error) {
    console.error('Dispute letter generation error:', error);
    res.status(500).json({ error: 'Failed to generate dispute letter' });
  }
});

/**
 * Track Dispute Status
 */
router.get('/dispute/:disputeId/status', async (req, res) => {
  try {
    const { disputeId } = req.params;
    
    // Mock dispute tracking - in production would integrate with case management system
    const disputeStatus = {
      disputeId,
      status: 'under_review',
      submittedDate: '2024-01-15',
      expectedResolution: '2024-02-15',
      currentStep: 'provider_review',
      timeline: [
        { step: 'submitted', date: '2024-01-15', completed: true },
        { step: 'provider_review', date: '2024-01-20', completed: true },
        { step: 'insurance_review', date: null, completed: false },
        { step: 'resolution', date: null, completed: false }
      ],
      availableActions: ['check_status', 'submit_additional_documentation']
    };

    res.json(disputeStatus);
  } catch (error) {
    console.error('Dispute status error:', error);
    res.status(500).json({ error: 'Failed to get dispute status' });
  }
});

// Helper functions
async function performBillAudit(itemizedBill, gfe, eob) {
  const issues = [];
  const lineItemAnalysis = [];

  for (const lineItem of itemizedBill.lineItems) {
    const analysis = {
      lineItemId: lineItem.id,
      code: lineItem.code,
      description: lineItem.description,
      chargedAmount: lineItem.amount,
      issues: []
    };

    // Check against GFE
    if (gfe) {
      const gfeItem = gfe.services.find(s => s.cptCode === lineItem.code);
      if (gfeItem) {
        const variance = lineItem.amount - gfeItem.estimatedCost;
        analysis.gfeEstimate = gfeItem.estimatedCost;
        analysis.gfeVariance = variance;
        
        if (variance > 400) { // NSA dispute threshold
          analysis.issues.push({
            type: 'gfe_excess',
            severity: 'high',
            description: `Charged amount exceeds GFE by $${variance}, may qualify for NSA dispute`,
            citation: 'No Surprises Act - Good Faith Estimate protections'
          });
        }
      }
    }

    // Check for common billing issues
    if (isDuplicateCharge(lineItem, itemizedBill.lineItems)) {
      analysis.issues.push({
        type: 'duplicate_billing',
        severity: 'high',
        description: 'Potential duplicate charge detected',
        citation: 'CFPB guidance on duplicate billing practices'
      });
    }

    if (isPotentialUpcoding(lineItem)) {
      analysis.issues.push({
        type: 'upcoding',
        severity: 'medium',
        description: 'Charge may be higher complexity than documented',
        citation: 'CMS coding guidelines'
      });
    }

    lineItemAnalysis.push(analysis);
    if (analysis.issues.length > 0) {
      issues.push(...analysis.issues);
    }
  }

  return {
    totalCharges: itemizedBill.totalAmount,
    totalIssues: issues.length,
    highSeverityIssues: issues.filter(i => i.severity === 'high').length,
    potentialSavings: calculatePotentialSavings(lineItemAnalysis),
    lineItemAnalysis,
    overallAssessment: issues.length > 0 ? 'issues_found' : 'clean',
    recommendedAction: issues.length > 0 ? 'dispute_recommended' : 'no_action_needed'
  };
}

function generateDisputeRecommendation(auditResults) {
  if (auditResults.highSeverityIssues === 0) {
    return {
      recommended: false,
      reason: 'No significant billing issues detected'
    };
  }

  return {
    recommended: true,
    reason: `${auditResults.highSeverityIssues} high-severity issues detected`,
    potentialSavings: auditResults.potentialSavings,
    timeline: '30-60 days for resolution',
    successProbability: auditResults.highSeverityIssues > 2 ? 'high' : 'medium'
  };
}

function getCFPBGuidance(auditResults) {
  return {
    relevantGuidance: [
      'CFPB has issued guidance regarding collecting on inaccurate medical debts',
      'Providers must verify accuracy before collection attempts',
      'Patients have right to dispute inaccurate charges'
    ],
    citations: [
      'CFPB Takes Aim at Double Billing and Inflated Charges in Medical Debt Collection',
      'https://www.consumerfinance.gov/about-us/newsroom/cfpb-takes-aim-at-double-billing-and-inflated-charges-in-medical-debt-collection/'
    ]
  };
}

function generateNextSteps(auditResults) {
  const steps = [
    'Review audit findings carefully',
    'Gather supporting documentation',
    'Contact provider billing department'
  ];

  if (auditResults.recommendedAction === 'dispute_recommended') {
    steps.push(
      'Submit formal dispute letter',
      'Request itemized review',
      'Pause collection activities during dispute'
    );
  }

  return steps;
}

function generateDisputeLetter(auditResults, patientInfo, providerInfo, billInfo) {
  const currentDate = new Date().toLocaleDateString();
  
  return `${currentDate}

${providerInfo.name}
${providerInfo.address}
Attention: Billing Department

Re: Billing Dispute - Patient: ${patientInfo.name}
Account Number: ${billInfo.accountNumber}
Service Date: ${billInfo.serviceDate}

Dear Billing Manager,

I am writing to formally dispute charges on the above-referenced account. After careful review of the itemized bill, I have identified the following concerns:

${auditResults.lineItemAnalysis
  .filter(item => item.issues.length > 0)
  .map(item => `• ${item.description}: $${item.chargedAmount} - ${item.issues.map(issue => issue.description).join(', ')}`)
  .join('\n')}

I am requesting:
1. An itemized review of all disputed charges
2. Correction of any billing errors identified
3. A revised statement reflecting accurate charges
4. Pause of any collection activities pending resolution

This dispute is submitted in accordance with my rights under applicable billing regulations. The CFPB has issued guidance regarding the collection of inaccurate medical debts, and providers must verify the accuracy of charges before pursuing collection.

I have enclosed supporting documentation including the original bill, any relevant estimates, and insurance explanations of benefits.

Please confirm receipt of this dispute and provide your expected timeline for resolution.

Sincerely,
${patientInfo.name}

Enclosures: Supporting documentation`;
}

// Utility functions
function isDuplicateCharge(lineItem, allLineItems) {
  const matches = allLineItems.filter(item => 
    item.code === lineItem.code && 
    item.id !== lineItem.id &&
    item.serviceDate === lineItem.serviceDate
  );
  return matches.length > 0;
}

function isPotentialUpcoding(lineItem) {
  // Mock upcoding detection based on common patterns
  const highComplexityCodes = ['99215', '99285', '99291'];
  return highComplexityCodes.includes(lineItem.code) && lineItem.amount > 500;
}

function calculatePotentialSavings(lineItemAnalysis) {
  return lineItemAnalysis.reduce((total, item) => {
    const gfeVariance = item.gfeVariance > 0 ? item.gfeVariance : 0;
    const duplicateAmount = item.issues.some(i => i.type === 'duplicate_billing') ? item.chargedAmount : 0;
    return total + gfeVariance + duplicateAmount;
  }, 0);
}

module.exports = router;