import axios from 'axios';

const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        return response.data;
      },
      (error) => {
        console.error('API Error:', error);
        const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
        throw new Error(errorMessage);
      }
    );
  }

  // Money Tab - NSA Calculator
  async calculateNSA(data) {
    return this.client.post('/money/nsa-calculator', data);
  }

  async generateGFE(data) {
    return this.client.post('/money/generate-gfe', data);
  }

  // Prices
  async getHospitalPrices(hospitalId, serviceCode, facilityType) {
    return this.client.get(`/prices/hospital/${hospitalId}/prices`, {
      params: { serviceCode, facilityType }
    });
  }

  async getSiteComparison(serviceCode) {
    return this.client.get(`/prices/site-comparison/${serviceCode}`);
  }

  async saveEstimate(estimateData) {
    return this.client.post('/prices/save-estimate', estimateData);
  }

  // Bills
  async auditBill(billData) {
    return this.client.post('/bills/audit', billData);
  }

  async generateDisputeLetter(disputeData) {
    return this.client.post('/bills/generate-dispute-letter', disputeData);
  }

  async getDisputeStatus(disputeId) {
    return this.client.get(`/bills/dispute/${disputeId}/status`);
  }

  // Drugs
  async compareDrugPrices(ndc, quantity, zipCode, insurancePlan) {
    return this.client.get(`/drugs/compare/${ndc}`, {
      params: { quantity, zipCode, insurancePlan }
    });
  }

  async checkHSAFSAEligibility(items, accountType) {
    return this.client.post('/drugs/hsa-fsa-eligible', { items, accountType });
  }

  async findPharmacies(zipCode, ndc, insurancePlan) {
    return this.client.get(`/drugs/pharmacies/${zipCode}`, {
      params: { ndc, insurancePlan }
    });
  }

  // Scripts
  async getProviderScript(scriptType, params) {
    return this.client.get(`/scripts/provider/${scriptType}`, { params });
  }

  async getDisputeScript(scriptType, params) {
    return this.client.get(`/scripts/dispute/${scriptType}`, { params });
  }

  async getAppealScript(appealType, params) {
    return this.client.get(`/scripts/appeal/${appealType}`, { params });
  }

  async getFinancialAssistanceScript(hospitalId, params) {
    return this.client.get(`/scripts/financial-assistance/${hospitalId}`, { params });
  }

  // Health check
  async healthCheck() {
    return this.client.get('/health');
  }
}

const apiService = new ApiService();
export default apiService;