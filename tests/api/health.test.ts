/**
 * Health Check API Tests
 * Tests for GET /api/health
 */

import { BASE_URL } from '../setup';

describe('Health Check API - GET /api/health', () => {
  it('HLT-GET-001: should return healthy status', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.status).toBe('healthy');
  });

  it('HLT-GET-002: should include database status', async () => {
    const response = await fetch(`${BASE_URL}/api/health`);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.database).toBe('connected');
    expect(data.timestamp).toBeDefined();
  });
});

