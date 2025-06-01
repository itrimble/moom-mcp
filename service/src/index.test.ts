import request from 'supertest';
import app from './index'; // Import the actual app from the same directory

describe('GET /unstable-sleep', () => {
  it('should return 200 OK and a valid message', async () => {
    const startTime = Date.now();
    const response = await request(app).get('/unstable-sleep');
    const endTime = Date.now();
    const duration = endTime - startTime;

    expect(response.status).toBe(200);
    expect(response.text).toMatch(/^Slept for \d+\.\d{2} seconds$/);

    // Check if the reported sleep time is roughly consistent with the actual delay
    const reportedDelay = parseFloat(response.text.match(/(\d+\.\d{2})/)?.[0] || "0");

    // Allow for network latency and processing time, up to 6 seconds total
    // (5s max sleep + 1s buffer)
    expect(duration).toBeGreaterThanOrEqual(reportedDelay * 1000);
    expect(duration).toBeLessThanOrEqual(6000);
    // Also check that the reported delay is within the 0-5s range.
    expect(reportedDelay).toBeGreaterThanOrEqual(0);
    expect(reportedDelay).toBeLessThanOrEqual(5);

  }, 7000); // Increase Jest timeout for this test to 7 seconds
});
