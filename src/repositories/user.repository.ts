import { User, UserLogin, UserRole } from '@/models';
import { generateId, PasswordUtils } from '@/utils';

/**
 * In-memory user repository for demo purposes
 * In a real application, this would connect to a database
 */
export class UserRepository {
  private users: User[] = [];

  constructor() {
    // Initialize with demo data
    this.initializeDemoData();
  }

  private async initializeDemoData(): Promise<void> {
    const demoUsers: Omit<User, 'id' | 'password' | 'createdAt' | 'updatedAt'>[] = [
      {
        email: 'john.doe@company.com',
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP001',
        role: UserRole.EMPLOYEE,
        isActive: true,
      },
      {
        email: 'jane.smith@company.com',
        firstName: 'Jane',
        lastName: 'Smith',
        employeeId: 'EMP002',
        role: UserRole.EMPLOYEE,
        isActive: true,
      },
      {
        email: 'admin@company.com',
        firstName: 'Admin',
        lastName: 'User',
        employeeId: 'ADM001',
        role: UserRole.ADMIN,
        isActive: true,
      },
    ];

    for (const userData of demoUsers) {
      const hashedPassword = await PasswordUtils.hashPassword('password123');
      this.users.push({
        ...userData,
        id: generateId(),
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmployeeId(employeeId: string): Promise<User | null> {
    return this.users.find(user => user.employeeId === employeeId) || null;
  }

  async create(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);
    return user;
  }

  async update(id: string, updates: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return null;

    this.users[userIndex] = {
      ...this.users[userIndex],
      ...updates,
      updatedAt: new Date(),
    };

    return this.users[userIndex];
  }

  async delete(id: string): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id);
    if (userIndex === -1) return false;

    this.users.splice(userIndex, 1);
    return true;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }
}
