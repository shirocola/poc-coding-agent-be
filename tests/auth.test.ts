import request from 'supertest';
import { app } from '../src/app';

describe('Auth API', () => {
  describe('POST /auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test.user@company.com',
        password: 'SecurePass123!',
        firstName: 'Test',
        lastName: 'User',
        employeeId: 'TEST001',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('tokens');
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.firstName).toBe(userData.firstName);
      expect(response.body.data.user.lastName).toBe(userData.lastName);
      expect(response.body.data.user.employeeId).toBe(userData.employeeId);
      expect(response.body.data.tokens).toHaveProperty('accessToken');
      
      // Should not return password
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@company.com',
          // missing other required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('required');
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        email: 'john.doe@company.com', // This email already exists in demo data
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Duplicate',
        employeeId: 'DUP001',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('already exists');
    });

    it('should return 400 for weak password', async () => {
      const userData = {
        email: 'weak.password@company.com',
        password: '123', // Weak password
        firstName: 'Weak',
        lastName: 'Password',
        employeeId: 'WEAK001',
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('security requirements');
    });
  });
});