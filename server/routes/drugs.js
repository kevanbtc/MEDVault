const express = require('express');
const router = express.Router();

/**
 * Drug Price Comparator
 * Compares insurance copay vs discount cards vs cash prices
 */
router.get('/compare/:ndc', async (req, res) => {
  try {
    const { ndc } = req.params;
    const { quantity, zipCode, insurancePlan } = req.query;

    if (!ndc) {
      return res.status(400).json({ error: 'NDC (National Drug Code) required' });
    }

    const drugInfo = await getDrugInfo(ndc);
    const priceComparison = await compareDrugPrices(ndc, quantity || 30, zipCode, insurancePlan);
    
    res.json({
      ndc,
      drugInfo,
      priceComparison,
      accumulatorWarning: generateAccumulatorWarning(priceComparison),
      recommendations: generateDrugRecommendations(priceComparison),
      citations: [
        "A cost analysis of Mark Cuban Cost Plus Drugs, GoodRx, and insurance copays",
        "https://www.sciencedirect.com/science/article/pii/S0190962225001252"
      ]
    });
  } catch (error) {
    console.error('Drug comparison error:', error);
    res.status(500).json({ error: 'Failed to compare drug prices' });
  }
});

/**
 * HSA/FSA Eligibility Checker
 */
router.post('/hsa-fsa-eligible', async (req, res) => {
  try {
    const { items, accountType } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Items array required' });
    }

    const eligibilityResults = items.map(item => ({
      ...item,
      eligible: checkHSAFSAEligibility(item),
      annualLimit: getAnnualLimit(accountType, new Date().getFullYear()),
      taxSavings: calculateTaxSavings(item.cost, 0.22) // Assuming 22% tax bracket
    }));

    res.json({
      accountType,
      eligibilityResults,
      totalEligibleAmount: eligibilityResults
        .filter(item => item.eligible)
        .reduce((sum, item) => sum + item.cost, 0),
      totalTaxSavings: eligibilityResults
        .filter(item => item.eligible)
        .reduce((sum, item) => sum + item.taxSavings, 0),
      citations: [
        "IRS Publication 969 - Health Savings Accounts and Other Tax-Favored Health Plans",
        "https://www.irs.gov/publications/p969"
      ]
    });
  } catch (error) {
    console.error('HSA/FSA eligibility error:', error);
    res.status(500).json({ error: 'Failed to check HSA/FSA eligibility' });
  }
});

/**
 * Pharmacy Network Finder
 * Finds in-network pharmacies with best prices
 */
router.get('/pharmacies/:zipCode', async (req, res) => {
  try {
    const { zipCode } = req.params;
    const { ndc, insurancePlan } = req.query;

    const pharmacies = await findNearbyPharmacies(zipCode, ndc, insurancePlan);
    
    res.json({
      zipCode,
      ndc,
      pharmacies: pharmacies.map(pharmacy => ({
        ...pharmacy,
        estimatedSavings: pharmacy.cashPrice ? pharmacy.insurancePrice - pharmacy.cashPrice : 0
      })),
      recommendations: {
        lowestCash: pharmacies.sort((a, b) => a.cashPrice - b.cashPrice)[0],
        lowestInsurance: pharmacies.sort((a, b) => a.insurancePrice - b.insurancePrice)[0],
        bestValue: pharmacies.sort((a, b) => 
          Math.min(a.cashPrice || Infinity, a.insurancePrice || Infinity) - 
          Math.min(b.cashPrice || Infinity, b.insurancePrice || Infinity)
        )[0]
      }
    });
  } catch (error) {
    console.error('Pharmacy finder error:', error);
    res.status(500).json({ error: 'Failed to find pharmacies' });
  }
});

// Helper functions
async function getDrugInfo(ndc) {
  // Mock drug information - in production would integrate with drug databases
  const mockDrugs = {
    '0363-0114-01': {
      name: 'Atorvastatin 20mg',
      genericName: 'Atorvastatin',
      brandName: 'Lipitor',
      strength: '20mg',
      dosageForm: 'Tablet'
    },
    '0071-0155-23': {
      name: 'Lisinopril 10mg',
      genericName: 'Lisinopril',
      brandName: 'Prinivil',
      strength: '10mg',
      dosageForm: 'Tablet'
    }
  };

  return mockDrugs[ndc] || {
    name: 'Unknown Drug',
    genericName: 'Unknown',
    brandName: 'Unknown',
    strength: 'Unknown',
    dosageForm: 'Unknown'
  };
}

async function compareDrugPrices(ndc, quantity, zipCode, insurancePlan) {
  // Mock price comparison data
  const basePrice = Math.floor(Math.random() * 200) + 50;
  
  return {
    insuranceCopay: {
      price: basePrice * 0.3,
      source: 'Insurance Plan',
      countsTowardDeductible: true,
      countsTowardOOP: true
    },
    goodrx: {
      price: basePrice * 0.6,
      source: 'GoodRx Discount',
      countsTowardDeductible: false,
      countsTowardOOP: false,
      couponUrl: 'https://goodrx.com/coupon'
    },
    cubanCostPlus: {
      price: basePrice * 0.4,
      source: 'Mark Cuban Cost Plus Drug Company',
      countsTowardDeductible: false,
      countsTowardOOP: false,
      available: Math.random() > 0.3 // 70% availability
    },
    cashPrice: {
      price: basePrice,
      source: 'Retail Cash Price',
      countsTowardDeductible: false,
      countsTowardOOP: false
    },
    manufacturer: {
      price: basePrice * 0.2,
      source: 'Manufacturer Coupon',
      countsTowardDeductible: false,
      countsTowardOOP: false,
      available: Math.random() > 0.5, // 50% availability
      restrictions: ['Cannot be combined with insurance', 'Income limits may apply']
    }
  };
}

function generateAccumulatorWarning(priceComparison) {
  const nonDeductibleOptions = Object.entries(priceComparison)
    .filter(([key, option]) => !option.countsTowardDeductible && option.available !== false)
    .map(([key, option]) => key);

  if (nonDeductibleOptions.length === 0) {
    return null;
  }

  return {
    warning: true,
    message: "⚠️ ACCUMULATOR IMPACT: Discount cards and cash payments typically DO NOT count toward your deductible or out-of-pocket maximum. While you may save money now, these payments won't help you reach your annual limits.",
    affectedOptions: nonDeductibleOptions,
    recommendation: "Consider your annual healthcare needs when choosing payment method. If you expect to reach your deductible, insurance copays may be better long-term.",
    citation: "Consumer Financial Protection Bureau guidance on pharmacy benefit programs"
  };
}

function generateDrugRecommendations(priceComparison) {
  const options = Object.entries(priceComparison)
    .filter(([key, option]) => option.available !== false)
    .sort(([,a], [,b]) => a.price - b.price);

  const cheapestOption = options[0];
  const insuranceOption = priceComparison.insuranceCopay;

  const recommendations = [
    {
      type: 'lowest_cost',
      option: cheapestOption[0],
      price: cheapestOption[1].price,
      savings: insuranceOption.price - cheapestOption[1].price
    }
  ];

  if (cheapestOption[1].countsTowardDeductible !== insuranceOption.countsTowardDeductible) {
    recommendations.push({
      type: 'deductible_consideration',
      message: cheapestOption[1].countsTowardDeductible ? 
        'This option helps you reach your deductible' :
        'This option does not count toward your deductible',
      longTermImpact: !cheapestOption[1].countsTowardDeductible
    });
  }

  return recommendations;
}

function checkHSAFSAEligibility(item) {
  // Simplified eligibility check based on item type
  const eligibleCategories = [
    'prescription',
    'medical_device',
    'doctor_visit',
    'laboratory_test',
    'dental_care',
    'vision_care',
    'physical_therapy',
    'mental_health'
  ];

  const ineligibleCategories = [
    'cosmetic',
    'general_wellness',
    'vitamins',
    'over_counter_without_prescription'
  ];

  if (ineligibleCategories.includes(item.category)) {
    return false;
  }

  return eligibleCategories.includes(item.category) || item.prescriptionRequired;
}

function getAnnualLimit(accountType, year) {
  // 2024 limits
  const limits = {
    hsa: {
      individual: 4300,
      family: 8550
    },
    fsa: {
      individual: 3200,
      family: 3200 // FSAs are per employee, not family
    }
  };

  return limits[accountType.toLowerCase()] || limits.fsa;
}

function calculateTaxSavings(cost, taxRate) {
  return cost * taxRate;
}

async function findNearbyPharmacies(zipCode, ndc, insurancePlan) {
  // Mock pharmacy data
  const mockPharmacies = [
    {
      name: 'CVS Pharmacy',
      address: '123 Main St',
      distance: 0.5,
      network: true,
      cashPrice: 85,
      insurancePrice: 25,
      discountPrice: 42,
      hours: '8 AM - 10 PM'
    },
    {
      name: 'Walgreens',
      address: '456 Oak Ave', 
      distance: 0.8,
      network: true,
      cashPrice: 92,
      insurancePrice: 25,
      discountPrice: 38,
      hours: '7 AM - 11 PM'
    },
    {
      name: 'Independent Pharmacy',
      address: '789 Pine St',
      distance: 1.2,
      network: false,
      cashPrice: 65,
      insurancePrice: null,
      discountPrice: 35,
      hours: '9 AM - 7 PM'
    }
  ];

  return mockPharmacies;
}

module.exports = router;