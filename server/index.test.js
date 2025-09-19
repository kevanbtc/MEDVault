const request = require('supertest');
const app = require('./index');

describe('MEDVault API', () => {
  test('GET /api/health should return OK', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
    expect(response.body.timestamp).toBeDefined();
  });

  test('POST /api/money/nsa-calculator should calculate NSA protection', async () => {
    const testData = {
      serviceCode: '99213',
      facilityType: 'hospital_outpatient',
      networkStatus: 'out_of_network',
      planType: 'emergency',
      deductible: 1000,
      coinsurance: 20,
      copay: 50
    };

    const response = await request(app)
      .post('/api/money/nsa-calculator')
      .send(testData)
      .expect(200);
    
    expect(response.body.serviceCode).toBe('99213');
    expect(response.body.nsaProtected).toBeDefined();
    expect(response.body.qualifiedPaymentAmount).toBeDefined();
    expect(response.body.patientResponsibility).toBeDefined();
  });

  test('GET /api/prices/hospital/:id/prices should return price data', async () => {
    const response = await request(app)
      .get('/api/prices/hospital/mayo-clinic/prices?serviceCode=99213')
      .expect(200);
    
    expect(response.body.hospitalName).toBeDefined();
    expect(response.body.estimatedCost).toBeDefined();
    expect(response.body.siteOfServiceOptions).toBeDefined();
  });
});