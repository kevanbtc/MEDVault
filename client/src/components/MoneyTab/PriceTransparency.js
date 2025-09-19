import React, { useState } from 'react';
import apiService from '../../services/apiService';

const PriceTransparency = () => {
  const [searchForm, setSearchForm] = useState({
    hospitalId: 'mayo-clinic',
    serviceCode: '',
    facilityType: 'hospital_outpatient'
  });

  const [priceData, setPriceData] = useState(null);
  const [siteComparison, setSiteComparison] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const [priceResult, siteResult] = await Promise.all([
        apiService.getHospitalPrices(searchForm.hospitalId, searchForm.serviceCode, searchForm.facilityType),
        apiService.getSiteComparison(searchForm.serviceCode)
      ]);
      
      setPriceData(priceResult);
      setSiteComparison(siteResult);
    } catch (err) {
      setError('Failed to fetch price data. Please try again.');
      console.error('Price search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEstimate = async () => {
    if (!priceData) return;
    
    try {
      await apiService.saveEstimate({
        hospitalId: searchForm.hospitalId,
        serviceCode: searchForm.serviceCode,
        estimatedCost: priceData.estimatedCost,
        timestamp: new Date().toISOString(),
        url: priceData.priceTransparencyUrl
      });
      alert('Price estimate saved successfully!');
    } catch (err) {
      alert('Failed to save estimate. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-l-4 border-green-400 pl-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Hospital Price Transparency
        </h2>
        <p className="text-gray-600">
          Find and compare hospital prices using machine-readable pricing files
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hospital
            </label>
            <select
              value={searchForm.hospitalId}
              onChange={(e) => setSearchForm({...searchForm, hospitalId: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="mayo-clinic">Mayo Clinic</option>
              <option value="cleveland-clinic">Cleveland Clinic</option>
              <option value="johns-hopkins">Johns Hopkins</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service Code (CPT)
            </label>
            <input
              type="text"
              value={searchForm.serviceCode}
              onChange={(e) => setSearchForm({...searchForm, serviceCode: e.target.value})}
              placeholder="e.g., 99213"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Type
            </label>
            <select
              value={searchForm.facilityType}
              onChange={(e) => setSearchForm({...searchForm, facilityType: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="office">Physician Office</option>
              <option value="ambulatory_surgical_center">Ambulatory Surgical Center</option>
              <option value="hospital_outpatient">Hospital Outpatient</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {loading ? 'Searching...' : 'Search Prices'}
        </button>
      </form>

      {error && (
        <div className="alert-error">
          {error}
        </div>
      )}

      {/* Price Results */}
      {priceData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {priceData.hospitalName} Pricing
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Estimated Cost:</span>
                  <span className="text-2xl font-bold text-green-600">
                    ${priceData.estimatedCost}
                  </span>
                </div>

                {priceData.costRange && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Cost Range:</span>
                    <span className="text-sm text-gray-800">
                      ${priceData.costRange.min} - ${priceData.costRange.max}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="text-sm text-gray-800">
                    {priceData.lastUpdated}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  onClick={handleSaveEstimate}
                  className="btn-secondary w-full"
                >
                  📸 Save Price Estimate
                </button>
                <p className="text-xs text-gray-500 mt-2">
                  Save this estimate as evidence for billing disputes
                </p>
              </div>
            </div>

            {priceData.priceTransparencyUrl && (
              <div className="card">
                <h4 className="font-medium text-gray-900 mb-2">Price Transparency Resources</h4>
                <div className="space-y-2">
                  <a
                    href={priceData.priceTransparencyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-blue-600 hover:text-blue-800 text-sm"
                  >
                    🔗 Hospital Price Estimator Tool
                  </a>
                  {priceData.machineReadableFile && (
                    <a
                      href={priceData.machineReadableFile}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-blue-600 hover:text-blue-800 text-sm"
                    >
                      📄 Machine-Readable Price File
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Site of Service Comparison */}
          {siteComparison && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Site of Service Options
              </h3>
              
              <div className="space-y-3">
                {siteComparison.siteOptions.map((site, index) => (
                  <div
                    key={site.siteType}
                    className={`p-4 rounded-lg border ${
                      index === 0 ? 'border-green-200 bg-green-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900">
                        {site.name}
                        {index === 0 && (
                          <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                            RECOMMENDED
                          </span>
                        )}
                      </h4>
                      <span className="text-lg font-semibold text-gray-900">
                        ${site.estimatedCost}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <p><strong>Advantages:</strong> {site.advantages.join(', ')}</p>
                      <p><strong>Considerations:</strong> {site.considerations.join(', ')}</p>
                    </div>
                  </div>
                ))}
              </div>

              {siteComparison.potentialSavings > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    💰 <strong>Potential Savings:</strong> ${siteComparison.potentialSavings} by choosing the recommended site
                  </p>
                </div>
              )}

              {siteComparison.providerScript && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">💬 Provider Script</h4>
                  <p className="text-sm text-gray-700 italic">
                    "{siteComparison.providerScript}"
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {!priceData && !loading && (
        <div className="card bg-gray-50">
          <div className="text-center py-8">
            <div className="text-6xl mb-4">💰</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Price Transparency Search</h3>
            <p className="text-gray-600">
              Search hospital pricing data and compare costs across different sites of service.
            </p>
          </div>
        </div>
      )}

      {/* Citations */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📚 Sources</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• Centers for Medicare & Medicaid Services - Hospital Price Transparency</p>
          <p>• Hospital machine-readable pricing files (updated regularly)</p>
          <p>• CMS price transparency and payer steerage guidelines</p>
        </div>
      </div>
    </div>
  );
};

export default PriceTransparency;