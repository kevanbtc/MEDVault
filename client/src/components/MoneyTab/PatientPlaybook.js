import React from 'react';

const PatientPlaybook = () => {
  const playbookSections = [
    {
      id: 'before-care',
      title: '1) Before care: set the price and the rules',
      items: [
        {
          action: 'Ask for a Good-Faith Estimate (GFE)',
          description: 'Your right under the No Surprises Act. Providers must give expected charges and there\'s a dispute process if they overshoot.',
          citation: 'Centers for Medicare & Medicaid Services',
          urgent: false
        },
        {
          action: 'Use hospital price tools',
          description: 'Every hospital must post machine-readable files and shoppable-services estimator. Screenshot the estimate.',
          citation: 'CMS Hospital Price Transparency',
          urgent: false
        },
        {
          action: 'Choose site of service',
          description: 'Ask if the procedure can be done outpatient/ASC/office—often cheaper than hospital outpatient.',
          citation: 'CMS price transparency and payer steerage norms',
          urgent: true
        },
        {
          action: 'Know your plan',
          description: 'Load plan docs into the vault and parse the benefits table (deductible, coinsurance, OON rules, prior auth).',
          citation: 'Your insurance contract',
          urgent: false
        }
      ]
    },
    {
      id: 'prescriptions',
      title: '2) Prescriptions: pay the lower number, but mind the traps',
      items: [
        {
          action: 'Compare discount cards & cash prices',
          description: 'GoodRx, etc. can beat copays. Cash-discounted prices frequently under retail and may beat insurance.',
          citation: 'PMC research on discount pricing',
          urgent: false
        },
        {
          action: 'Accumulator warning',
          description: 'Card/cash pay usually DOESN\'T count toward your deductible/OOP max—surface this every time.',
          citation: 'Consumer Financial Protection Bureau',
          urgent: true
        }
      ]
    },
    {
      id: 'during-care',
      title: '3) During care: avoid surprise billing',
      items: [
        {
          action: 'NSA protections',
          description: 'Emergency care, non-emergency at in-network facilities by OON clinicians, air ambulance → you owe only in-network cost-share.',
          citation: 'Centers for Medicare & Medicaid Services',
          urgent: true
        },
        {
          action: 'Don\'t sign consent forms',
          description: 'For non-emergent OON services, you can be asked to waive NSA protections—don\'t sign unless you truly want OON.',
          citation: 'Department of Labor NSA guidance',
          urgent: true
        }
      ]
    },
    {
      id: 'after-care',
      title: '4) After care: audit, negotiate, escalate',
      items: [
        {
          action: 'Demand itemized bill',
          description: 'Compare to your GFE/EOB. CFPB is actively policing double-billing and inflated medical debt collection.',
          citation: 'Centers for Medicare & Medicaid Services',
          urgent: false
        },
        {
          action: 'Charity care / financial assistance',
          description: 'Nonprofit hospitals are required to have written Financial Assistance Policy and limit charges for eligible patients.',
          citation: 'IRS Section 501(r)',
          urgent: false
        },
        {
          action: 'Appeal wrong denials',
          description: 'With policy citations attached (we auto-pack these).',
          citation: 'Your insurance plan documents',
          urgent: false
        }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-8">
      <div className="border-l-4 border-green-400 pl-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Patient Cost-Saving Playbook
        </h2>
        <p className="text-gray-600">
          Battle-tested + source-backed strategies to reduce your healthcare costs
        </p>
      </div>

      {playbookSections.map((section) => (
        <div key={section.id} className="space-y-4">
          <h3 className="text-xl font-semibold text-gray-800 border-b border-gray-200 pb-2">
            {section.title}
          </h3>
          
          <div className="grid gap-4">
            {section.items.map((item, index) => (
              <div 
                key={index} 
                className={`card ${item.urgent ? 'border-l-4 border-orange-400' : 'border-l-4 border-blue-400'}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2 flex items-center">
                      {item.urgent && (
                        <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full mr-2">
                          PRIORITY
                        </span>
                      )}
                      {item.action}
                    </h4>
                    <p className="text-gray-700 mb-3">{item.description}</p>
                    <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                      📚 Source: {item.citation}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Quick Action Buttons */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Request GFE</div>
            <div className="text-sm opacity-90 mt-1">Generate template letter</div>
          </button>
          
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Check Hospital Prices</div>
            <div className="text-sm opacity-90 mt-1">Find price transparency data</div>
          </button>
          
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Compare Drug Prices</div>
            <div className="text-sm opacity-90 mt-1">Cash vs insurance vs coupons</div>
          </button>
          
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Audit My Bill</div>
            <div className="text-sm opacity-90 mt-1">Check for errors and overcharges</div>
          </button>
          
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Calculate NSA Protection</div>
            <div className="text-sm opacity-90 mt-1">Check surprise billing protection</div>
          </button>
          
          <button className="btn-primary text-left p-4 h-auto">
            <div className="font-medium">Financial Assistance</div>
            <div className="text-sm opacity-90 mt-1">Check charity care eligibility</div>
          </button>
        </div>
      </div>

      {/* Important Notice */}
      <div className="alert-warning">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-xl">⚠️</span>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium">Medical Debt & Credit Reports (2025 Update)</h4>
            <div className="mt-2 text-sm">
              <p>
                The CFPB finalized a rule in Jan 2025 to keep medical debt off lender-used reports, but 
                <strong> a federal court later vacated it</strong>. The three major bureaus had already 
                removed paid medical collections and collections under $500. 
                <strong> You should still check your credit reports</strong> and dispute ineligible entries.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientPlaybook;