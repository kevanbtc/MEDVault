import React, { useState } from 'react';
import apiService from '../../services/apiService';

const BillAuditor = () => {
  const [billData, setBillData] = useState({
    billId: '',
    totalAmount: '',
    lineItems: []
  });

  const [auditResults, setAuditResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDisputeLetter, setShowDisputeLetter] = useState(false);

  const addLineItem = () => {
    setBillData(prev => ({
      ...prev,
      lineItems: [...prev.lineItems, {
        id: Date.now(),
        code: '',
        description: '',
        amount: '',
        serviceDate: ''
      }]
    }));
  };

  const updateLineItem = (index, field, value) => {
    setBillData(prev => ({
      ...prev,
      lineItems: prev.lineItems.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeLineItem = (index) => {
    setBillData(prev => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index)
    }));
  };

  const handleAudit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const auditData = {
        itemizedBill: {
          ...billData,
          lineItems: billData.lineItems.map(item => ({
            ...item,
            amount: parseFloat(item.amount) || 0
          }))
        },
        patientInfo: { name: 'Patient' }
      };

      const results = await apiService.auditBill(auditData);
      setAuditResults(results);
    } catch (err) {
      setError('Failed to audit bill. Please try again.');
      console.error('Bill audit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generateDisputeLetter = async () => {
    if (!auditResults) return;

    try {
      const disputeData = {
        auditResults: auditResults.auditResults,
        patientInfo: { name: 'Patient Name' },
        providerInfo: { name: 'Provider Name', address: 'Provider Address' },
        billInfo: { accountNumber: billData.billId, serviceDate: 'Service Date' }
      };

      const response = await apiService.generateDisputeLetter(disputeData);
      setShowDisputeLetter(response);
    } catch (err) {
      alert('Failed to generate dispute letter. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="border-l-4 border-purple-400 pl-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Bill Auditor
        </h2>
        <p className="text-gray-600">
          Compare itemized bills against GFE and EOB to identify billing errors
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bill Input Form */}
        <div className="space-y-6">
          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bill ID / Account Number
              </label>
              <input
                type="text"
                value={billData.billId}
                onChange={(e) => setBillData(prev => ({...prev, billId: e.target.value}))}
                placeholder="Enter bill ID or account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Bill Amount ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={billData.totalAmount}
                onChange={(e) => setBillData(prev => ({...prev, totalAmount: e.target.value}))}
                placeholder="Enter total amount"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="block text-sm font-medium text-gray-700">
                  Line Items
                </label>
                <button
                  type="button"
                  onClick={addLineItem}
                  className="btn-secondary text-sm"
                >
                  + Add Line Item
                </button>
              </div>

              <div className="space-y-3 max-h-64 overflow-y-auto">
                {billData.lineItems.map((item, index) => (
                  <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="text"
                        value={item.code}
                        onChange={(e) => updateLineItem(index, 'code', e.target.value)}
                        placeholder="CPT Code"
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <input
                        type="number"
                        step="0.01"
                        value={item.amount}
                        onChange={(e) => updateLineItem(index, 'amount', e.target.value)}
                        placeholder="Amount"
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                      placeholder="Service description"
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm mb-2"
                    />
                    <div className="flex justify-between items-center">
                      <input
                        type="date"
                        value={item.serviceDate}
                        onChange={(e) => updateLineItem(index, 'serviceDate', e.target.value)}
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLineItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {billData.lineItems.length === 0 && (
                <p className="text-gray-500 text-sm text-center py-4">
                  No line items added yet. Click "Add Line Item" to start.
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || billData.lineItems.length === 0}
              className={`btn-primary w-full ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Auditing Bill...' : 'Audit Bill'}
            </button>
          </form>

          {error && (
            <div className="alert-error">
              {error}
            </div>
          )}
        </div>

        {/* Audit Results */}
        <div>
          {auditResults && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Audit Results</h3>
              
              {/* Overview Card */}
              <div className={`card ${auditResults.auditResults.highSeverityIssues > 0 ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}`}>
                <div className="flex items-center mb-3">
                  <span className={`text-2xl mr-3 ${auditResults.auditResults.highSeverityIssues > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {auditResults.auditResults.highSeverityIssues > 0 ? '⚠️' : '✅'}
                  </span>
                  <div>
                    <h4 className={`font-semibold ${auditResults.auditResults.highSeverityIssues > 0 ? 'text-red-800' : 'text-green-800'}`}>
                      {auditResults.auditResults.highSeverityIssues > 0 ? 'Issues Found' : 'Bill Looks Clean'}
                    </h4>
                    <p className={`text-sm ${auditResults.auditResults.highSeverityIssues > 0 ? 'text-red-700' : 'text-green-700'}`}>
                      {auditResults.auditResults.totalIssues} total issues, {auditResults.auditResults.highSeverityIssues} high severity
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Total Charges</p>
                    <p className="text-lg font-semibold">${auditResults.auditResults.totalCharges}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Potential Savings</p>
                    <p className="text-lg font-semibold text-green-600">
                      ${auditResults.auditResults.potentialSavings}
                    </p>
                  </div>
                </div>
              </div>

              {/* Line Item Analysis */}
              {auditResults.auditResults.lineItemAnalysis.length > 0 && (
                <div className="card">
                  <h4 className="font-semibold text-gray-900 mb-3">Line Item Analysis</h4>
                  <div className="space-y-3">
                    {auditResults.auditResults.lineItemAnalysis
                      .filter(item => item.issues.length > 0)
                      .map((item, index) => (
                      <div key={index} className="border border-gray-200 rounded p-3">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium text-gray-900">{item.code} - {item.description}</p>
                            <p className="text-sm text-gray-600">Charged: ${item.chargedAmount}</p>
                            {item.gfeEstimate && (
                              <p className="text-sm text-blue-600">GFE Estimate: ${item.gfeEstimate}</p>
                            )}
                          </div>
                        </div>
                        
                        {item.issues.map((issue, issueIndex) => (
                          <div key={issueIndex} className={`text-sm p-2 rounded ${
                            issue.severity === 'high' ? 'bg-red-50 text-red-800' : 'bg-yellow-50 text-yellow-800'
                          }`}>
                            <p className="font-medium">{issue.description}</p>
                            <p className="text-xs mt-1">Source: {issue.citation}</p>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {auditResults.auditResults.recommendedAction === 'dispute_recommended' && (
                <div className="card">
                  <h4 className="font-semibold text-gray-900 mb-3">Recommended Actions</h4>
                  <div className="space-y-3">
                    <button
                      onClick={generateDisputeLetter}
                      className="btn-primary w-full"
                    >
                      📄 Generate Dispute Letter
                    </button>
                    <div className="text-sm text-gray-600">
                      <p>Next steps:</p>
                      <ul className="list-disc list-inside mt-1">
                        {auditResults.nextSteps?.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {!auditResults && (
            <div className="card bg-gray-50">
              <div className="text-center py-8">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Bill Auditor</h3>
                <p className="text-gray-600">
                  Upload your itemized bill to check for errors, duplicate charges, and billing discrepancies.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dispute Letter Modal */}
      {showDisputeLetter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Generated Dispute Letter</h3>
                <button
                  onClick={() => setShowDisputeLetter(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-800">
                  {showDisputeLetter.disputeLetter}
                </pre>
              </div>

              <div className="text-sm text-gray-600 mb-4">
                <h4 className="font-medium mb-2">Supporting Documents to Include:</h4>
                <ul className="list-disc list-inside">
                  {showDisputeLetter.supportingDocuments?.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(showDisputeLetter.disputeLetter);
                    alert('Letter copied to clipboard!');
                  }}
                  className="btn-secondary"
                >
                  📋 Copy to Clipboard
                </button>
                <button
                  onClick={() => setShowDisputeLetter(null)}
                  className="btn-primary"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CFPB Information */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">📚 CFPB Guidance</h4>
        <div className="space-y-1 text-sm text-blue-800">
          <p>• CFPB is actively policing double-billing and inflated medical debt collection</p>
          <p>• Providers must verify accuracy before collection attempts</p>
          <p>• Patients have right to dispute inaccurate charges</p>
        </div>
      </div>
    </div>
  );
};

export default BillAuditor;