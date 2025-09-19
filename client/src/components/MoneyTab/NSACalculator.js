import React, { useState } from 'react';
import apiService from '../../services/apiService';

const NSACalculator = () => {
  const [formData, setFormData] = useState({
    serviceCode: '',
    facilityType: 'hospital_outpatient',
    networkStatus: 'out_of_network',
    planType: 'emergency',
    deductible: '',
    coinsurance: '',
    copay: ''
  });

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.calculateNSA(formData);
      setResults(response);
    } catch (err) {
      setError('Failed to calculate NSA protection. Please try again.');
      console.error('NSA calculation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-l-4 border-blue-400 pl-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Surprises Act (NSA) Calculator
        </h2>
        <p className="text-gray-600">
          Calculate your protected out-of-network costs using median contracted rates
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Form */}
        <div className="space-y-6">
          <form onSubmit={handleCalculate} className="space-y-4">
            <div>
              <label htmlFor="serviceCode" className="block text-sm font-medium text-gray-700 mb-2">
                Service/Procedure Code (CPT)
              </label>
              <input
                type="text"
                id="serviceCode"
                name="serviceCode"
                value={formData.serviceCode}
                onChange={handleInputChange}
                placeholder="e.g., 99213, 99214, 36415"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="facilityType" className="block text-sm font-medium text-gray-700 mb-2">
                Facility Type
              </label>
              <select
                id="facilityType"
                name="facilityType"
                value={formData.facilityType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="office">Physician Office</option>
                <option value="ambulatory_surgical">Ambulatory Surgical Center</option>
                <option value="hospital_outpatient">Hospital Outpatient</option>
                <option value="hospital_inpatient">Hospital Inpatient</option>
              </select>
            </div>

            <div>
              <label htmlFor="planType" className="block text-sm font-medium text-gray-700 mb-2">
                NSA Protection Type
              </label>
              <select
                id="planType"
                name="planType"
                value={formData.planType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="emergency">Emergency Care</option>
                <option value="in_network_facility_oon_provider">In-Network Facility, Out-of-Network Provider</option>
                <option value="air_ambulance">Air Ambulance</option>
                <option value="ground_ambulance">Ground Ambulance (Limited Protection)</option>
                <option value="non_emergency_oon">Non-Emergency Out-of-Network</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="deductible" className="block text-sm font-medium text-gray-700 mb-2">
                  Deductible ($)
                </label>
                <input
                  type="number"
                  id="deductible"
                  name="deductible"
                  value={formData.deductible}
                  onChange={handleInputChange}
                  placeholder="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="coinsurance" className="block text-sm font-medium text-gray-700 mb-2">
                  Coinsurance (%)
                </label>
                <input
                  type="number"
                  id="coinsurance"
                  name="coinsurance"
                  value={formData.coinsurance}
                  onChange={handleInputChange}
                  placeholder="20"
                  min="0"
                  max="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="copay" className="block text-sm font-medium text-gray-700 mb-2">
                  Copay ($)
                </label>
                <input
                  type="number"
                  id="copay"
                  name="copay"
                  value={formData.copay}
                  onChange={handleInputChange}
                  placeholder="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Calculating...' : 'Calculate NSA Protection'}
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
          {results && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">NSA Protection Analysis</h3>
              
              <div className={`card ${results.nsaProtected ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                <div className="flex items-center mb-3">
                  <span className={`text-2xl mr-3 ${results.nsaProtected ? 'text-green-600' : 'text-red-600'}`}>
                    {results.nsaProtected ? '✅' : '❌'}
                  </span>
                  <div>
                    <h4 className={`font-semibold ${results.nsaProtected ? 'text-green-800' : 'text-red-800'}`}>
                      {results.nsaProtected ? 'You are protected by the NSA' : 'Limited or no NSA protection'}
                    </h4>
                    <p className={`text-sm ${results.nsaProtected ? 'text-green-700' : 'text-red-700'}`}>
                      {results.protectionType || 'No applicable protection category'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Qualified Payment Amount (QPA)</p>
                    <p className="text-lg font-semibold">${results.qualifiedPaymentAmount}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Your Responsibility</p>
                    <p className="text-lg font-semibold">${results.patientResponsibility}</p>
                  </div>
                </div>

                {results.balanceBillingBlocked && (
                  <div className="bg-white p-3 rounded border border-green-200">
                    <p className="text-sm font-medium text-green-800 mb-1">✅ Balance Billing Blocked</p>
                    <p className="text-sm text-green-700">
                      The provider cannot bill you for amounts above your in-network cost-sharing.
                    </p>
                  </div>
                )}
              </div>

              <div className="card">
                <h4 className="font-semibold text-gray-900 mb-3">What This Means</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  {results.nsaProtected ? (
                    <>
                      <li>• You pay only your normal in-network cost-sharing amount</li>
                      <li>• The provider cannot balance bill you for additional costs</li>
                      <li>• If you receive a bill for more, you can dispute it</li>
                      <li>• Your plan and the provider will settle payment separately</li>
                    </>
                  ) : (
                    <>
                      <li>• You may be responsible for the full out-of-network charges</li>
                      <li>• Balance billing is allowed in this scenario</li>
                      <li>• Consider asking for in-network alternatives</li>
                      <li>• You may be able to negotiate payment arrangements</li>
                    </>
                  )}
                </ul>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">📚 Citations & Sources</h4>
                <div className="space-y-1 text-sm text-blue-800">
                  {results.citations?.map((citation, index) => (
                    <p key={index}>• {citation}</p>
                  ))}
                </div>
              </div>
            </div>
          )}

          {!results && (
            <div className="card bg-gray-50">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">⚖️</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">NSA Protection Calculator</h3>
                <p className="text-gray-600">
                  Enter your service details to check if you're protected from surprise billing
                  under the No Surprises Act.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Information Section */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">About NSA Protections</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Protected Scenarios:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Emergency care at any facility</li>
              <li>• Out-of-network providers at in-network facilities</li>
              <li>• Air ambulance services</li>
              <li>• Some ancillary services (anesthesia, radiology, etc.)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Common Gaps:</h4>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Ground ambulance services</li>
              <li>• Voluntary out-of-network care with consent</li>
              <li>• Services at out-of-network facilities</li>
              <li>• Some post-stabilization services</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NSACalculator;