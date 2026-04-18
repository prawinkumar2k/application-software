#!/usr/bin/env node

/**
 * DOTE ERP SYSTEM - COMPREHENSIVE VERIFICATION TEST
 * 
 * Tests all critical endpoints to ensure production readiness
 * Run: node comprehensive-system-test.js
 */

const http = require('http');

const API_BASE = 'http://localhost:5000/api/v1';
const TIMEOUT = 10000;

// Color codes for output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

class TestRunner {
  constructor() {
    this.passed = 0;
    this.failed = 0;
    this.logs = [];
    this.adminToken = null;
    this.studentToken = null;
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
    this.logs.push({ timestamp, message, type });
  }

  success(msg) {
    this.log(`${colors.green}✓${colors.reset} ${msg}`);
    this.passed++;
  }

  fail(msg) {
    this.log(`${colors.red}✗${colors.reset} ${msg}`);
    this.failed++;
  }

  title(msg) {
    console.log(`\n${colors.blue}=== ${msg} ===${colors.reset}`);
  }

  makeRequest(method, path, body = null, token = null) {
    return new Promise((resolve) => {
      // If path is a full URL, use it directly; otherwise append to API_BASE
      let fullUrl;
      if (path.startsWith('http')) {
        fullUrl = path;
      } else {
        fullUrl = API_BASE + (path.startsWith('/') ? path : '/' + path);
      }
      const url = new URL(fullUrl);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: { 'Content-Type': 'application/json' },
        timeout: TIMEOUT,
      };

      if (token) options.headers.Authorization = `Bearer ${token}`;

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            resolve({
              status: res.statusCode,
              body: JSON.parse(data || '{}'),
              headers: res.headers,
            });
          } catch {
            resolve({
              status: res.statusCode,
              body: { error: 'Failed to parse response' },
              headers: res.headers,
            });
          }
        });
      });

      req.on('error', () => resolve({ status: 0, body: { error: 'Request failed' } }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ status: 0, body: { error: 'Timeout' } });
      });

      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  async test(name, fn) {
    try {
      await fn();
    } catch (err) {
      this.fail(`${name}: ${err.message}`);
    }
  }

  async runAll() {
    this.title('DOTE ERP SYSTEM - COMPREHENSIVE TEST');

    // Step 1: Health Check
    await this.test('Health Check', async () => {
      const res = await this.makeRequest('GET', 'http://localhost:5000/health');
      if (res.body?.status === 'ok') {
        this.success('Server is running');
      } else {
        this.fail('Server health check failed');
      }
    });

    // Step 2: Admin Login
    await this.test('Admin Login', async () => {
      const res = await this.makeRequest('POST', '/auth/admin/login', {
        email: 'admin@dote.tn.gov.in',
        password: 'Admin@123',
      });
      if (res.body?.success && res.body?.data?.accessToken) {
        this.adminToken = res.body.data.accessToken;
        this.success(`Admin logged in (${res.body.data.user?.role})`);
      } else {
        console.error('Admin login response:', JSON.stringify(res.body, null, 2));
        this.fail('Admin login failed');
      }
    });

    // Step 3: Student Login
    await this.test('Student Login', async () => {
      const res = await this.makeRequest('POST', '/auth/login', {
        mobile: '9876543210',
        password: 'Student@123',
      });
      if (res.body?.success && res.body?.data?.accessToken) {
        this.studentToken = res.body.data.accessToken;
        this.success(`Student logged in (${res.body.data.student?.name})`);
      } else {
        console.error('Student login response:', JSON.stringify(res.body, null, 2));
        this.fail('Student login failed');
      }
    });

    // Step 4: Master Data Tests
    this.title('Master Data Endpoints');

    await this.test('Fetch Communities', async () => {
      const res = await this.makeRequest('GET', '/communities');
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} communities found`);
      } else {
        this.fail('Communities endpoint failed');
      }
    });

    await this.test('Fetch Districts', async () => {
      const res = await this.makeRequest('GET', '/districts');
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} districts found`);
      } else {
        this.fail('Districts endpoint failed');
      }
    });

    await this.test('Fetch Castes', async () => {
      const res = await this.makeRequest('GET', '/castes');
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} castes found`);
      } else {
        this.fail('Castes endpoint failed');
      }
    });

    await this.test('Fetch Academic Years', async () => {
      const res = await this.makeRequest('GET', '/academic-years');
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} academic years found`);
      } else {
        this.fail('Academic years endpoint failed');
      }
    });

    // Step 5: Student Profile Tests
    this.title('Student Profile Tests');

    await this.test('Get Student Profile', async () => {
      if (!this.studentToken) {
        this.fail('No student token available');
        return;
      }
      const res = await this.makeRequest('GET', '/profile', null, this.studentToken);
      if (res.body?.success && res.body?.data?.student_id) {
        this.success(`Profile retrieved: ${res.body.data.name}`);
      } else {
        this.fail('Profile retrieval failed');
      }
    });

    // Step 6: Student Application Tests
    this.title('Student Application Tests');

    let appId = null;
    await this.test('Get Student Applications', async () => {
      if (!this.studentToken) {
        this.fail('No student token available');
        return;
      }
      const res = await this.makeRequest('GET', '/applications', null, this.studentToken);
      if (res.body?.success && Array.isArray(res.body?.data)) {
        if (res.body.data.length > 0) appId = res.body.data[0].application_id;
        this.success(`${res.body.data.length} applications found`);
      } else {
        this.fail('Applications list failed');
      }
    });

    await this.test('Create Draft Application', async () => {
      if (!this.studentToken) {
        this.fail('No student token available');
        return;
      }
      const res = await this.makeRequest('POST', '/applications', { year_id: 1 }, this.studentToken);
      if (res.body?.success) {
        this.success(`Application created: ${res.body.data?.application_no || 'Draft'}`);
      } else {
        this.fail('Application creation failed');
      }
    });

    if (appId) {
      await this.test('Get Specific Application', async () => {
        if (!this.studentToken) {
          this.fail('No student token available');
          return;
        }
        const res = await this.makeRequest('GET', `/applications/${appId}`, null, this.studentToken);
        if (res.body?.success && res.body?.data?.application_id) {
          this.success(`Application ${appId} retrieved: ${res.body.data.status}`);
        } else {
          this.fail(`Application ${appId} retrieval failed`);
        }
      });
    }

    // Step 7: Admin Dashboard Tests
    this.title('Admin Dashboard Tests');

    await this.test('Admin Dashboard Stats', async () => {
      if (!this.adminToken) {
        this.fail('No admin token available');
        return;
      }
      const res = await this.makeRequest('GET', '/admin/dashboard/stats', null, this.adminToken);
      if (res.body?.success && res.body?.data?.counters) {
        const c = res.body.data.counters;
        this.success(`Dashboard: ${c.totalApps} apps, ${c.pendingPayments} pending, ${c.verified} verified`);
      } else {
        this.fail('Dashboard stats failed');
      }
    });

    // Step 8: Admin Master Data Tests
    this.title('Admin Master Data Tests');

    await this.test('Admin Get Colleges', async () => {
      if (!this.adminToken) {
        this.fail('No admin token available');
        return;
      }
      const res = await this.makeRequest('GET', '/admin/colleges', null, this.adminToken);
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} colleges available`);
      } else {
        this.fail('Colleges list failed');
      }
    });

    await this.test('Admin Get Users', async () => {
      if (!this.adminToken) {
        this.fail('No admin token available');
        return;
      }
      const res = await this.makeRequest('GET', '/admin/users', null, this.adminToken);
      if (res.body?.success && Array.isArray(res.body?.data)) {
        this.success(`${res.body.data.length} staff users found`);
      } else {
        this.fail('Users list failed');
      }
    });

    // Step 9: Reports Tests
    this.title('Reports & Exports');

    await this.test('Get Application Report', async () => {
      if (!this.adminToken) {
        this.fail('No admin token available');
        return;
      }
      const res = await this.makeRequest('GET', '/admin/reports/applications?page=1&limit=10', null, this.adminToken);
      if (res.body?.success) {
        this.success(`Report generated: ${res.body.data?.length || 0} records`);
      } else {
        this.fail('Report generation failed');
      }
    });

    // Step 10: Security Tests
    this.title('Security Tests');

    await this.test('Deny Invalid Token Access', async () => {
      const res = await this.makeRequest('GET', '/admin/dashboard/stats', null, 'invalid-token');
      if (!res.body?.success) {
        this.success('Invalid token correctly rejected');
      } else {
        this.fail('Invalid token was not rejected');
      }
    });

    await this.test('Deny Student Access to Admin Endpoints', async () => {
      if (!this.studentToken) {
        this.fail('No student token available');
        return;
      }
      const res = await this.makeRequest('GET', '/admin/dashboard/stats', null, this.studentToken);
      if (!res.body?.success) {
        this.success('Student correctly denied admin access');
      } else {
        this.fail('Role-based access control failed');
      }
    });

    // Summary
    this.title('Test Summary');
    const total = this.passed + this.failed;
    const percentage = total > 0 ? Math.round((this.passed / total) * 100) : 0;
    
    console.log(`\n${colors.green}✓ Passed: ${this.passed}${colors.reset}`);
    console.log(`${colors.red}✗ Failed: ${this.failed}${colors.reset}`);
    console.log(`\n${colors.blue}Overall: ${percentage}% Successful (${this.passed}/${total} tests)${colors.reset}\n`);

    if (this.failed === 0) {
      console.log(`${colors.green}🎉 ALL TESTS PASSED - SYSTEM IS PRODUCTION READY!${colors.reset}\n`);
      process.exit(0);
    } else {
      console.log(`${colors.yellow}⚠️  Please fix ${this.failed} failing test(s) before deployment${colors.reset}\n`);
      process.exit(1);
    }
  }
}

// Run tests
const runner = new TestRunner();
runner.runAll().catch(console.error);
