import React, { useState } from 'react';
import apiService from '../../services/apiService';

const DrugComparator = () => {
  const [drugSearch, setDrugSearch] = useState({
    ndc: '',
    quantity: '30',
    zipCode: '',
    insurancePlan: ''
  });

  const [priceComparison, setPriceComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.compareDrugPrices(
        drugSearch.ndc,
        drugSearch.quantity,
        drugSearch.zipCode,
        drugSearch.insurancePlan
      );
      setPriceComparison(response);
    } catch (err) {
      setError('Failed to compare drug prices. Please try again.');
      console.error('Drug comparison error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBestOption = (comparison) => {
    if (!comparison) return null;
    
    const options = Object.entries(comparison.priceComparison)
      .filter(([key, option]) => option.available !== false)
      .sort(([,a], [,b]) => a.price - b.price);
    
    return options[0];
  };

  const commonDrugs = [
    { ndc: '0363-0114-01', name: 'Atorvastatin 20mg (Generic Lipitor)' },
    { ndc: '0071-0155-23', name: 'Lisinopril 10mg (Generic Prinivil)' },
    { ndc: '0378-6055-93', name: 'Metformin 500mg (Generic Glucophage)' },
    { ndc: '0074-3368-02', name: 'Omeprazole 20mg (Generic Prilosec)' }
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="border-l-4 border-pink-400 pl-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Drug Price Comparator
        </h2>
        <p className="text-gray-600">
          Compare insurance copays vs discount cards vs cash prices with accumulator impact warnings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Search Form */}
        <div className="space-y-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drug (NDC or select from common drugs)
              </label>
              <input
                type="text"
                value={drugSearch.ndc}
                onChange={(e) => setDrugSearch({...drugSearch, ndc: e.target.value})}
                placeholder="Enter NDC number (e.g., 0363-0114-01)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
              
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Common drugs:</p>
                <div className="space-y-1">
                  {commonDrugs.map((drug) => (
                    <button
                      key={drug.ndc}
                      type="button"
                      onClick={() => setDrugSearch({...drugSearch, ndc: drug.ndc})}
                      className="block w-full text-left px-3 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50"
                    >
                      <div className="font-medium">{drug.name}</div>
                      <div className="text-gray-500">NDC: {drug.ndc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity (days)
                </label>
                <select
                  value={drugSearch.quantity}
                  onChange={(e) => setDrugSearch({...drugSearch, quantity: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="30">30 days</option>
                  <option value="60">60 days</option>
                  <option value="90">90 days</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ZIP Code
                </label>
                <input
                  type="text"
                  value={drugSearch.zipCode}
                  onChange={(e) => setDrugSearch({...drugSearch, zipCode: e.target.value})}
                  placeholder="12345"
                  maxLength="5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Insurance Plan (optional)
              </label>
              <input
                type="text"
                value={drugSearch.insurancePlan}
                onChange={(e) => setDrugSearch({...drugSearch, insurancePlan: e.target.value})}
                placeholder="Enter plan name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Comparing Prices...' : 'Compare Drug Prices'}
            </button>
          </form>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
        </div>

        {/* Results */}
        <div>
          {priceComparison && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {priceComparison.drugInfo.name} - Price Comparison
              </h3>

              {/* Best Option Highlight */}
              {getBestOption(priceComparison) && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-green-600 text-xl mr-2">💰</span>
                    <h4 className="font-semibold text-green-800">Best Price Option</h4>
                  </div>
                  <p className="text-green-700">
                    <strong>{getBestOption(priceComparison)[1].source}:</strong> ${getBestOption(priceComparison)[1].price}
                  </p>
                  <p className="text-sm text-green-600 mt-1">
                    {(() => {
                      const bestOption = getBestOption(priceComparison);
                      const insuranceCopay = priceComparison.priceComparison?.insuranceCopay;
                      const insurancePrice = insuranceCopay && typeof insuranceCopay.price === 'number' ? insuranceCopay.price : null;
                      const bestPrice = bestOption && bestOption[1] && typeof bestOption[1].price === 'number' ? bestOption[1].price : null;
                      if (insurancePrice !== null && bestPrice !== null) {
                        return <>Savings vs insurance: ${(insurancePrice - bestPrice).toFixed(2)}</>;
                      } else {
                        return <>Savings vs insurance: N/A</>;
                      }
                    })()}
                  </p>
                </div>
              )}

              {/* Price Options */}
              <div className="space-y-3">
                {Object.entries(priceComparison.priceComparison).map(([key, option]) => (
                  <div
                    key={key}
                    className={`card ${option.available === false ? 'opacity-60 bg-gray-50' : ''}`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium text-gray-900">
                        {option.source}
                        {option.available === false && (
                          <span className="ml-2 text-sm text-gray-500">(Not Available)</span>
                        )}
                      </h4>
                      <span className="text-xl font-bold text-gray-900">
                        ${option.price}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className={option.countsTowardDeductible ? 'text-green-600' : 'text-orange-600'}>
                          {option.countsTowardDeductible ? '✅' : '❌'} Counts to deductible
                        </p>
                      </div>
                      <div>
                        <p className={option.countsTowardOOP ? 'text-green-600' : 'text-orange-600'}>
                          {option.countsTowardOOP ? '✅' : '❌'} Counts to OOP max
                        </p>
                      </div>
                    </div>

                    {option.couponUrl && (
                      <div className="mt-2">
                        <a
                          href={option.couponUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          🔗 Get Coupon
                        </a>
                      </div>
                    )}

                    {option.restrictions && (
                      <div className="mt-2 text-xs text-gray-600">
                        <p><strong>Restrictions:</strong> {option.restrictions.join(', ')}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Accumulator Warning */}
              {priceComparison.accumulatorWarning && (
                <div className="alert-warning">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <span className="text-xl">⚠️</span>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium">Accumulator Impact Warning</h4>
                      <div className="mt-2 text-sm">
                        <p>{priceComparison.accumulatorWarning.message}</p>
                        <p className="mt-2 font-medium">
                          Recommendation: {priceComparison.accumulatorWarning.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Recommendations */}
              {priceComparison.recommendations && (
                <div className="card">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommendations</h4>
                  <div className="space-y-2">
                    {priceComparison.recommendations.map((rec, index) => (
                      <div key={index} className="text-sm">
                        <p className="font-medium text-gray-900">{rec.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-gray-700">
                          {rec.option ? `Use ${rec.option} - Save $${rec.savings}` : rec.message}
                        </p>
                        {rec.longTermImpact && (
                          <p className="text-orange-600 mt-1">
                            Consider long-term impact on deductible progress
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {!priceComparison && !loading && (
            <div className="card bg-gray-50">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">💊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Drug Price Comparison</h3>
                <p className="text-gray-600">
                  Enter a drug's NDC number to compare prices across insurance, discount cards, and cash options.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* HSA/FSA Helper */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">💳 HSA/FSA Eligibility</h3>
        <p className="text-gray-600 mb-4">
          Prescription drugs are generally HSA/FSA eligible. Use tax-advantaged dollars to maximize savings.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">2024 Contribution Limits:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• HSA Individual: $4,300</li>
              <li>• HSA Family: $8,550</li>
              <li>• FSA: $3,200</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Tax Savings (22% bracket):</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• $100 prescription = $22 tax savings</li>
              <li>• $500 prescription = $110 tax savings</li>
              <li>• Always keep receipts for reimbursement</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📚 Sources</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• Mark Cuban Cost Plus Drugs pricing analysis</p>
          <p>• GoodRx and discount card effectiveness studies</p>
          <p>• Consumer Financial Protection Bureau pharmacy benefit guidance</p>
          <p>• IRS HSA/FSA eligible expense guidelines</p>
        </div>
      </div>
    </div>
  );
};

export default DrugComparator;