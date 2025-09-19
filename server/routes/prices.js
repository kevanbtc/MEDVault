const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const router = express.Router();

/**
 * Hospital Price Transparency Fetcher
 * Fetches machine-readable pricing files and shoppable service estimators
 */
router.get('/hospital/:hospitalId/prices', async (req, res) => {
  try {
    const { hospitalId } = req.params;
    const { serviceCode, facilityType } = req.query;

    // Mock hospital price data - in production would fetch from actual hospital APIs
    const priceData = await fetchHospitalPrices(hospitalId, serviceCode);
    
    res.json({
      hospitalId,
      hospitalName: priceData.name,
      serviceCode,
      priceTransparencyUrl: priceData.priceTransparencyUrl,
      machineReadableFile: priceData.machineReadableFile,
      estimatedCost: priceData.estimatedCost,
      costRange: priceData.costRange,
      lastUpdated: priceData.lastUpdated,
      shoppableServices: priceData.shoppableServices,
      siteOfServiceOptions: await getSiteOfServiceOptions(serviceCode),
      citations: [
        "Centers for Medicare & Medicaid Services - Hospital Price Transparency",
        "https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency"
      ]
    });
  } catch (error) {
    console.error('Hospital prices fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch hospital prices' });
  }
});

/**
 * Site of Service Comparison
 * Compares costs across different care settings
 */
router.get('/site-comparison/:serviceCode', async (req, res) => {
  try {
    const { serviceCode } = req.params;
    
    const siteOptions = [
      {
        siteType: 'office',
        name: 'Physician Office',
        estimatedCost: 180,
        advantages: ['Lower cost', 'Faster scheduling', 'Less overhead'],
        considerations: ['Limited equipment for complex procedures']
      },
      {
        siteType: 'ambulatory_surgical_center',
        name: 'Ambulatory Surgical Center',
        estimatedCost: 220,
        advantages: ['Specialized equipment', 'Lower cost than hospital', 'Outpatient convenience'],
        considerations: ['Limited emergency support']
      },
      {
        siteType: 'hospital_outpatient',
        name: 'Hospital Outpatient',
        estimatedCost: 480,
        advantages: ['Full emergency support', 'Complete equipment'],
        considerations: ['Highest cost', 'Hospital facility fees']
      }
    ];

    // Filter based on service appropriateness
    const appropriateSites = filterAppropriateServices(serviceCode, siteOptions);
    
    res.json({
      serviceCode,
      siteOptions: appropriateSites,
      recommendation: appropriateSites[0], // Lowest cost appropriate option
      potentialSavings: appropriateSites[appropriateSites.length - 1].estimatedCost - appropriateSites[0].estimatedCost,
      providerScript: generateProviderScript(serviceCode, appropriateSites[0].siteType)
    });
  } catch (error) {
    console.error('Site comparison error:', error);
    res.status(500).json({ error: 'Failed to compare sites of service' });
  }
});

/**
 * Price Estimate Screenshot Storage
 * Stores price estimates with screenshots for evidence
 */
router.post('/save-estimate', async (req, res) => {
  try {
    const { 
      hospitalId, 
      serviceCode, 
      estimatedCost, 
      screenshot, 
      url, 
      timestamp 
    } = req.body;

    // In production, would save to database and cloud storage
    const estimate = {
      id: `EST-${Date.now()}`,
      hospitalId,
      serviceCode,
      estimatedCost,
      screenshotUrl: screenshot ? `screenshots/${Date.now()}.png` : null,
      sourceUrl: url,
      timestamp: timestamp || new Date().toISOString(),
      verified: true,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    res.json({
      success: true,
      estimate,
      message: 'Price estimate saved successfully'
    });
  } catch (error) {
    console.error('Save estimate error:', error);
    res.status(500).json({ error: 'Failed to save price estimate' });
  }
});

// Helper functions
async function fetchHospitalPrices(hospitalId, serviceCode) {
  // Mock data - in production would integrate with hospital APIs
  const mockHospitals = {
    'mayo-clinic': {
      name: 'Mayo Clinic',
      priceTransparencyUrl: 'https://www.mayoclinic.org/patient-visitor-guide/billing-insurance/price-estimates',
      machineReadableFile: 'https://www.mayoclinic.org/price-transparency.json',
      estimatedCost: 450,
      costRange: { min: 380, max: 520 },
      lastUpdated: '2024-01-15',
      shoppableServices: true
    },
    'cleveland-clinic': {
      name: 'Cleveland Clinic',
      priceTransparencyUrl: 'https://my.clevelandclinic.org/landing/price-transparency',
      machineReadableFile: 'https://www.clevelandclinic.org/price-transparency.csv',
      estimatedCost: 425,
      costRange: { min: 360, max: 490 },
      lastUpdated: '2024-01-20',
      shoppableServices: true
    }
  };

  return mockHospitals[hospitalId] || {
    name: 'Unknown Hospital',
    estimatedCost: 400,
    costRange: { min: 300, max: 500 },
    lastUpdated: '2024-01-01',
    shoppableServices: false
  };
}

async function getSiteOfServiceOptions(serviceCode) {
  // Mock appropriate sites based on service code
  const serviceMap = {
    '99213': ['office', 'ambulatory_surgical_center', 'hospital_outpatient'],
    '99214': ['office', 'ambulatory_surgical_center', 'hospital_outpatient'],
    '36415': ['office', 'ambulatory_surgical_center'],
    '29881': ['ambulatory_surgical_center', 'hospital_outpatient'] // Arthroscopy
  };

  return serviceMap[serviceCode] || ['office', 'hospital_outpatient'];
}

function filterAppropriateServices(serviceCode, siteOptions) {
  const appropriateSites = getSiteOfServiceOptions(serviceCode);
  return siteOptions
    .filter(site => appropriateSites.includes(site.siteType))
    .sort((a, b) => a.estimatedCost - b.estimatedCost);
}

function generateProviderScript(serviceCode, recommendedSite) {
  const siteNames = {
    office: 'your office or an outpatient clinic',
    ambulatory_surgical_center: 'an ambulatory surgical center',
    hospital_outpatient: 'hospital outpatient department'
  };

  return `Can we schedule this procedure (${serviceCode}) at ${siteNames[recommendedSite]} instead of the hospital outpatient department to reduce my out-of-pocket costs? My insurance plan provides better coverage for this setting.`;
}

module.exports = router;