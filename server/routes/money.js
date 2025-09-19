const express = require('express');
const router = express.Router();

/**
 * NSA (No Surprises Act) Calculator
 * Calculates protected out-of-network costs using median contracted rates
 */
router.post('/nsa-calculator', async (req, res) => {
  try {
    const { 
      serviceCode, 
      facilityType, 
      networkStatus, 
      planType,
      deductible,
      coinsurance,
      copay
    } = req.body;

    // Validate required fields
    if (!serviceCode || !facilityType || !networkStatus) {
      return res.status(400).json({ 
        error: 'Missing required fields: serviceCode, facilityType, networkStatus' 
      });
    }

    // Mock QPA (Qualified Payment Amount) calculation
    // In production, this would integrate with actual payer data
    const mockQPA = await calculateQPA(serviceCode, facilityType);
    
    const nsaProtection = calculateNSAProtection(
      mockQPA, 
      networkStatus, 
      planType, 
      deductible, 
      coinsurance, 
      copay
    );

    res.json({
      serviceCode,
      qualifiedPaymentAmount: mockQPA,
      nsaProtected: nsaProtection.protected,
      patientResponsibility: nsaProtection.patientCost,
      balanceBillingBlocked: nsaProtection.balanceBillingBlocked,
      protectionType: nsaProtection.protectionType,
      citations: [
        "Centers for Medicare & Medicaid Services - No Surprises Act",
        "https://www.cms.gov/nosurprises/ending-surprise-medical-bills"
      ]
    });
  } catch (error) {
    console.error('NSA Calculator error:', error);
    res.status(500).json({ error: 'Failed to calculate NSA protection' });
  }
});

/**
 * Good Faith Estimate (GFE) Generator
 */
router.post('/generate-gfe', async (req, res) => {
  try {
    const { 
      patientInfo, 
      services, 
      providerInfo, 
      scheduledDate 
    } = req.body;

    const gfe = {
      id: `GFE-${Date.now()}`,
      patientInfo,
      providerInfo,
      scheduledDate,
      services: services.map(service => ({
        ...service,
        estimatedCost: calculateServiceCost(service),
        cptCode: service.cptCode,
        description: service.description
      })),
      totalEstimate: services.reduce((total, service) => 
        total + calculateServiceCost(service), 0
      ),
      generatedDate: new Date().toISOString(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
      disclaimers: [
        "This is a good faith estimate based on available information",
        "Actual costs may vary based on complications or additional services",
        "You have the right to dispute charges that exceed this estimate by $400 or more"
      ],
      disputeProcess: {
        contactInfo: "patient-advocate@medvault.com",
        timeLimit: "120 days from date of service",
        requiredDocuments: ["This GFE", "Itemized bill", "Insurance EOB if applicable"]
      }
    };

    res.json(gfe);
  } catch (error) {
    console.error('GFE Generator error:', error);
    res.status(500).json({ error: 'Failed to generate Good Faith Estimate' });
  }
});

// Helper functions
async function calculateQPA(serviceCode, facilityType) {
  // Mock QPA calculation - in production would use actual median contracted rates
  const baseCosts = {
    'office': { '99213': 180, '99214': 280, '36415': 25 },
    'hospital_outpatient': { '99213': 320, '99214': 480, '36415': 85 },
    'ambulatory_surgical': { '99213': 220, '99214': 320, '36415': 45 }
  };
  
  return baseCosts[facilityType]?.[serviceCode] || 200;
}

function calculateNSAProtection(qpa, networkStatus, planType, deductible, coinsurance, copay) {
  const isProtected = networkStatus === 'out_of_network' && 
    ['emergency', 'in_network_facility_oon_provider', 'air_ambulance'].includes(planType);
  
  if (isProtected) {
    // Calculate in-network cost sharing
    const patientCost = Math.min(copay || (qpa * (coinsurance / 100)), qpa);
    return {
      protected: true,
      patientCost,
      balanceBillingBlocked: true,
      protectionType: planType
    };
  }
  
  return {
    protected: false,
    patientCost: qpa, // Full amount if not protected
    balanceBillingBlocked: false,
    protectionType: null
  };
}

function calculateServiceCost(service) {
  // Mock service cost calculation
  const baseCost = service.baseCost || 100;
  const facilityMultiplier = service.facilityType === 'hospital_outpatient' ? 2.5 : 1.0;
  return Math.round(baseCost * facilityMultiplier);
}

module.exports = router;