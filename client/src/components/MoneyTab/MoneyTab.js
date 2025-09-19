import React, { useState } from 'react';
import NSACalculator from './NSACalculator';
import PriceTransparency from './PriceTransparency';
import BillAuditor from './BillAuditor';
import DrugComparator from './DrugComparator';
import PatientPlaybook from './PatientPlaybook';

const MoneyTab = () => {
  const [activeSection, setActiveSection] = useState('playbook');

  const sections = [
    { id: 'playbook', name: 'Cost-Saving Playbook', icon: '📋' },
    { id: 'nsa', name: 'NSA Calculator', icon: '⚖️' },
    { id: 'prices', name: 'Price Transparency', icon: '💰' },
    { id: 'audit', name: 'Bill Auditor', icon: '🔍' },
    { id: 'drugs', name: 'Drug Prices', icon: '💊' }
  ];

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'playbook':
        return <PatientPlaybook />;
      case 'nsa':
        return <NSACalculator />;
      case 'prices':
        return <PriceTransparency />;
      case 'audit':
        return <BillAuditor />;
      case 'drugs':
        return <DrugComparator />;
      default:
        return <PatientPlaybook />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Money Tab</h1>
        <p className="text-blue-100">
          Battle-tested cost-saving tools backed by primary sources and regulatory protections
        </p>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md">
        <nav className="flex space-x-1 p-4" role="tablist">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
              }`}
              role="tab"
            >
              <span className="mr-2">{section.icon}</span>
              {section.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <div className="bg-white rounded-lg shadow-md">
        {renderActiveSection()}
      </div>

      {/* Footer with Citations */}
      <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
        <p className="font-medium mb-2">Sources & Citations:</p>
        <ul className="space-y-1">
          <li>• Centers for Medicare & Medicaid Services - No Surprises Act & Price Transparency</li>
          <li>• Consumer Financial Protection Bureau - Medical Debt Collection Guidance</li>
          <li>• IRS Section 501(r) - Nonprofit Hospital Financial Assistance Requirements</li>
          <li>• Primary source data from hospital machine-readable pricing files</li>
        </ul>
      </div>
    </div>
  );
};

export default MoneyTab;